// IMPORTANT: This schema includes all models for the Bureau Social application
// Based on the Replit Auth blueprint (javascript_log_in_with_replit)
// Includes: Users, Assemblies, Voting, Documents, CMS, Notifications

import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// ============================================================================
// AUTH TABLES (Required by Replit Auth)
// ============================================================================

// Session storage table - MANDATORY for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - MANDATORY for Replit Auth, extended with Bureau Social fields
export const users = pgTable("users", {
  // Replit Auth fields (required)
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  
  // Bureau Social specific fields
  categoria: varchar("categoria", { length: 50 }).default('contribuinte'), // fundador, efetivo, contribuinte
  numeroSocio: varchar("numero_socio", { length: 20 }).unique(),
  telefone: varchar("telefone", { length: 20 }),
  dataAdesao: timestamp("data_adesao"),
  ativo: boolean("ativo").default(true),
  isAdmin: boolean("is_admin").default(false),
  isDirecao: boolean("is_direcao").default(false),
  emailPreferences: jsonb("email_preferences").default(sql`'{"assemblies":true,"votes":true,"documents":true,"quotas":true}'::jsonb`),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export const selectUserSchema = createSelectSchema(users);

// ============================================================================
// ASSEMBLIES (Assembleias)
// ============================================================================

export const assemblies = pgTable("assemblies", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  titulo: varchar("titulo", { length: 200 }).notNull(),
  tipo: varchar("tipo", { length: 50 }).notNull(), // ordinaria, extraordinaria
  dataAssembleia: timestamp("data_assembleia").notNull(),
  local: varchar("local", { length: 200 }),
  convocatoria: text("convocatoria"),
  ordemDia: jsonb("ordem_dia"), // Array of agenda items
  status: varchar("status", { length: 20 }).default('agendada'), // agendada, em_curso, encerrada
  quorumMinimo: integer("quorum_minimo").default(50), // percentage
  ataGerada: boolean("ata_gerada").default(false),
  ataPath: varchar("ata_path", { length: 500 }),
  // Controle de elegibilidade para voto
  votingEligibility: varchar("voting_eligibility", { length: 20 }).default('todos'), // todos, fundador_efetivo, apenas_fundador
  allowedCategories: jsonb("allowed_categories").default(sql`'["fundador","efetivo","contribuinte"]'::jsonb`), // Array de categorias permitidas
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Assembly = typeof assemblies.$inferSelect;
export type InsertAssembly = typeof assemblies.$inferInsert;

export const insertAssemblySchema = createInsertSchema(assemblies).omit({ 
  id: true, 
  createdAt: true 
}).extend({
  dataAssembleia: z.union([z.string(), z.date()]).transform((val) => 
    typeof val === 'string' ? new Date(val) : val
  ),
  votingEligibility: z.enum(['todos', 'fundador_efetivo', 'apenas_fundador']).optional(),
  allowedCategories: z.array(z.enum(['fundador', 'efetivo', 'contribuinte', 'honorario'])).optional(),
});
export const selectAssemblySchema = createSelectSchema(assemblies);

// ============================================================================
// VOTING ITEMS (Itens de Votação)
// ============================================================================

export const votingItems = pgTable("voting_items", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  assemblyId: integer("assembly_id").references(() => assemblies.id),
  ordem: integer("ordem").notNull(),
  titulo: varchar("titulo", { length: 200 }).notNull(),
  descricao: text("descricao"),
  tipo: varchar("tipo", { length: 50 }).default('simples'), // simples, qualificada, secreta
  opcoes: jsonb("opcoes"), // ['Aprovar', 'Rejeitar', 'Abstenção']
  quorumNecessario: integer("quorum_necessario").default(50),
  status: varchar("status", { length: 20 }).default('pendente'), // pendente, aberta, encerrada
  dataAbertura: timestamp("data_abertura"),
  dataEncerramento: timestamp("data_encerramento"),
  resultado: jsonb("resultado"), // vote counts
  createdAt: timestamp("created_at").defaultNow(),
});

export type VotingItem = typeof votingItems.$inferSelect;
export type InsertVotingItem = typeof votingItems.$inferInsert;

export const insertVotingItemSchema = createInsertSchema(votingItems).omit({ 
  id: true, 
  createdAt: true 
});
export const selectVotingItemSchema = createSelectSchema(votingItems);

// ============================================================================
// VOTES (Votos)
// ============================================================================

export const votes = pgTable("votes", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  votingItemId: integer("voting_item_id").references(() => votingItems.id),
  userId: varchar("user_id").references(() => users.id),
  voto: varchar("voto", { length: 50 }).notNull(), // Aprovar, Rejeitar, Abstenção
  justificativa: text("justificativa"),
  ipAddress: varchar("ip_address", { length: 50 }),
  votedAt: timestamp("voted_at").defaultNow(),
});

export type Vote = typeof votes.$inferSelect;
export type InsertVote = typeof votes.$inferInsert;

export const insertVoteSchema = createInsertSchema(votes).omit({ 
  id: true, 
  createdAt: true 
});
export const selectVoteSchema = createSelectSchema(votes);

// ============================================================================
// PROXIES (Procurações)
// ============================================================================

export const proxies = pgTable("proxies", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  assemblyId: integer("assembly_id").references(() => assemblies.id).notNull(),
  giverId: varchar("giver_id").references(() => users.id).notNull(), // quem dá a procuração
  receiverId: varchar("receiver_id").references(() => users.id).notNull(), // quem recebe a procuração
  status: varchar("status", { length: 20 }).default('ativa'), // ativa, revogada
  createdAt: timestamp("created_at").defaultNow(),
  revokedAt: timestamp("revoked_at"),
});

export type Proxy = typeof proxies.$inferSelect;
export type InsertProxy = typeof proxies.$inferInsert;

export const insertProxySchema = createInsertSchema(proxies).omit({ 
  id: true, 
  createdAt: true 
});
export const selectProxySchema = createSelectSchema(proxies);

// ============================================================================
// DOCUMENTS (Documentos)
// ============================================================================

export const documents = pgTable("documents", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  titulo: varchar("titulo", { length: 200 }).notNull(),
  tipo: varchar("tipo", { length: 50 }).notNull(), // ata, regulamento, relatorio
  categoria: varchar("categoria", { length: 50 }),
  assemblyId: integer("assembly_id").references(() => assemblies.id),
  filePath: varchar("file_path", { length: 500 }).notNull(),
  fileSize: integer("file_size"),
  visivelPara: varchar("visivel_para", { length: 20 }).default('todos'), // todos, admin, direção
  uploadedBy: varchar("uploaded_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

export const insertDocumentSchema = createInsertSchema(documents).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export const selectDocumentSchema = createSelectSchema(documents);

// ============================================================================
// PRESENCES (Presenças)
// ============================================================================

export const presences = pgTable("presences", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  assemblyId: integer("assembly_id").references(() => assemblies.id),
  userId: varchar("user_id").references(() => users.id),
  presente: boolean("presente").default(false),
  representadoPor: varchar("representado_por").references(() => users.id),
  horaEntrada: timestamp("hora_entrada"),
  horaSaida: timestamp("hora_saida"),
});

export type Presence = typeof presences.$inferSelect;
export type InsertPresence = typeof presences.$inferInsert;

export const insertPresenceSchema = createInsertSchema(presences).omit({ 
  id: true 
});
export const selectPresenceSchema = createSelectSchema(presences);

// ============================================================================
// NOTIFICATIONS (Notificações)
// ============================================================================

export const notifications = pgTable("notifications", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").references(() => users.id),
  tipo: varchar("tipo", { length: 50 }).notNull(), // assembleia, votacao, documento
  titulo: varchar("titulo", { length: 200 }).notNull(),
  mensagem: text("mensagem"),
  link: varchar("link", { length: 500 }),
  lida: boolean("lida").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

export const insertNotificationSchema = createInsertSchema(notifications).omit({ 
  id: true, 
  createdAt: true 
});
export const selectNotificationSchema = createSelectSchema(notifications);

// ============================================================================
// CMS CONTENT (Conteúdo editável do site)
// ============================================================================

export const cmsContent = pgTable("cms_content", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  sectionKey: varchar("section_key", { length: 100 }).notNull().unique(), // hero, mission, services, etc.
  content: jsonb("content").notNull(), // Flexible JSON structure for each section
  updatedBy: varchar("updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type CmsContent = typeof cmsContent.$inferSelect;
export type InsertCmsContent = typeof cmsContent.$inferInsert;

export const insertCmsContentSchema = createInsertSchema(cmsContent).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export const selectCmsContentSchema = createSelectSchema(cmsContent);

// ============================================================================
// OBJECT ENTITIES (For file uploads tracking)
// ============================================================================

export const objectEntities = pgTable("object_entities", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  objectPath: varchar("object_path", { length: 500 }).notNull().unique(),
  owner: varchar("owner").references(() => users.id),
  visibility: varchar("visibility", { length: 20 }).default('private'), // public, private
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type ObjectEntity = typeof objectEntities.$inferSelect;
export type InsertObjectEntity = typeof objectEntities.$inferInsert;

export const insertObjectEntitySchema = createInsertSchema(objectEntities).omit({ 
  id: true, 
  createdAt: true 
});
export const selectObjectEntitySchema = createSelectSchema(objectEntities);

// ============================================================================
// RELATIONS
// ============================================================================

export const assembliesRelations = relations(assemblies, ({ one, many }) => ({
  creator: one(users, {
    fields: [assemblies.createdBy],
    references: [users.id],
  }),
  votingItems: many(votingItems),
  presences: many(presences),
  documents: many(documents),
}));

export const votingItemsRelations = relations(votingItems, ({ one, many }) => ({
  assembly: one(assemblies, {
    fields: [votingItems.assemblyId],
    references: [assemblies.id],
  }),
  votes: many(votes),
}));

export const votesRelations = relations(votes, ({ one }) => ({
  votingItem: one(votingItems, {
    fields: [votes.votingItemId],
    references: [votingItems.id],
  }),
  user: one(users, {
    fields: [votes.userId],
    references: [users.id],
  }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  assembly: one(assemblies, {
    fields: [documents.assemblyId],
    references: [assemblies.id],
  }),
  uploader: one(users, {
    fields: [documents.uploadedBy],
    references: [users.id],
  }),
}));

export const presencesRelations = relations(presences, ({ one }) => ({
  assembly: one(assemblies, {
    fields: [presences.assemblyId],
    references: [assemblies.id],
  }),
  user: one(users, {
    fields: [presences.userId],
    references: [users.id],
  }),
  representante: one(users, {
    fields: [presences.representadoPor],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));
