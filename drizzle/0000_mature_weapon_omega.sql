CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"senderId" integer NOT NULL,
	"recipientId" integer NOT NULL,
	"content" text NOT NULL,
	"isRead" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orderItems" (
	"id" serial PRIMARY KEY NOT NULL,
	"orderId" integer NOT NULL,
	"productId" integer NOT NULL,
	"productName" text NOT NULL,
	"productReference" varchar(50) NOT NULL,
	"quantity" integer NOT NULL,
	"priceHT" numeric(10, 2) NOT NULL,
	"tvaRate" numeric(5, 2) NOT NULL,
	"totalHT" numeric(10, 2) NOT NULL,
	"totalTTC" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"orderNumber" varchar(50) NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"subtotalHT" numeric(10, 2) NOT NULL,
	"tvaAmount" numeric(10, 2) NOT NULL,
	"discountAmount" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"totalTTC" numeric(10, 2) NOT NULL,
	"paymentMethod" text DEFAULT 'unpaid',
	"paymentStatus" text DEFAULT 'unpaid' NOT NULL,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "orders_orderNumber_unique" UNIQUE("orderNumber")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"reference" varchar(50),
	"name" text NOT NULL,
	"category" text NOT NULL,
	"description" text,
	"unitVolume" varchar(20),
	"priceHT" numeric(10, 2) NOT NULL,
	"tvaRate" numeric(5, 2) DEFAULT '19.00' NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "products_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64),
	"username" varchar(64) NOT NULL,
	"password" text NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64) DEFAULT 'local',
	"role" text DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	"pharmacyName" text,
	"pharmacyAddress" text,
	"pharmacyPhone" varchar(20),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
