// IMPORTANT: Based on Replit Auth blueprint (javascript_log_in_with_replit)
import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { Client } from "@replit/object-storage";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import type { User } from "@shared/schema";
import { generateAssemblyMinutesPDF } from "./pdfGenerator";
import {
  sendEmail,
  createNovaAssembleiaEmail,
  createAtaDisponivelEmail,
  createProcuracaoRecebidaEmail,
} from "./emailService";
import {
  insertAssemblySchema,
  insertVotingItemSchema,
  insertVoteSchema,
  insertDocumentSchema,
  insertCmsContentSchema,
  insertProxySchema,
} from "@shared/schema";

// Setup multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Auth middleware - adapters for requireAuth and requireAdmin
import type { NextFunction } from "express";

// Helper to get userId from passport user claims
function getUserId(req: any): string {
  return req.user?.claims?.sub;
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  return isAuthenticated(req, res, next);
}

async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  return isAuthenticated(req, res, async () => {
    const user = req.user as any;
    const userId = user.claims.sub;

    const dbUser = await storage.getUser(userId);
    if (!dbUser?.isAdmin) {
      return res.status(403).json({ message: "403: Forbidden - Admin access required" });
    }
    next();
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup Replit Auth (replaces manual OIDC setup)
  await setupAuth(app);

  // Debug endpoint (admin only, development only)
  app.get('/__debug', requireAdmin, (_req, res) => {
    if (process.env.NODE_ENV !== 'development') {
      return res.status(404).send('Not found');
    }
    const pkg = require('../package.json');
    res.type('html').send(`
      <h1>Bureau Social — Debug</h1>
      <pre>${JSON.stringify({
        env: Object.keys(process.env),
        node: process.version,
        deps: pkg.dependencies
      }, null, 2)}</pre>
    `);
  });

  // Auth user endpoint
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // ============================================================================
  // DASHBOARD
  // ============================================================================

  app.get("/api/dashboard/summary", requireAuth, async (req: Request, res: Response) => {
    try {
      const upcomingAssemblies = await storage.getUpcomingAssemblies();
      const openVotingItems = await storage.getOpenVotingItems();
      const documents = await storage.getAllDocuments();
      const notifications = await storage.getUserNotifications(getUserId(req));

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
        createdBy: getUserId(req),
      });

      res.status(201).json(assembly);

      // Enviar emails de forma assíncrona (fire-and-forget)
      setImmediate(async () => {
        try {
          const users = await storage.getAllUsers();
          await Promise.all(
            users.map(async (user) => {
              if (user.email) {
                try {
                  const emailHtml = createNovaAssembleiaEmail(
                    `${user.firstName} ${user.lastName}`,
                    {
                      titulo: assembly.titulo,
                      dataHora: assembly.dataAssembleia,
                      localizacao: assembly.local || '',
                      descricao: assembly.convocatoria || undefined,
                    }
                  );
                  await sendEmail({
                    to: user.email,
                    subject: `Nova Assembleia: ${assembly.titulo}`,
                    html: emailHtml,
                  });
                } catch (emailError) {
                  console.error(`Erro ao enviar email para ${user.email}:`, emailError);
                }
              }
            })
          );
          console.log(`Emails enviados para ${users.length} associados sobre nova assembleia`);
        } catch (error) {
          console.error('Erro geral ao enviar emails de nova assembleia:', error);
        }
      });
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
  // PROXIES (Procurações)
  // ============================================================================

  // Create or revoke proxy
  app.post("/api/assemblies/:id/proxies", requireAuth, async (req: Request, res: Response) => {
    try {
      const assemblyId = parseInt(req.params.id);
      const userId = getUserId(req);
      const { receiverId, action } = req.body; // action: 'create' or 'revoke'

      // Check if assembly exists
      const assembly = await storage.getAssemblyById(assemblyId);
      if (!assembly) {
        return res.status(404).json({ message: "Assembly not found" });
      }

      if (action === 'revoke') {
        // Revoke existing proxy
        const existingProxy = await storage.getActiveProxyForUser(assemblyId, userId);
        if (!existingProxy) {
          return res.status(404).json({ message: "No active proxy found" });
        }

        const revokedProxy = await storage.revokeProxy(existingProxy.id);
        return res.json({ message: "Proxy revoked successfully", proxy: revokedProxy });
      }

      // Create new proxy
      if (!receiverId) {
        return res.status(400).json({ message: "receiverId is required" });
      }

      // Check if user is trying to delegate to themselves
      if (receiverId === userId) {
        return res.status(400).json({ message: "Cannot delegate to yourself" });
      }

      // Check for existing active proxy
      const existingProxy = await storage.getActiveProxyForUser(assemblyId, userId);
      if (existingProxy) {
        return res.status(400).json({ message: "You already have an active proxy for this assembly" });
      }

      // Check for proxy loops
      const hasLoop = await storage.checkProxyLoop(assemblyId, userId, receiverId);
      if (hasLoop) {
        return res.status(400).json({ message: "Proxy loop detected. This would create a circular delegation." });
      }

      // Create the proxy
      const proxyData = insertProxySchema.parse({
        assemblyId,
        giverId: userId,
        receiverId,
        status: 'ativa',
      });

      const proxy = await storage.createProxy(proxyData);

      res.status(201).json(proxy);

      // Enviar email de forma assíncrona (fire-and-forget)
      setImmediate(async () => {
        try {
          const giver = await storage.getUser(userId);
          const receiver = await storage.getUser(receiverId);
          if (receiver?.email && giver) {
            const emailHtml = createProcuracaoRecebidaEmail(
              `${receiver.firstName} ${receiver.lastName}`,
              `${giver.firstName} ${giver.lastName}`,
              {
                titulo: assembly.titulo,
                dataHora: assembly.dataAssembleia,
              }
            );
            await sendEmail({
              to: receiver.email,
              subject: `Nova Procuração Recebida - ${assembly.titulo}`,
              html: emailHtml,
            });
          }
        } catch (emailError) {
          console.error('Erro ao enviar email de procuração:', emailError);
        }
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to manage proxy" });
    }
  });

  // Get my proxies (given and received)
  app.get("/api/assemblies/:id/my-proxies", requireAuth, async (req: Request, res: Response) => {
    try {
      const assemblyId = parseInt(req.params.id);
      const userId = getUserId(req);

      // Get proxy I gave
      const givenProxy = await storage.getActiveProxyForUser(assemblyId, userId);

      // Get proxies I received
      const receivedProxies = await storage.getProxiesReceivedByUser(assemblyId, userId);

      // Get user details for each proxy
      const receivedProxiesWithDetails = await Promise.all(
        receivedProxies.map(async (proxy) => {
          const giver = await storage.getUser(proxy.giverId);
          return {
            ...proxy,
            giverName: giver ? `${giver.firstName} ${giver.lastName}` : 'Unknown',
          };
        })
      );

      let givenProxyWithDetails = null;
      if (givenProxy) {
        const receiver = await storage.getUser(givenProxy.receiverId);
        givenProxyWithDetails = {
          ...givenProxy,
          receiverName: receiver ? `${receiver.firstName} ${receiver.lastName}` : 'Unknown',
        };
      }

      res.json({
        given: givenProxyWithDetails,
        received: receivedProxiesWithDetails,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch proxies" });
    }
  });

  // Get all proxies for an assembly (admin only - includes revoked for auditing)
  app.get("/api/assemblies/:id/proxies", requireAdmin, async (req: Request, res: Response) => {
    try {
      const assemblyId = parseInt(req.params.id);
      // Include revoked proxies for admin auditing
      const proxies = await storage.getProxiesByAssembly(assemblyId, true);

      // Enrich with user details
      const proxiesWithDetails = await Promise.all(
        proxies.map(async (proxy) => {
          const giver = await storage.getUser(proxy.giverId);
          const receiver = await storage.getUser(proxy.receiverId);
          return {
            ...proxy,
            giverName: giver ? `${giver.firstName} ${giver.lastName}` : 'Unknown',
            receiverName: receiver ? `${receiver.firstName} ${receiver.lastName}` : 'Unknown',
          };
        })
      );

      res.json(proxiesWithDetails);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch proxies" });
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
      const userId = getUserId(req);

      // Check if user already voted
      const existingVote = await storage.getUserVote(data.votingItemId!, userId);
      if (existingVote) {
        return res.status(400).json({ message: "You have already voted on this item" });
      }

      // Get voting item to find assembly ID
      const votingItem = await storage.getVotingItemById(data.votingItemId!);
      if (!votingItem) {
        return res.status(404).json({ message: "Voting item not found" });
      }

      // Check if user has delegated their vote via proxy
      const activeProxy = await storage.getActiveProxyForUser(votingItem.assemblyId!, userId);
      if (activeProxy) {
        return res.status(400).json({ 
          message: "Não pode votar porque delegou o seu voto. Revogue a procuração para poder votar." 
        });
      }

      const vote = await storage.createVote({
        ...data,
        userId,
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

      // Get voting item to find assembly ID
      const votingItem = await storage.getVotingItemById(id);
      if (!votingItem) {
        return res.status(404).json({ message: "Voting item not found" });
      }

      // Get active proxies for this assembly
      const proxies = await storage.getProxiesByAssembly(votingItem.assemblyId!, false);

      // Calculate results with proxy votes
      const results = votes.reduce((acc, vote) => {
        const voto = vote.voto.toLowerCase();

        // Base vote count (1 for the voter themselves)
        let voteWeight = 1;

        // Add proxy votes (votes from people who delegated to this voter)
        const receivedProxies = proxies.filter(p => p.receiverId === vote.userId);
        voteWeight += receivedProxies.length;

        acc[voto] = (acc[voto] || 0) + voteWeight;
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
        uploadedBy: getUserId(req),
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
        owner: getUserId(req),
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
        uploadedBy: getUserId(req),
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

        // Security: Normalize and validate path to prevent traversal attacks
        const publicDir = path.join(process.cwd(), 'public');
        // Remove leading slash to prevent path.join from treating it as absolute
        const relativePath = document.filePath.replace(/^\/+/, '');
        const requestedPath = path.join(publicDir, relativePath);
        const resolvedPath = path.resolve(requestedPath);

        // Ensure the resolved path is still within the public directory
        if (!resolvedPath.startsWith(publicDir)) {
          return res.status(403).json({ message: "Access denied" });
        }

        if (!fs.existsSync(resolvedPath)) {
          return res.status(404).json({ message: "File not found" });
        }

        const mimeType = document.tipo === 'pdf' 
          ? 'application/pdf' 
          : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

        res.setHeader('Content-Type', mimeType);
        res.setHeader('Content-Disposition', `attachment; filename="${document.titulo}.${document.tipo}"`);
        return res.sendFile(resolvedPath);
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

  // Update document metadata
  app.put("/api/documents/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { titulo, tipo, categoria, visivelPara, assemblyId } = req.body;

      const document = await storage.getDocumentById(id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      const updated = await storage.updateDocument(id, {
        titulo,
        tipo,
        categoria: categoria || null,
        visivelPara,
        assemblyId: assemblyId ? parseInt(assemblyId) : null,
      });

      res.json(updated);
    } catch (error: any) {
      console.error("Document update error:", error);
      res.status(500).json({ message: error.message || "Failed to update document" });
    }
  });

  // Delete document
  app.delete("/api/documents/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getDocumentById(id);

      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      // Delete file from object storage if it's not a local file
      if (!document.filePath.startsWith('/documents/')) {
        const objStorage = new Client();
        const deleteResult = await objStorage.delete(document.filePath);

        if (!deleteResult.ok) {
          console.warn(`Failed to delete file from storage: ${deleteResult.error}`);
        }
      }

      // Delete document record
      await storage.deleteDocument(id);

      res.status(204).send();
    } catch (error: any) {
      console.error("Document delete error:", error);
      res.status(500).json({ message: error.message || "Failed to delete document" });
    }
  });

  // ============================================================================
  // NOTIFICATIONS
  // ============================================================================

  app.get("/api/notifications", requireAuth, async (req: Request, res: Response) => {
    try {
      const notifications = await storage.getUserNotifications(getUserId(req));
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

  // Public CMS endpoint for landing page (no auth required)
  app.get("/api/public/cms/:sectionKey", async (req: Request, res: Response) => {
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

  // Private CMS endpoint for authenticated users
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
        updatedBy: getUserId(req),
      });

      res.json(content);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to update CMS content" });
    }
  });

  // ============================================================================
  // USERS (Admin only)
  // ============================================================================

  // List users for proxy delegation (authenticated users only, limited data)
  app.get("/api/users/for-proxy", requireAuth, async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      // Return only safe fields for proxy selection
      const safeUsers = users.map(u => ({
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        name: `${u.firstName} ${u.lastName}`,
      }));
      res.json(safeUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

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
      const alreadyConfirmed = existingPresences.find(p => p.userId === getUserId(req));

      if (alreadyConfirmed) {
        return res.status(400).json({ message: "Presence already confirmed" });
      }

      const presence = await storage.createPresence({
        assemblyId,
        userId: getUserId(req),
        presente: true,
      });

      res.status(201).json(presence);
    } catch (error) {
      res.status(500).json({ message: "Failed to confirm presence" });
    }
  });

  // ============================================================================
  // MINUTES GENERATION (Atas)
  // ============================================================================

  app.get("/api/assemblies/:id/download-minutes", requireAuth, async (req: Request, res: Response) => {
    try {
      const assemblyId = parseInt(req.params.id);

      // Find the minutes document for this assembly
      const documents = await storage.getDocumentsByAssembly(assemblyId);
      const minutesDoc = documents.find(doc => doc.tipo === 'ata');

      if (!minutesDoc || !minutesDoc.filePath) {
        return res.status(404).json({ message: "Minutes not found" });
      }

      // Download from Object Storage
      const client = new Client();
      const result = await client.downloadAsBytes(minutesDoc.filePath);

      if (!result.ok) {
        throw new Error(`Download failed: ${result.error}`);
      }

      // Send PDF - result.value is a tuple [buffer, metadata]
      const [fileBytes] = result.value;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${minutesDoc.titulo}.pdf"`);
      res.send(fileBytes);
    } catch (error) {
      console.error("Minutes download error:", error);
      res.status(500).json({ message: "Failed to download minutes" });
    }
  });

  async function requireAdminOrDirecao(req: Request, res: Response, next: NextFunction) {
    return isAuthenticated(req, res, async () => {
      const user = req.user as any;
      const userId = user.claims.sub;

      const dbUser = await storage.getUser(userId);

      if (!dbUser?.isAdmin && !dbUser?.isDirecao) {
        return res.status(403).json({ message: "403: Forbidden - Admin or Direção access required" });
      }
      next();
    });
  }

  app.post("/api/assemblies/:id/generate-minutes", requireAdminOrDirecao, async (req: Request, res: Response) => {
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
            const user = await storage.getUser(p.userId || '');
            const role = user?.isAdmin ? 'Administrador' : user?.isDirecao ? 'Direção' : 'Associado';
            return {
              userId: p.userId || '',
              name: user ? `${user.firstName} ${user.lastName}` : p.userId || 'Desconhecido',
              email: user?.email || '',
              role,
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

      // Generate PDF
      const pdfBuffer = await generateAssemblyMinutesPDF({
        assembly,
        attendees: attendeesWithDetails,
        votingResults,
      });

      // Upload PDF to Object Storage
      const client = new Client();
      const filename = `ata-${assemblyId}-${Date.now()}.pdf`;
      const privatePath = `${process.env.PRIVATE_OBJECT_DIR}/${filename}`;

      const uploadResult = await client.uploadFromBytes(privatePath, pdfBuffer);

      if (!uploadResult.ok) {
        throw new Error(`PDF upload failed: ${uploadResult.error}`);
      }

      // Create document record for the PDF
      const document = await storage.createDocument({
        titulo: `Ata - ${assembly.titulo}`,
        tipo: 'ata',
        assemblyId,
        filePath: privatePath,
        uploadedBy: getUserId(req),
      });

      // Mark assembly as having minutes
      await storage.updateAssembly(assemblyId, {
        ataGerada: true,
      });

      res.json({ 
        success: true, 
        document,
        message: 'Ata gerada com sucesso',
      });

      // Enviar emails de forma assíncrona (fire-and-forget)
      setImmediate(async () => {
        try {
          const users = await storage.getAllUsers();
          await Promise.all(
            users.map(async (user) => {
              if (user.email) {
                try {
                  const emailHtml = createAtaDisponivelEmail(
                    `${user.firstName} ${user.lastName}`,
                    {
                      titulo: assembly.titulo,
                      dataHora: assembly.dataAssembleia,
                    }
                  );
                  await sendEmail({
                    to: user.email,
                    subject: `Ata Disponível - ${assembly.titulo}`,
                    html: emailHtml,
                  });
                } catch (emailError) {
                  console.error(`Erro ao enviar email para ${user.email}:`, emailError);
                }
              }
            })
          );
          console.log(`Emails enviados para ${users.length} associados sobre ata disponível`);
        } catch (error) {
          console.error('Erro geral ao enviar emails de ata disponível:', error);
        }
      });
    } catch (error) {
      console.error("Minutes generation error:", error);
      res.status(500).json({ message: "Failed to generate minutes" });
    }
  });

  // ============================================================================
  // ADMIN - USER MANAGEMENT
  // ============================================================================

  app.get("/api/admin/users", requireAdmin, async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.patch("/api/admin/users/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const userId = req.params.id;
      const updates = req.body;

      // Validate that we're not allowing dangerous updates
      const allowedFields = ['categoria', 'numeroSocio', 'telefone', 'isAdmin', 'isDirecao'];
      const filteredUpdates: any = {};

      for (const field of allowedFields) {
        if (field in updates) {
          filteredUpdates[field] = updates[field];
        }
      }

      const updatedUser = await storage.updateUser(userId, filteredUpdates);

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Email broadcast to members
  app.post("/api/admin/email/broadcast", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { subject, html, segmento = "todos", testePara } = req.body;

      if (!subject || !html) {
        return res.status(400).json({ message: "Subject e HTML são obrigatórios" });
      }

      // Send test email only
      if (testePara) {
        await sendEmail({ to: testePara, subject, html });
        return res.json({ preview: true, message: "Email de teste enviado" });
      }

      // Get all users
      const allUsers = await storage.getAllUsers();

      // Filter based on segment (and ensure email exists)
      const destinatarios = allUsers.filter(u => {
        if (!u.email) return false;
        if (segmento === "direcao") return u.isDirecao;
        if (segmento === "admin") return u.isAdmin;
        if (segmento === "ativos") return u.ativo;
        if (segmento === "contribuinte") return u.categoria === "contribuinte";
        if (segmento === "fundador") return u.categoria === "fundador";
        return true; // todos
      });

      // Send emails asynchronously in batches
      const batchSize = 50;
      let sentCount = 0;
      let errorCount = 0;

      setImmediate(async () => {
        try {
          for (let i = 0; i < destinatarios.length; i += batchSize) {
            const batch = destinatarios.slice(i, i + batchSize);

            await Promise.all(
              batch.map(async (user) => {
                try {
                  await sendEmail({ 
                    to: user.email!, 
                    subject, 
                    html 
                  });
                  sentCount++;
                } catch (error) {
                  console.error(`Erro ao enviar email para ${user.email}:`, error);
                  errorCount++;
                }
              })
            );
          }
          console.log(`Broadcast concluído: ${sentCount} enviados, ${errorCount} erros`);
        } catch (error) {
          console.error('Erro geral ao enviar broadcast:', error);
        }
      });

      res.json({ 
        total: destinatarios.length,
        message: `Enviando emails para ${destinatarios.length} destinatários...`
      });
    } catch (error: any) {
      console.error("Email broadcast error:", error);
      res.status(500).json({ message: error.message || "Failed to send broadcast" });
    }
  });

  // ============================================================================
  // PUBLIC ENDPOINTS - Inscrição
  // ============================================================================

  app.post('/api/public/inscricao', async (req, res) => {
    const { firstName, lastName, email, telefone, categoria, motivacao } = req.body;

    try {
      // Enviar email para admin
      const admins = await storage.getAdmins(); // Assuming storage has a getAdmins function

      for (const admin of admins) {
        await sendEmail({
          to: admin.email!,
          subject: 'Nova Inscrição de Associado',
          html: `
            <h2>Nova Inscrição Recebida</h2>
            <p><strong>Nome:</strong> ${firstName} ${lastName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Telefone:</strong> ${telefone || 'Não fornecido'}</p>
            <p><strong>Categoria:</strong> ${categoria}</p>
            <p><strong>Motivação:</strong></p>
            <p>${motivacao || 'Não fornecida'}</p>
          `
        });
      }

      // Enviar email de confirmação para o candidato
      await sendEmail({
        to: email,
        subject: 'Inscrição Recebida - Bureau Social',
        html: `
          <h2>Obrigado pela sua inscrição!</h2>
          <p>Olá ${firstName},</p>
          <p>Recebemos a sua candidatura para se tornar associado do Bureau Social.</p>
          <p>Entraremos em contacto em breve com mais informações.</p>
          <br>
          <p>Atenciosamente,<br>Bureau Social</p>
        `
      });

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============================================================================
  // ADMIN ENDPOINTS
  // ============================================================================

  const httpServer = createServer(app);
  return httpServer;
}