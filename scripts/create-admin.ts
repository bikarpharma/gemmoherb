import "dotenv/config";
import { hashPassword } from "../server/_core/auth";
import * as db from "../server/db";

async function main() {
    console.log("Seeding admin user...");

    const existingAdmin = await db.getUserByUsername("admin");
    if (existingAdmin) {
        console.log("Admin user already exists.");
        return;
    }

    const hashedPassword = await hashPassword("admin123");

    await db.createUser({
        username: "admin",
        password: hashedPassword,
        role: "admin",
        name: "Administrateur",
        email: "admin@gemmoherb.local",
        openId: "admin-seed",
        loginMethod: "local",
        lastSignedIn: new Date(),
    });

    console.log("Admin user created successfully.");
    console.log("Username: admin");
    console.log("Password: admin123");
    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
