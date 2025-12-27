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

async function createAdmin() {
  try {
    console.log("🔐 Création du compte administrateur...");

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash("admin123", 10);

    // Créer l'utilisateur admin avec requête SQL directe
    await pool.query(`
      INSERT INTO users (username, password, name, email, role, status, "loginMethod", "createdAt", "updatedAt", "lastSignedIn")
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW(), NOW())
      ON CONFLICT (username) DO NOTHING
    `, ['admin', hashedPassword, 'Administrateur GemmoHerb', 'gemoherb@gmail.com', 'admin', 'approved', 'local']);

    console.log("✅ Compte administrateur créé avec succès !");
    console.log("📧 Username: admin");
    console.log("🔑 Password: admin123");
    console.log("");
    console.log("Vous pouvez maintenant vous connecter");

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur lors de la création du compte admin:", error);
    await pool.end();
    process.exit(1);
  }
}

createAdmin();
