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
      const existingVote = await storage.getUserVote(data.votingItemId!, getUserId(req));
      if (existingVote) {
        return res.status(400).json({ message: "You have already voted on this item" });
      }

      const vote = await storage.createVote({
        ...data,
        userId: getUserId(req),
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
    } catch (error) {
      console.error("Minutes generation error:", error);
      res.status(500).json({ message: "Failed to generate minutes" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
