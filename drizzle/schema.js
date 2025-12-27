import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean } from "drizzle-orm/mysql-core";
/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
    /**
     * Surrogate primary key. Auto-incremented numeric value managed by the database.
     * Use this for relations between tables.
     */
    id: int("id").autoincrement().primaryKey(),
    /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
    openId: varchar("openId", { length: 64 }).notNull().unique(),
    name: text("name"),
    email: varchar("email", { length: 320 }),
    loginMethod: varchar("loginMethod", { length: 64 }),
    role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
    // Champs spécifiques aux pharmacies
    pharmacyName: text("pharmacyName"),
    pharmacyAddress: text("pharmacyAddress"),
    pharmacyPhone: varchar("pharmacyPhone", { length: 20 }),
});
/**
 * Table des produits (macérats de bourgeons et huiles essentielles)
 */
export const products = mysqlTable("products", {
    id: int("id").autoincrement().primaryKey(),
    reference: varchar("reference", { length: 50 }).notNull().unique(),
    name: text("name").notNull(),
    category: mysqlEnum("category", ["macerat", "huile_essentielle"]).notNull(),
    description: text("description"),
    unitVolume: varchar("unitVolume", { length: 20 }), // ex: "10 ML", "30 ML", "100 ML"
    priceHT: decimal("priceHT", { precision: 10, scale: 2 }).notNull(),
    tvaRate: decimal("tvaRate", { precision: 5, scale: 2 }).default("19.00").notNull(),
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
/**
 * Table des commandes
 */
export const orders = mysqlTable("orders", {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(), // Référence à l'utilisateur (pharmacie)
    orderNumber: varchar("orderNumber", { length: 50 }).notNull().unique(),
    status: mysqlEnum("status", ["pending", "confirmed", "paid", "shipped", "delivered", "cancelled"]).default("pending").notNull(),
    subtotalHT: decimal("subtotalHT", { precision: 10, scale: 2 }).notNull(),
    tvaAmount: decimal("tvaAmount", { precision: 10, scale: 2 }).notNull(),
    discountAmount: decimal("discountAmount", { precision: 10, scale: 2 }).default("0.00").notNull(),
    totalTTC: decimal("totalTTC", { precision: 10, scale: 2 }).notNull(),
    paymentMethod: mysqlEnum("paymentMethod", ["cash", "check", "unpaid"]).default("unpaid"),
    paymentStatus: mysqlEnum("paymentStatus", ["paid", "unpaid"]).default("unpaid").notNull(),
    notes: text("notes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
/**
 * Table des lignes de commande (détails des produits commandés)
 */
export const orderItems = mysqlTable("orderItems", {
    id: int("id").autoincrement().primaryKey(),
    orderId: int("orderId").notNull(),
    productId: int("productId").notNull(),
    productName: text("productName").notNull(), // Sauvegarde du nom au moment de la commande
    productReference: varchar("productReference", { length: 50 }).notNull(),
    quantity: int("quantity").notNull(),
    priceHT: decimal("priceHT", { precision: 10, scale: 2 }).notNull(),
    tvaRate: decimal("tvaRate", { precision: 5, scale: 2 }).notNull(),
    totalHT: decimal("totalHT", { precision: 10, scale: 2 }).notNull(),
    totalTTC: decimal("totalTTC", { precision: 10, scale: 2 }).notNull(),
});
/**
 * Table des messages du chat
 */
export const messages = mysqlTable("messages", {
    id: int("id").autoincrement().primaryKey(),
    senderId: int("senderId").notNull(), // ID de l'utilisateur qui envoie
    recipientId: int("recipientId").notNull(), // ID de l'utilisateur qui reçoit
    content: text("content").notNull(),
    isRead: boolean("isRead").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
});
