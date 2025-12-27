import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";

// Procédure admin uniquement
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    login: publicProcedure
      .input(z.object({ username: z.string(), password: z.string() }))
      .mutation(async ({ ctx, input }) => {
        console.log("Login attempt:", input.username);
        const user = await db.getUserByUsername(input.username);
        console.log("User found:", !!user);

        if (!user || !user.password) {
          console.log("Invalid credentials (user not found or no password)");
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" });
        }

        // Dynamically import to avoid circular dependencies if any
        const { verifyPassword } = await import("./_core/auth");
        console.log("Verifying password...");
        const isValid = await verifyPassword(input.password, user.password);
        console.log("Password valid:", isValid);

        if (!isValid) {
          console.log("Invalid credentials (password mismatch)");
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" });
        }

        // Vérifier le statut du compte
        if (user.status === "pending") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Votre compte est en attente de validation par l'administrateur" });
        }
        if (user.status === "rejected") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Votre demande d'inscription a été refusée" });
        }

        // Create session token compatible with the SDK authentication system
        const { SignJWT } = await import("jose");
        const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "super-secret-jwt-key-change-this");

        const token = await new SignJWT({
          openId: user.username, // Use username as openId for local auth
          appId: "gemmoherb-local",
          name: user.name || user.username,
        })
          .setProtectedHeader({ alg: "HS256" })
          .setIssuedAt()
          .setExpirationTime("1y")
          .sign(JWT_SECRET);

        const cookieOptions = getSessionCookieOptions(ctx.req);
        console.log("Setting cookie with options:", cookieOptions);
        ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: 31536000000 }); // 1 year

        return { success: true, user };
      }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),

    register: publicProcedure
      .input(z.object({
        username: z.string().min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères"),
        password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
        email: z.string().email("Email invalide"),
        pharmacyName: z.string().min(2, "Le nom de la pharmacie est requis"),
        pharmacyAddress: z.string().optional(),
        pharmacyPhone: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        // Vérifier si l'utilisateur existe déjà
        const existingUser = await db.getUserByUsername(input.username);
        if (existingUser) {
          throw new TRPCError({ code: "CONFLICT", message: "Ce nom d'utilisateur existe déjà" });
        }

        // Hasher le mot de passe
        const { hashPassword } = await import("./_core/auth");
        const hashedPassword = await hashPassword(input.password);

        // Créer l'utilisateur avec statut "pending"
        await db.createUser({
          username: input.username,
          password: hashedPassword,
          email: input.email,
          name: input.pharmacyName,
          pharmacyName: input.pharmacyName,
          pharmacyAddress: input.pharmacyAddress || null,
          pharmacyPhone: input.pharmacyPhone || null,
          role: "user",
          status: "pending",
        });

        return { success: true, message: "Votre demande d'inscription a été envoyée. Vous recevrez une confirmation après validation par l'administrateur." };
      }),
  }),

  // ===== PRODUITS =====
  products: router({
    list: publicProcedure.query(async () => {
      return await db.getAllProducts();
    }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getProductById(input.id);
      }),

    create: adminProcedure
      .input(z.object({
        reference: z.string(),
        name: z.string(),
        category: z.enum(["macerat", "huile_essentielle"]),
        description: z.string().optional(),
        unitVolume: z.string().optional(),
        priceHT: z.string(),
        tvaRate: z.string().default("19.00"),
        inStock: z.boolean().default(true),
      }))
      .mutation(async ({ input }) => {
        await db.createProduct(input);
        return { success: true };
      }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        reference: z.string().optional(),
        name: z.string().optional(),
        category: z.enum(["macerat", "huile_essentielle"]).optional(),
        description: z.string().optional(),
        unitVolume: z.string().optional(),
        priceHT: z.string().optional(),
        tvaRate: z.string().optional(),
        inStock: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateProduct(id, data);
        return { success: true };
      }),

    toggleStock: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const product = await db.getProductById(input.id);
        if (!product) throw new TRPCError({ code: 'NOT_FOUND', message: 'Product not found' });
        await db.updateProduct(input.id, { inStock: !product.inStock });
        return { success: true, inStock: !product.inStock };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteProduct(input.id);
        return { success: true };
      }),
  }),

  // ===== COMMANDES =====
  orders: router({
    create: protectedProcedure
      .input(z.object({
        items: z.array(z.object({
          productId: z.number(),
          quantity: z.number(),
        })),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Récupérer les produits
        const productIds = input.items.map(item => item.productId);
        const productsData = await Promise.all(
          productIds.map(id => db.getProductById(id))
        );

        // Calculer les totaux
        let subtotalHT = 0;
        let tvaAmount = 0;
        const orderItemsData = input.items.map((item, index) => {
          const product = productsData[index];
          if (!product) throw new TRPCError({ code: 'NOT_FOUND', message: 'Product not found' });

          const priceHT = parseFloat(product.priceHT);
          const tvaRate = parseFloat(product.tvaRate);
          const totalHT = priceHT * item.quantity;
          const totalTTC = totalHT * (1 + tvaRate / 100);
          const itemTva = totalHT * (tvaRate / 100);

          subtotalHT += totalHT;
          tvaAmount += itemTva;

          return {
            productId: product.id,
            productName: product.name,
            productReference: product.reference,
            quantity: item.quantity,
            priceHT: product.priceHT,
            tvaRate: product.tvaRate,
            totalHT: totalHT.toFixed(2),
            totalTTC: totalTTC.toFixed(2),
          };
        });

        const totalTTC = subtotalHT + tvaAmount;
        const orderNumber = await db.getNextOrderNumber();

        // Créer la commande
        const orderResult = await db.createOrder({
          userId: ctx.user.id,
          orderNumber,
          status: "pending",
          subtotalHT: subtotalHT.toFixed(2),
          tvaAmount: tvaAmount.toFixed(2),
          discountAmount: "0.00",
          totalTTC: totalTTC.toFixed(2),
          paymentMethod: "unpaid",
          paymentStatus: "unpaid",
          notes: input.notes,
        });

        // PostgreSQL returning() returns an array with the inserted row
        const orderId = orderResult[0]?.id;
        if (!orderId) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create order' });

        // Créer les lignes de commande
        const itemsWithOrderId = orderItemsData.map(item => ({
          ...item,
          orderId,
          productReference: item.productReference || "",
        }));
        await db.createOrderItems(itemsWithOrderId);

        // TODO: Envoyer email de notification

        return { success: true, orderId, orderNumber };
      }),

    myOrders: protectedProcedure.query(async ({ ctx }) => {
      return await db.getOrdersByUserId(ctx.user.id);
    }),

    allOrders: adminProcedure.query(async () => {
      return await db.getAllOrders();
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const order = await db.getOrderById(input.id);
        if (!order) throw new TRPCError({ code: 'NOT_FOUND' });

        // Vérifier que l'utilisateur a le droit de voir cette commande
        if (ctx.user.role !== 'admin' && order.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }

        const items = await db.getOrderItemsByOrderId(input.id);
        return { order, items };
      }),

    updateStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "confirmed", "paid", "shipped", "delivered", "cancelled"]),
      }))
      .mutation(async ({ input }) => {
        await db.updateOrder(input.id, { status: input.status });
        return { success: true };
      }),

    updatePayment: adminProcedure
      .input(z.object({
        id: z.number(),
        paymentMethod: z.enum(["cash", "check", "unpaid"]).optional(),
        paymentStatus: z.enum(["paid", "unpaid"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateOrder(id, data);
        return { success: true };
      }),

    applyDiscount: adminProcedure
      .input(z.object({
        id: z.number(),
        discountAmount: z.string(),
      }))
      .mutation(async ({ input }) => {
        const order = await db.getOrderById(input.id);
        if (!order) throw new TRPCError({ code: 'NOT_FOUND' });

        const subtotalHT = parseFloat(order.subtotalHT);
        const tvaAmount = parseFloat(order.tvaAmount);
        const discount = parseFloat(input.discountAmount);
        const newTotalTTC = subtotalHT + tvaAmount - discount;

        await db.updateOrder(input.id, {
          discountAmount: input.discountAmount,
          totalTTC: newTotalTTC.toFixed(2),
        });

        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        // Supprimer d'abord les items de la commande
        await db.deleteOrderItems(input.id);
        // Puis supprimer la commande
        await db.deleteOrder(input.id);
        return { success: true };
      }),
  }),

  // ===== MESSAGES =====
  messages: router({
    send: protectedProcedure
      .input(z.object({
        recipientId: z.number(),
        content: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createMessage({
          senderId: ctx.user.id,
          recipientId: input.recipientId,
          content: input.content,
          isRead: false,
        });

        // TODO: Envoyer email de notification

        return { success: true };
      }),

    getConversation: protectedProcedure
      .input(z.object({ otherUserId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.getMessagesBetweenUsers(ctx.user.id, input.otherUserId);
      }),

    markAsRead: protectedProcedure
      .input(z.object({ senderId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.markMessagesAsRead(ctx.user.id, input.senderId);
        return { success: true };
      }),

    unreadCount: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUnreadMessageCount(ctx.user.id);
    }),
  }),

  // ===== UTILISATEURS =====
  users: router({
    list: adminProcedure.query(async () => {
      return await db.getAllUsers();
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getUserById(input.id);
      }),

    // Créer un utilisateur (admin)
    create: adminProcedure
      .input(z.object({
        username: z.string().min(3),
        password: z.string().min(6),
        email: z.string().email(),
        pharmacyName: z.string().min(2),
        pharmacyAddress: z.string().optional(),
        pharmacyPhone: z.string().optional(),
        role: z.enum(["user", "admin"]).default("user"),
        status: z.enum(["pending", "approved", "rejected"]).default("approved"),
      }))
      .mutation(async ({ input }) => {
        const existingUser = await db.getUserByUsername(input.username);
        if (existingUser) {
          throw new TRPCError({ code: "CONFLICT", message: "Ce nom d'utilisateur existe déjà" });
        }

        const { hashPassword } = await import("./_core/auth");
        const hashedPassword = await hashPassword(input.password);

        await db.createUser({
          username: input.username,
          password: hashedPassword,
          email: input.email,
          name: input.pharmacyName,
          pharmacyName: input.pharmacyName,
          pharmacyAddress: input.pharmacyAddress || null,
          pharmacyPhone: input.pharmacyPhone || null,
          role: input.role,
          status: input.status,
        });

        return { success: true };
      }),

    // Approuver un utilisateur
    approve: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.updateUser(input.id, { status: "approved" });
        return { success: true };
      }),

    // Rejeter un utilisateur
    reject: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.updateUser(input.id, { status: "rejected" });
        return { success: true };
      }),

    // Mettre à jour un utilisateur
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        email: z.string().email().optional(),
        pharmacyName: z.string().optional(),
        pharmacyAddress: z.string().optional(),
        pharmacyPhone: z.string().optional(),
        status: z.enum(["pending", "approved", "rejected"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateUser(id, {
          ...data,
          name: data.pharmacyName,
        });
        return { success: true };
      }),

    // Supprimer un utilisateur
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteUser(input.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
