// IMPORTANT: Complete storage interface for Bureau Social
import { db } from "../db";
import {
  users,
  assemblies,
  votingItems,
  votes,
  documents,
  presences,
  notifications,
  cmsContent,
  objectEntities,
  type User,
  type UpsertUser,
  type Assembly,
  type InsertAssembly,
  type VotingItem,
  type InsertVotingItem,
  type Vote,
  type InsertVote,
  type Document,
  type InsertDocument,
  type Presence,
  type InsertPresence,
  type Notification,
  type InsertNotification,
  type CmsContent,
  type InsertCmsContent,
  type ObjectEntity,
  type InsertObjectEntity,
  proxies,
  type Proxy,
  type InsertProxy,
  quotas,
  type Quota,
  type InsertQuota,
} from "@shared/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;

  // Assemblies
  getAllAssemblies(): Promise<Assembly[]>;
  getAssemblyById(id: number): Promise<Assembly | undefined>;
  createAssembly(assembly: InsertAssembly): Promise<Assembly>;
  updateAssembly(id: number, data: Partial<Assembly>): Promise<Assembly | undefined>;
  getUpcomingAssemblies(): Promise<Assembly[]>;

  // Voting Items
  getAllVotingItems(): Promise<VotingItem[]>;
  getVotingItemById(id: number): Promise<VotingItem | undefined>;
  getVotingItemsByAssembly(assemblyId: number): Promise<VotingItem[]>;
  createVotingItem(item: InsertVotingItem): Promise<VotingItem>;
  updateVotingItem(id: number, data: Partial<VotingItem>): Promise<VotingItem | undefined>;
  getOpenVotingItems(): Promise<VotingItem[]>;

  // Votes
  createVote(vote: InsertVote): Promise<Vote>;
  getUserVote(votingItemId: number, userId: string): Promise<Vote | null>;
  getVotesByVotingItem(votingItemId: number): Promise<Vote[]>;

  // Documents
  getAllDocuments(): Promise<Document[]>;
  getDocumentById(id: number): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  getDocumentsByType(type: string): Promise<Document[]>;
  getDocumentsByAssembly(assemblyId: number): Promise<Document[]>;
  updateDocument(id: number, data: Partial<Document>): Promise<Document | undefined>;
  deleteDocument(id: number): Promise<void>;

  // Presences
  createPresence(presence: InsertPresence): Promise<Presence>;
  getPresencesByAssembly(assemblyId: number): Promise<Presence[]>;
  updatePresence(id: number, data: Partial<Presence>): Promise<Presence | undefined>;

  // Notifications
  getUserNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<void>;

  // CMS Content
  getCmsContent(sectionKey: string): Promise<CmsContent | undefined>;
  upsertCmsContent(content: InsertCmsContent): Promise<CmsContent>;

  // Object Storage
  createObjectEntity(entity: InsertObjectEntity): Promise<ObjectEntity>;
  getObjectEntity(objectPath: string): Promise<ObjectEntity | undefined>;

  // Proxies (Procurações)
  createProxy(proxy: InsertProxy): Promise<Proxy>;
  getProxiesByAssembly(assemblyId: number, includeRevoked?: boolean): Promise<Proxy[]>;
  getActiveProxyForUser(assemblyId: number, giverId: string): Promise<Proxy | undefined>;
  getProxiesReceivedByUser(assemblyId: number, receiverId: string): Promise<Proxy[]>;
  revokeProxy(id: number): Promise<Proxy | undefined>;
  checkProxyLoop(assemblyId: number, giverId: string, receiverId: string): Promise<boolean>;

  // Quotas
  getUserQuotas(userId: string): Promise<Quota[]>;
  createQuota(quota: InsertQuota): Promise<Quota>;
  updateQuota(id: number, data: Partial<Quota>): Promise<Quota | undefined>;
  getAllQuotas(): Promise<Quota[]>;
}

export class DbStorage implements IStorage {
  // Quotas
  async getUserQuotas(userId: string): Promise<Quota[]> {
    return await db.select().from(quotas).where(eq(quotas.userId, userId)).orderBy(desc(quotas.year));
  }

  async createQuota(quota: InsertQuota): Promise<Quota> {
    const inserted = await db.insert(quotas).values(quota).returning();
    return inserted[0];
  }

  async updateQuota(id: number, data: Partial<Quota>): Promise<Quota | undefined> {
    const updated = await db
      .update(quotas)
      .set(data)
      .where(eq(quotas.id, id))
      .returning();
    return updated[0];
  }

  async getAllQuotas(): Promise<Quota[]> {
    return await db.select().from(quotas).orderBy(desc(quotas.year));
  }
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async upsertUser(user: UpsertUser): Promise<User> {
    // Try to find existing user by ID first, then by email
    let existing = user.id ? await this.getUser(user.id) : undefined;

    // If not found by ID but email exists, check by email  
    if (!existing && user.email) {
      existing = await this.getUserByEmail(user.email);
    }

    if (existing) {
      const updated = await db
        .update(users)
        .set({ ...user, updatedAt: new Date() })
        .where(eq(users.id, existing.id))
        .returning();
      return updated[0];
    }

    const inserted = await db.insert(users).values(user).returning();
    return inserted[0];
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const updated = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updated[0];
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getAdmins(): Promise<User[]> {
    return await db.select()
      .from(users)
      .where(eq(users.isAdmin, true));
  }

  // Assemblies
  async getAllAssemblies(): Promise<Assembly[]> {
    return await db.select().from(assemblies).orderBy(desc(assemblies.dataAssembleia));
  }

  async getAssemblyById(id: number): Promise<Assembly | undefined> {
    const result = await db.select().from(assemblies).where(eq(assemblies.id, id)).limit(1);
    return result[0];
  }

  async createAssembly(assembly: InsertAssembly): Promise<Assembly> {
    const inserted = await db.insert(assemblies).values(assembly).returning();
    return inserted[0];
  }

  async updateAssembly(id: number, data: Partial<Assembly>): Promise<Assembly | undefined> {
    const updated = await db
      .update(assemblies)
      .set(data)
      .where(eq(assemblies.id, id))
      .returning();
    return updated[0];
  }

  async getUpcomingAssemblies(): Promise<Assembly[]> {
    const now = new Date();
    return await db
      .select()
      .from(assemblies)
      .where(gte(assemblies.dataAssembleia, now))
      .orderBy(assemblies.dataAssembleia)
      .limit(10);
  }

  // Voting Items
  async getAllVotingItems(): Promise<VotingItem[]> {
    return await db.select().from(votingItems).orderBy(desc(votingItems.id));
  }

  async getVotingItemById(id: number): Promise<VotingItem | undefined> {
    const result = await db.select().from(votingItems).where(eq(votingItems.id, id)).limit(1);
    return result[0];
  }

  async getVotingItemsByAssembly(assemblyId: number): Promise<VotingItem[]> {
    return await db
      .select()
      .from(votingItems)
      .where(eq(votingItems.assemblyId, assemblyId))
      .orderBy(votingItems.ordem);
  }

  async createVotingItem(item: InsertVotingItem): Promise<VotingItem> {
    const inserted = await db.insert(votingItems).values(item).returning();
    return inserted[0];
  }

  async updateVotingItem(id: number, data: Partial<VotingItem>): Promise<VotingItem | undefined> {
    const updated = await db
      .update(votingItems)
      .set(data)
      .where(eq(votingItems.id, id))
      .returning();
    return updated[0];
  }

  async getOpenVotingItems(): Promise<VotingItem[]> {
    return await db
      .select()
      .from(votingItems)
      .where(eq(votingItems.status, 'aberta'))
      .orderBy(votingItems.ordem);
  }

  // Votes
  async createVote(vote: InsertVote): Promise<Vote> {
    const inserted = await db.insert(votes).values(vote).returning();
    return inserted[0];
  }

  async getUserVote(votingItemId: number, userId: string): Promise<Vote | null> {
    const [vote] = await db
      .select()
      .from(votes)
      .where(and(eq(votes.votingItemId, votingItemId), eq(votes.userId, userId)));
    return vote || null;
  }

  async canUserVoteInAssembly(assemblyId: number, userId: string): Promise<{ canVote: boolean; reason?: string }> {
    const assembly = await this.getAssemblyById(assemblyId);
    if (!assembly) {
      return { canVote: false, reason: 'Assembleia não encontrada' };
    }

    const user = await this.getUser(userId);
    if (!user) {
      return { canVote: false, reason: 'Utilizador não encontrado' };
    }

    if (!user.ativo) {
      return { canVote: false, reason: 'Utilizador inativo' };
    }

    // Categoria honorário nunca vota (segundo estatuto)
    if (user.categoria === 'honorario') {
      return { canVote: false, reason: 'Associados honorários não têm direito a voto' };
    }

    // Verificar elegibilidade específica da assembleia
    const allowedCategories = (assembly.allowedCategories as string[]) || ['fundador', 'efetivo', 'contribuinte'];

    // Contribuintes e Voluntários só votam se convocados
    if (user.categoria === 'contribuinte' || user.categoria === 'voluntario') {
      if (!allowedCategories.includes(user.categoria)) {
        return {
          canVote: false,
          reason: `${user.categoria === 'contribuinte' ? 'Contribuintes' : 'Voluntários'} só podem votar quando convocados especificamente`
        };
      }
    }

    if (!allowedCategories.includes(user.categoria || '')) {
      return { canVote: false, reason: `Esta assembleia é restrita a: ${allowedCategories.join(', ')}` };
    }

    return { canVote: true };
  }

  async getVotesByVotingItem(votingItemId: number): Promise<Vote[]> {
    return await db.select().from(votes).where(eq(votes.votingItemId, votingItemId));
  }

  // Documents
  async getAllDocuments(): Promise<Document[]> {
    return await db.select().from(documents).orderBy(desc(documents.createdAt));
  }

  async getDocumentById(id: number): Promise<Document | undefined> {
    const result = await db.select().from(documents).where(eq(documents.id, id)).limit(1);
    return result[0];
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const inserted = await db.insert(documents).values(document).returning();
    return inserted[0];
  }

  async getDocumentsByType(type: string): Promise<Document[]> {
    return await db
      .select()
      .from(documents)
      .where(eq(documents.tipo, type))
      .orderBy(desc(documents.createdAt));
  }

  async getDocumentsByAssembly(assemblyId: number): Promise<Document[]> {
    return await db
      .select()
      .from(documents)
      .where(eq(documents.assemblyId, assemblyId))
      .orderBy(desc(documents.createdAt));
  }

  async updateDocument(id: number, data: Partial<Document>): Promise<Document | undefined> {
    const updated = await db
      .update(documents)
      .set(data)
      .where(eq(documents.id, id))
      .returning();
    return updated[0];
  }

  async deleteDocument(id: number): Promise<void> {
    await db.delete(documents).where(eq(documents.id, id));
  }

  // Presences
  async createPresence(presence: InsertPresence): Promise<Presence> {
    const inserted = await db.insert(presences).values(presence).returning();
    return inserted[0];
  }

  async getPresencesByAssembly(assemblyId: number): Promise<Presence[]> {
    return await db.select().from(presences).where(eq(presences.assemblyId, assemblyId));
  }

  async updatePresence(id: number, data: Partial<Presence>): Promise<Presence | undefined> {
    const updated = await db
      .update(presences)
      .set(data)
      .where(eq(presences.id, id))
      .returning();
    return updated[0];
  }

  // Notifications
  async getUserNotifications(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const inserted = await db.insert(notifications).values(notification).returning();
    return inserted[0];
  }

  async markNotificationAsRead(id: number): Promise<void> {
    await db.update(notifications).set({ lida: true }).where(eq(notifications.id, id));
  }

  // CMS Content
  async getCmsContent(sectionKey: string): Promise<CmsContent | undefined> {
    const result = await db
      .select()
      .from(cmsContent)
      .where(eq(cmsContent.sectionKey, sectionKey))
      .limit(1);
    return result[0];
  }

  async upsertCmsContent(content: InsertCmsContent): Promise<CmsContent> {
    const existing = await this.getCmsContent(content.sectionKey);

    if (existing) {
      const updated = await db
        .update(cmsContent)
        .set({ ...content, updatedAt: new Date() })
        .where(eq(cmsContent.sectionKey, content.sectionKey))
        .returning();
      return updated[0];
    }

    const inserted = await db.insert(cmsContent).values(content).returning();
    return inserted[0];
  }

  // Object Storage
  async createObjectEntity(entity: InsertObjectEntity): Promise<ObjectEntity> {
    const inserted = await db.insert(objectEntities).values(entity).returning();
    return inserted[0];
  }

  async getObjectEntity(objectPath: string): Promise<ObjectEntity | undefined> {
    const result = await db
      .select()
      .from(objectEntities)
      .where(eq(objectEntities.objectPath, objectPath))
      .limit(1);
    return result[0];
  }

  // Proxies (Procurações)
  async createProxy(proxy: InsertProxy): Promise<Proxy> {
    const inserted = await db.insert(proxies).values(proxy).returning();
    return inserted[0];
  }

  async getProxiesByAssembly(assemblyId: number, includeRevoked: boolean = false): Promise<Proxy[]> {
    if (includeRevoked) {
      // Return all proxies (active and revoked) for admin auditing
      return await db
        .select()
        .from(proxies)
        .where(eq(proxies.assemblyId, assemblyId))
        .orderBy(desc(proxies.createdAt));
    }

    // Return only active proxies
    return await db
      .select()
      .from(proxies)
      .where(and(
        eq(proxies.assemblyId, assemblyId),
        eq(proxies.status, 'ativa')
      ))
      .orderBy(desc(proxies.createdAt));
  }

  async getActiveProxyForUser(assemblyId: number, giverId: string): Promise<Proxy | undefined> {
    const result = await db
      .select()
      .from(proxies)
      .where(and(
        eq(proxies.assemblyId, assemblyId),
        eq(proxies.giverId, giverId),
        eq(proxies.status, 'ativa')
      ))
      .limit(1);
    return result[0];
  }

  async getProxiesReceivedByUser(assemblyId: number, receiverId: string): Promise<Proxy[]> {
    return await db
      .select()
      .from(proxies)
      .where(and(
        eq(proxies.assemblyId, assemblyId),
        eq(proxies.receiverId, receiverId),
        eq(proxies.status, 'ativa')
      ))
      .orderBy(desc(proxies.createdAt));
  }

  async revokeProxy(id: number): Promise<Proxy | undefined> {
    const updated = await db
      .update(proxies)
      .set({ status: 'revogada', revokedAt: new Date() })
      .where(eq(proxies.id, id))
      .returning();
    return updated[0];
  }

  async checkProxyLoop(assemblyId: number, giverId: string, receiverId: string): Promise<boolean> {
    // Check if receiverId already gave a proxy to giverId (direct loop)
    const directLoop = await db
      .select()
      .from(proxies)
      .where(and(
        eq(proxies.assemblyId, assemblyId),
        eq(proxies.giverId, receiverId),
        eq(proxies.receiverId, giverId),
        eq(proxies.status, 'ativa')
      ))
      .limit(1);

    if (directLoop.length > 0) {
      return true; // Loop detected
    }

    // Check for indirect loops (receiverId gave proxy to someone who gave to giverId, etc.)
    // Simple implementation: check up to 3 levels deep
    let currentReceiver = receiverId;
    for (let i = 0; i < 3; i++) {
      const nextProxy = await db
        .select()
        .from(proxies)
        .where(and(
          eq(proxies.assemblyId, assemblyId),
          eq(proxies.giverId, currentReceiver),
          eq(proxies.status, 'ativa')
        ))
        .limit(1);

      if (nextProxy.length === 0) {
        break; // No more proxies in the chain
      }

      if (nextProxy[0].receiverId === giverId) {
        return true; // Loop detected
      }

      currentReceiver = nextProxy[0].receiverId;
    }

    return false; // No loop detected
  }
}

export const storage = new DbStorage();