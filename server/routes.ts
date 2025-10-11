// IMPORTANT: Based on Replit Auth blueprint (javascript_log_in_with_replit)
import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import createMemoryStore from "memorystore";
import * as oidc from "openid-client";
import { storage } from "./storage";
import type { User } from "@shared/schema";
import {
  insertAssemblySchema,
  insertVotingItemSchema,
  insertVoteSchema,
  insertDocumentSchema,
  insertCmsContentSchema,
} from "@shared/schema";

const MemoryStore = createMemoryStore(session);

// Session config
const sessionSettings: session.SessionOptions = {
  secret: process.env.SESSION_SECRET || "bureau-social-secret-key-change-in-production",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  },
  store: new MemoryStore({
    checkPeriod: 86400000, // 24 hours
  }),
};

// Extend session type
declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

// Auth middleware
function requireAuth(req: Request, res: Response, next: Function) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "401: Unauthorized - Authentication required" });
  }
  next();
}

function requireAdmin(req: Request, res: Response, next: Function) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "401: Unauthorized - Authentication required" });
  }
  
  storage.getUser(req.session.userId).then((user) => {
    if (!user?.isAdmin) {
      return res.status(403).json({ message: "403: Forbidden - Admin access required" });
    }
    next();
  }).catch(() => {
    return res.status(500).json({ message: "Internal server error" });
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(session(sessionSettings));

  // ============================================================================
  // REPLIT AUTH SETUP (using openid-client v6)
  // ============================================================================
  
  let oidcConfig: any = null;
  const codeVerifiers = new Map<string, string>();

  const initOidc = async () => {
    try {
      const issuerUrl = new URL(process.env.ISSUER_URL || "https://auth.replit.com");
      const clientId = process.env.REPL_ID || "";
      
      oidcConfig = await oidc.discovery(issuerUrl, clientId);
      console.log("OIDC initialized successfully");
    } catch (error) {
      console.error("Failed to initialize OIDC:", error);
    }
  };

  await initOidc();

  // Auth routes
  app.get("/api/login", async (req: Request, res: Response) => {
    if (!oidcConfig) {
      return res.status(500).json({ message: "Auth not configured" });
    }

    try {
      const state = Math.random().toString(36).substring(7);
      const codeVerifier = oidc.randomPKCECodeVerifier();
      const codeChallenge = await oidc.calculatePKCECodeChallenge(codeVerifier);
      
      codeVerifiers.set(state, codeVerifier);

      const authUrl = oidc.buildAuthorizationUrl(oidcConfig, {
        redirect_uri: `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co/api/auth/callback`,
        scope: "openid email profile",
        state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
      });

      res.redirect(authUrl.href);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Failed to initiate login" });
    }
  });

  app.get("/api/auth/callback", async (req: Request, res: Response) => {
    if (!oidcConfig) {
      return res.status(500).json({ message: "Auth not configured" });
    }

    try {
      const currentUrl = new URL(
        req.url,
        `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`
      );
      
      const state = req.query.state as string;
      const codeVerifier = codeVerifiers.get(state);
      
      if (!codeVerifier) {
        return res.redirect("/?error=invalid_state");
      }

      const tokens = await oidc.authorizationCodeGrant(oidcConfig, currentUrl, {
        pkceCodeVerifier: codeVerifier,
        expectedState: state,
      });

      codeVerifiers.delete(state);

      const userInfo = await oidc.fetchUserInfo(oidcConfig, tokens.access_token);

      // Upsert user
      const user = await storage.upsertUser({
        id: userInfo.sub as string,
        email: userInfo.email as string,
        firstName: userInfo.given_name as string,
        lastName: userInfo.family_name as string,
        profileImageUrl: userInfo.picture as string,
      });

      req.session.userId = user.id;
      res.redirect("/dashboard");
    } catch (error) {
      console.error("Auth callback error:", error);
      res.redirect("/?error=auth_failed");
    }
  });

  app.get("/api/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.redirect("/");
    });
  });

  app.get("/api/auth/user", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "401: Unauthorized - Not logged in" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  });

  // ============================================================================
  // DASHBOARD
  // ============================================================================

  app.get("/api/dashboard/summary", requireAuth, async (req: Request, res: Response) => {
    try {
      const upcomingAssemblies = await storage.getUpcomingAssemblies();
      const openVotingItems = await storage.getOpenVotingItems();
      const documents = await storage.getAllDocuments();
      const notifications = await storage.getUserNotifications(req.session.userId!);

      res.json({
        upcomingAssemblies: upcomingAssemblies.length,
        pendingVotes: openVotingItems.length,
        recentDocuments: documents.slice(0, 5).length,
        unreadNotifications: notifications.filter(n => !n.lida).length,
        assemblies: upcomingAssemblies.slice(0, 3),
        votingItems: openVotingItems.slice(0, 3),
        documents: documents.slice(0, 5),
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard summary" });
    }
  });

  // ============================================================================
  // ASSEMBLIES
  // ============================================================================

  app.get("/api/assemblies", requireAuth, async (req: Request, res: Response) => {
    try {
      const assemblies = await storage.getAllAssemblies();
      res.json(assemblies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch assemblies" });
    }
  });

  app.get("/api/assemblies/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const assembly = await storage.getAssemblyById(id);
      
      if (!assembly) {
        return res.status(404).json({ message: "Assembly not found" });
      }

      res.json(assembly);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch assembly" });
    }
  });

  app.post("/api/assemblies", requireAdmin, async (req: Request, res: Response) => {
    try {
      const data = insertAssemblySchema.parse(req.body);
      const assembly = await storage.createAssembly({
        ...data,
        createdBy: req.session.userId,
      });

      res.status(201).json(assembly);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create assembly" });
    }
  });

  app.put("/api/assemblies/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const assembly = await storage.updateAssembly(id, req.body);

      if (!assembly) {
        return res.status(404).json({ message: "Assembly not found" });
      }

      res.json(assembly);
    } catch (error) {
      res.status(500).json({ message: "Failed to update assembly" });
    }
  });

  // ============================================================================
  // VOTING ITEMS
  // ============================================================================

  app.get("/api/voting-items", requireAuth, async (req: Request, res: Response) => {
    try {
      const votingItems = await storage.getAllVotingItems();
      res.json(votingItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch voting items" });
    }
  });

  app.get("/api/voting-items/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const item = await storage.getVotingItemById(id);

      if (!item) {
        return res.status(404).json({ message: "Voting item not found" });
      }

      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch voting item" });
    }
  });

  app.post("/api/voting-items", requireAdmin, async (req: Request, res: Response) => {
    try {
      const data = insertVotingItemSchema.parse(req.body);
      const item = await storage.createVotingItem(data);

      res.status(201).json(item);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create voting item" });
    }
  });

  // ============================================================================
  // VOTES
  // ============================================================================

  app.post("/api/votes", requireAuth, async (req: Request, res: Response) => {
    try {
      const data = insertVoteSchema.parse(req.body);

      // Check if user already voted
      const existingVote = await storage.getUserVote(data.votingItemId!, req.session.userId!);
      if (existingVote) {
        return res.status(400).json({ message: "You have already voted on this item" });
      }

      const vote = await storage.createVote({
        ...data,
        userId: req.session.userId,
        ipAddress: req.ip,
      });

      res.status(201).json(vote);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create vote" });
    }
  });

  app.get("/api/voting-items/:id/results", requireAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const votes = await storage.getVotesByVotingItem(id);

      const results = votes.reduce((acc, vote) => {
        const voto = vote.voto.toLowerCase();
        acc[voto] = (acc[voto] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch voting results" });
    }
  });

  // ============================================================================
  // DOCUMENTS
  // ============================================================================

  app.get("/api/documents", requireAuth, async (req: Request, res: Response) => {
    try {
      const documents = await storage.getAllDocuments();
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.get("/api/documents/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getDocumentById(id);

      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      res.json(document);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch document" });
    }
  });

  app.post("/api/documents", requireAdmin, async (req: Request, res: Response) => {
    try {
      const data = insertDocumentSchema.parse(req.body);
      const document = await storage.createDocument({
        ...data,
        uploadedBy: req.session.userId,
      });

      res.status(201).json(document);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create document" });
    }
  });

  // ============================================================================
  // NOTIFICATIONS
  // ============================================================================

  app.get("/api/notifications", requireAuth, async (req: Request, res: Response) => {
    try {
      const notifications = await storage.getUserNotifications(req.session.userId!);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.put("/api/notifications/:id/read", requireAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.markNotificationAsRead(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // ============================================================================
  // CMS CONTENT
  // ============================================================================

  app.get("/api/cms/:sectionKey", requireAuth, async (req: Request, res: Response) => {
    try {
      const { sectionKey } = req.params;
      const content = await storage.getCmsContent(sectionKey);

      if (!content) {
        return res.status(404).json({ message: "Content not found" });
      }

      res.json(content);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch CMS content" });
    }
  });

  app.put("/api/cms", requireAdmin, async (req: Request, res: Response) => {
    try {
      const data = insertCmsContentSchema.parse(req.body);
      const content = await storage.upsertCmsContent({
        ...data,
        updatedBy: req.session.userId,
      });

      res.json(content);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to update CMS content" });
    }
  });

  // ============================================================================
  // USERS (Admin only)
  // ============================================================================

  app.get("/api/users", requireAdmin, async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.put("/api/users/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const user = await storage.updateUser(id, req.body);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
