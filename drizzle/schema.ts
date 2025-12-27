import { pgTable, text, timestamp, varchar, boolean, integer, serial, decimal } from "drizzle-orm/pg-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = pgTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: serial("id").primaryKey(),
  /** Manus OAuth identifier (openId) - kept for backward compatibility/migration, now optional */
  openId: varchar("openId", { length: 64 }),
  username: varchar("username", { length: 64 }).unique().notNull(),
  password: text("password").notNull(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }).default("local"),
  role: text("role", { enum: ["user", "admin"] }).default("user").notNull(),
  status: text("status", { enum: ["pending", "approved", "rejected"] }).default("approved").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),

  // Champs spécifiques aux pharmacies
  pharmacyName: text("pharmacyName"),
  pharmacyAddress: text("pharmacyAddress"),
  pharmacyPhone: varchar("pharmacyPhone", { length: 20 }),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Table des produits (macérats de bourgeons et huiles essentielles)
 */
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  reference: varchar("reference", { length: 50 }).unique(),
  name: text("name").notNull(),
  category: text("category", { enum: ["macerat", "huile_essentielle"] }).notNull(),
  description: text("description"),
  unitVolume: varchar("unitVolume", { length: 20 }), // ex: "10 ML", "30 ML", "100 ML"
  priceHT: decimal("priceHT", { precision: 10, scale: 2 }).notNull(),
  tvaRate: decimal("tvaRate", { precision: 5, scale: 2 }).default("19.00").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  inStock: boolean("inStock").default(true).notNull(), // Disponibilité du produit (rupture de stock si false)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Table des commandes
 */
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(), // Référence à l'utilisateur (pharmacie)
  orderNumber: varchar("orderNumber", { length: 50 }).notNull().unique(),
  status: text("status", { enum: ["pending", "confirmed", "paid", "shipped", "delivered", "cancelled"] }).default("pending").notNull(),
  subtotalHT: decimal("subtotalHT", { precision: 10, scale: 2 }).notNull(),
  tvaAmount: decimal("tvaAmount", { precision: 10, scale: 2 }).notNull(),
  discountAmount: decimal("discountAmount", { precision: 10, scale: 2 }).default("0.00").notNull(),
  totalTTC: decimal("totalTTC", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("paymentMethod", { enum: ["cash", "check", "unpaid"] }).default("unpaid"),
  paymentStatus: text("paymentStatus", { enum: ["paid", "unpaid"] }).default("unpaid").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Table des lignes de commande (détails des produits commandés)
 */
export const orderItems = pgTable("orderItems", {
  id: serial("id").primaryKey(),
  orderId: integer("orderId").notNull(),
  productId: integer("productId").notNull(),
  productName: text("productName").notNull(), // Sauvegarde du nom au moment de la commande
  productReference: varchar("productReference", { length: 50 }).notNull(),
  quantity: integer("quantity").notNull(),
  priceHT: decimal("priceHT", { precision: 10, scale: 2 }).notNull(),
  tvaRate: decimal("tvaRate", { precision: 5, scale: 2 }).notNull(),
  totalHT: decimal("totalHT", { precision: 10, scale: 2 }).notNull(),
  totalTTC: decimal("totalTTC", { precision: 10, scale: 2 }).notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

/**
 * Table des messages du chat
 */
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("senderId").notNull(), // ID de l'utilisateur qui envoie
  recipientId: integer("recipientId").notNull(), // ID de l'utilisateur qui reçoit
  content: text("content").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;
