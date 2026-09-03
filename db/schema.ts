import { pgTable, text, timestamp, uuid, pgEnum, bigserial, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const cardStatusEnum = pgEnum("card_status", [
  "UNASSIGNED",
  "ACTIVE",
  "SUSPENDED",
  "ARCHIVED",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").unique().notNull(),
  googleId: text("google_id").unique(), // nullable: admin login via credentials, owner via Google OAuth
  name: text("name").notNull(),
  role: text("role").default("owner").notNull(), // 'owner' | 'admin'
  passwordHash: text("password_hash"),            // nullable: only set for admin accounts
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("users_google_id_idx").on(table.googleId),
]);

export const businesses = pgTable("businesses", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: uuid("owner_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const cards = pgTable("cards", {
  id: uuid("id").primaryKey().defaultRandom(),
  publicToken: text("public_token").unique().notNull(),
  businessId: uuid("business_id").references(() => businesses.id, { onDelete: "set null" }),
  reviewUrl: text("review_url"),
  status: cardStatusEnum("status").default("UNASSIGNED").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  activatedAt: timestamp("activated_at"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("cards_public_token_idx").on(table.publicToken),
]);

export const tapLogs = pgTable("tap_logs", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  cardId: uuid("card_id").references(() => cards.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("tap_logs_card_id_idx").on(table.cardId),
]);

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  cardId: uuid("card_id").references(() => cards.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  action: text("action").notNull(), // 'GENERATED', 'ACTIVATED', 'SUSPENDED', 'URL_UPDATED'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  businesses: many(businesses),
  auditLogs: many(auditLogs),
}));

export const businessesRelations = relations(businesses, ({ one, many }) => ({
  owner: one(users, {
    fields: [businesses.ownerId],
    references: [users.id],
  }),
  cards: many(cards),
}));

export const cardsRelations = relations(cards, ({ one, many }) => ({
  business: one(businesses, {
    fields: [cards.businessId],
    references: [businesses.id],
  }),
  tapLogs: many(tapLogs),
  auditLogs: many(auditLogs),
}));

export const tapLogsRelations = relations(tapLogs, ({ one }) => ({
  card: one(cards, {
    fields: [tapLogs.cardId],
    references: [cards.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  card: one(cards, {
    fields: [auditLogs.cardId],
    references: [cards.id],
  }),
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));
