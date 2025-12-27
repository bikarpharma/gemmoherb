import { drizzle } from "drizzle-orm/node-postgres";
import { users } from "./drizzle/schema.js";
import dotenv from "dotenv";
import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from "bcryptjs";

// Charger les variables d'environnement en premier
dotenv.config();

// Vérifier que DATABASE_URL existe
if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL n'est pas définie dans le fichier .env");
  process.exit(1);
}

console.log("🔗 Connexion à la base de données...");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const db = drizzle(pool);

async function createAdmin() {
  try {
    console.log("🔐 Création du compte administrateur...");

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash("admin123", 10);

    // Créer l'utilisateur admin
    await db.insert(users).values({
      username: "admin",
      password: hashedPassword,
      name: "Administrateur GemmoHerb",
      email: "gemoherb@gmail.com",
      role: "admin",
      loginMethod: "local",
    });

    console.log("✅ Compte administrateur créé avec succès !");
    console.log("📧 Username: admin");
    console.log("🔑 Password: admin123");
    console.log("");
    console.log("Vous pouvez maintenant vous connecter à http://localhost:3000");

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur lors de la création du compte admin:", error);
    await pool.end();
    process.exit(1);
  }
}

createAdmin();
