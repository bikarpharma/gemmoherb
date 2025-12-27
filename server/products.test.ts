import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-test",
    email: "admin@gemmoherb.com",
    name: "Admin Test",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    pharmacyName: null,
    pharmacyAddress: null,
    pharmacyPhone: null,
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

function createUserContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "user-test",
    email: "pharmacie@test.com",
    name: "Pharmacie Test",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    pharmacyName: "Pharmacie Centrale",
    pharmacyAddress: "123 Rue Test",
    pharmacyPhone: "0123456789",
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("products", () => {
  it("should list all products", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    const products = await caller.products.list();

    expect(products).toBeDefined();
    expect(Array.isArray(products)).toBe(true);
    expect(products.length).toBeGreaterThan(0);
  });

  it("should get product by id", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    const products = await caller.products.list();
    if (products.length === 0) return;

    const firstProduct = products[0];
    const product = await caller.products.getById({ id: firstProduct.id });

    expect(product).toBeDefined();
    expect(product?.id).toBe(firstProduct.id);
    expect(product?.name).toBe(firstProduct.name);
  });

  it("should allow admin to create product", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const uniqueRef = `TEST${Date.now()}`;
    const result = await caller.products.create({
      reference: uniqueRef,
      name: "Produit Test",
      category: "macerat",
      unitVolume: "Flacon",
      priceHT: "50.00",
      tvaRate: "19.00",
    });

    expect(result.success).toBe(true);
  });

  it("should prevent non-admin from creating product", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.products.create({
        reference: "TEST002",
        name: "Produit Test 2",
        category: "macerat",
        unitVolume: "Flacon",
        priceHT: "50.00",
        tvaRate: "19.00",
      })
    ).rejects.toThrow();
  });
});

describe("orders", () => {
  it("should allow user to create order", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    const products = await caller.products.list();
    if (products.length === 0) return;

    const result = await caller.orders.create({
      items: [
        { productId: products[0].id, quantity: 2 },
      ],
      notes: "Test order",
    });

    expect(result.success).toBe(true);
    expect(result.orderId).toBeDefined();
    expect(result.orderNumber).toBeDefined();
  });

  it("should list user orders", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    const orders = await caller.orders.myOrders();

    expect(orders).toBeDefined();
    expect(Array.isArray(orders)).toBe(true);
  });

  it("should allow admin to view all orders", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const orders = await caller.orders.allOrders();

    expect(orders).toBeDefined();
    expect(Array.isArray(orders)).toBe(true);
  });

  it("should prevent non-admin from viewing all orders", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.orders.allOrders()).rejects.toThrow();
  });
});

describe("messages", () => {
  it("should allow user to send message", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.messages.send({
      recipientId: 1, // Admin
      content: "Test message",
    });

    expect(result.success).toBe(true);
  });

  it("should get conversation between users", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    const messages = await caller.messages.getConversation({
      otherUserId: 1, // Admin
    });

    expect(messages).toBeDefined();
    expect(Array.isArray(messages)).toBe(true);
  });

  it("should get unread message count", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    const count = await caller.messages.unreadCount();

    expect(typeof count).toBe("number");
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
