import "dotenv/config";
import { getDb } from "../server/db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

async function main() {
    console.log("Checking for admin user...");
    // Pass explicit connection if needed via environment, but getDb pulls from process.env.DATABASE_URL
    const db = await getDb();
    if (!db) {
        console.log("Database not available (check DATABASE_URL)");
        process.exit(1);
    }

    // Try to find user by username 'admin'
    const admin = await db.select().from(users).where(eq(users.username, "admin"));

    if (admin.length > 0) {
        const user = admin[0];
        console.log("✅ Admin user FOUND:", user.username, user.role);
        console.log("Password hash:", user.password.substring(0, 15) + "...");
    } else {
        console.log("❌ Admin user NOT FOUND");
    }
    process.exit(0);
}

main().catch((err) => {
    console.error("Error checking admin:", err);
    process.exit(1);
});
