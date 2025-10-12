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
  getUserVote(votingItemId: number, userId: string): Promise<Vote | undefined>;
  getVotesByVotingItem(votingItemId: number): Promise<Vote[]>;

  // Documents
  getAllDocuments(): Promise<Document[]>;
  getDocumentById(id: number): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  getDocumentsByType(type: string): Promise<Document[]>;
  getDocumentsByAssembly(assemblyId: number): Promise<Document[]>;

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
}

export class DbStorage implements IStorage {
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
    const existing = user.id ? await this.getUser(user.id) : 
                     user.email ? await this.getUserByEmail(user.email) : undefined;

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

  async getUserVote(votingItemId: number, userId: string): Promise<Vote | undefined> {
    const result = await db
      .select()
      .from(votes)
      .where(and(eq(votes.votingItemId, votingItemId), eq(votes.userId, userId)))
      .limit(1);
    return result[0];
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
}

export const storage = new DbStorage();
