// IMPORTANT: Based on Replit Auth blueprint (javascript_log_in_with_replit)
import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import createMemoryStore from "memorystore";
import * as oidc from "openid-client";
import multer from "multer";
import { Client } from "@replit/object-storage";
import { storage } from "./storage";
import type { User } from "@shared/schema";
import {
  insertAssemblySchema,
  insertVotingItemSchema,
  insertVoteSchema,
  insertDocumentSchema,
  insertCmsContentSchema,
} from "@shared/schema";

// Setup multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

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

  // Upload document file
  app.post("/api/documents/upload", requireAdmin, upload.single('file'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { titulo, tipo, categoria, assemblyId, visivelPara } = req.body;
      
      if (!titulo || !tipo) {
        return res.status(400).json({ message: "Título and tipo are required" });
      }

      // Initialize object storage client
      const objStorage = new Client();
      
      // Generate unique filename
      const timestamp = Date.now();
      const sanitizedFilename = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
      const privateDir = process.env.PRIVATE_OBJECT_DIR || '/.private';
      const objectPath = `${privateDir}/documents/${timestamp}-${sanitizedFilename}`;

      // Upload file to object storage
      const uploadResult = await objStorage.uploadFromBytes(objectPath, req.file.buffer);
      
      if (!uploadResult.ok) {
        throw new Error(`Upload failed: ${uploadResult.error}`);
      }

      // Create object entity record
      await storage.createObjectEntity({
        objectPath,
        owner: req.session.userId,
        visibility: 'private',
        metadata: {
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
          size: req.file.size,
        },
      });

      // Create document record
      const document = await storage.createDocument({
        titulo,
        tipo,
        categoria: categoria || null,
        assemblyId: assemblyId ? parseInt(assemblyId) : null,
        filePath: objectPath,
        fileSize: req.file.size,
        visivelPara: visivelPara || 'todos',
        uploadedBy: req.session.userId,
      });

      res.status(201).json(document);
    } catch (error: any) {
      console.error("Document upload error:", error);
      res.status(500).json({ message: error.message || "Failed to upload document" });
    }
  });

  // Download document
  app.get("/api/documents/:id/download", requireAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getDocumentById(id);

      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      // Check if it's a local file path (starts with /documents/)
      if (document.filePath.startsWith('/documents/')) {
        // Serve from local file system (for seeded documents)
        const fs = await import('fs');
        const path = await import('path');
        const filePath = path.join(process.cwd(), 'public', document.filePath);
        
        if (!fs.existsSync(filePath)) {
          return res.status(404).json({ message: "File not found" });
        }
        
        const mimeType = document.tipo === 'pdf' 
          ? 'application/pdf' 
          : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        
        res.setHeader('Content-Type', mimeType);
        res.setHeader('Content-Disposition', `attachment; filename="${document.titulo}.${document.tipo}"`);
        return res.sendFile(filePath);
      }

      // Otherwise, try object storage
      const objStorage = new Client();
      
      // Get file from object storage
      const downloadResult = await objStorage.downloadAsBytes(document.filePath);
      
      if (!downloadResult.ok) {
        return res.status(404).json({ message: "File not found in storage" });
      }
      
      // Get file metadata for mime type
      const objectEntity = await storage.getObjectEntity(document.filePath);
      const mimeType = (objectEntity?.metadata as any)?.mimeType || 'application/octet-stream';

      // downloadAsBytes returns [Buffer] tuple, destructure to get the actual buffer
      const [fileBytes] = downloadResult.value;

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${document.titulo}"`);
      res.send(fileBytes);
    } catch (error: any) {
      console.error("Document download error:", error);
      res.status(500).json({ message: "Failed to download document" });
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

  // ============================================================================
  // PRESENCES (Assembly attendance)
  // ============================================================================

  app.get("/api/assemblies/:id/presences", requireAuth, async (req: Request, res: Response) => {
    try {
      const assemblyId = parseInt(req.params.id);
      const presences = await storage.getPresencesByAssembly(assemblyId);
      res.json(presences);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch presences" });
    }
  });

  app.post("/api/assemblies/:id/presences", requireAuth, async (req: Request, res: Response) => {
    try {
      const assemblyId = parseInt(req.params.id);
      
      // Validate assembly exists
      const assembly = await storage.getAssemblyById(assemblyId);
      if (!assembly) {
        return res.status(404).json({ message: "Assembly not found" });
      }

      // Check if already confirmed
      const existingPresences = await storage.getPresencesByAssembly(assemblyId);
      const alreadyConfirmed = existingPresences.find(p => p.userId === req.session.userId);
      
      if (alreadyConfirmed) {
        return res.status(400).json({ message: "Presence already confirmed" });
      }

      const presence = await storage.createPresence({
        assemblyId,
        userId: req.session.userId!,
        presente: true,
        confirmadoEm: new Date(),
      });

      res.status(201).json(presence);
    } catch (error) {
      res.status(500).json({ message: "Failed to confirm presence" });
    }
  });

  // ============================================================================
  // MINUTES GENERATION (Atas)
  // ============================================================================

  app.post("/api/assemblies/:id/generate-minutes", requireAdmin, async (req: Request, res: Response) => {
    try {
      const assemblyId = parseInt(req.params.id);
      const assembly = await storage.getAssemblyById(assemblyId);

      if (!assembly) {
        return res.status(404).json({ message: "Assembly not found" });
      }

      // Get all related data
      const presences = await storage.getPresencesByAssembly(assemblyId);
      const votingItems = await storage.getVotingItemsByAssembly(assemblyId);

      // Resolve user details for attendees
      const attendeesWithDetails = await Promise.all(
        presences
          .filter(p => p.presente)
          .map(async (p) => {
            const user = await storage.getUser(p.userId);
            return {
              userId: p.userId,
              name: user ? `${user.firstName} ${user.lastName}` : p.userId,
              email: user?.email || '',
              role: user?.role || 'associado',
            };
          })
      );

      // Get vote results for each voting item
      const votingResults = await Promise.all(
        votingItems.map(async (item) => {
          const votes = await storage.getVotesByVotingItem(item.id!);
          const results = votes.reduce((acc, vote) => {
            const voto = vote.voto.toLowerCase();
            acc[voto] = (acc[voto] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          
          return {
            item,
            results,
            totalVotes: votes.length,
          };
        })
      );

      // Generate basic minutes text with participant names
      const minutesText = `
ATA DA ASSEMBLEIA ${assembly.tipo.toUpperCase()}
${assembly.titulo}

Data: ${new Date(assembly.dataAssembleia).toLocaleDateString('pt-PT', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}
Local: ${assembly.local || 'Não especificado'}

PRESENÇAS (${attendeesWithDetails.length}):
${attendeesWithDetails.map(a => `- ${a.name} (${a.email}) - ${a.role}`).join('\n')}

ORDEM DE TRABALHOS:
${assembly.ordemDia || 'Não especificada'}

VOTAÇÕES REALIZADAS:
${votingResults.map((vr, index) => `
${index + 1}. ${vr.item.titulo}
   Descrição: ${vr.item.descricao}
   Resultados:
   - Aprovar: ${vr.results.aprovar || 0}
   - Rejeitar: ${vr.results.rejeitar || 0}
   - Abstenção: ${vr.results.abstencao || 0}
   Total de votos: ${vr.totalVotes}
`).join('\n')}

Ata gerada automaticamente pelo sistema Bureau Social.
`;

      // Create document for the minutes
      const document = await storage.createDocument({
        titulo: `Ata - ${assembly.titulo}`,
        tipo: 'ata',
        assemblyId,
        conteudo: minutesText,
        uploadedBy: req.session.userId,
      });

      // Mark assembly as having minutes
      await storage.updateAssembly(assemblyId, {
        ataGerada: true,
      });

      res.json({ 
        success: true, 
        document,
        minutesText 
      });
    } catch (error) {
      console.error("Minutes generation error:", error);
      res.status(500).json({ message: "Failed to generate minutes" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
