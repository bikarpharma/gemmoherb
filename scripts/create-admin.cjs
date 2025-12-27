const { scrypt, randomBytes } = require("crypto");
const { promisify } = require("util");
const pg = require("pg");

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
    const salt = randomBytes(16).toString("hex");
    const derivedKey = await scryptAsync(password, salt, 64);
    return `${salt}:${derivedKey.toString("hex")}`;
}

async function createAdmin() {
    const DATABASE_URL = "postgresql://neondb_owner:npg_PifQdUv6eT1I@ep-tiny-waterfall-ahztfp18-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require";

    const pool = new pg.Pool({
        connectionString: DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log("🔗 Connexion à la base de données...");

        // Vérifier si l'utilisateur existe déjà
        const checkResult = await pool.query(
            'SELECT * FROM users WHERE username = $1',
            ['admin']
        );

        if (checkResult.rows.length > 0) {
            console.log("⚠️  Un utilisateur 'admin' existe déjà !");
            console.log("Suppression de l'ancien compte...");
            await pool.query('DELETE FROM users WHERE username = $1', ['admin']);
        }

        console.log("🔐 Création du compte administrateur...");

        // Hash du mot de passe
        const hashedPassword = await hashPassword("admin123");

        // Insérer l'utilisateur
        await pool.query(
            `INSERT INTO users (username, password, name, email, role, "loginMethod", "createdAt", "updatedAt", "lastSignedIn")
             VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW(), NOW())`,
            ['admin', hashedPassword, 'Administrateur GemmoHerb', 'gemoherb@gmail.com', 'admin', 'local']
        );

        console.log("✅ Compte administrateur créé avec succès !");
        console.log("");
        console.log("📧 Username: admin");
        console.log("🔑 Password: admin123");
        console.log("");
        console.log("🌐 Vous pouvez maintenant vous connecter à http://localhost:3000");

        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error("❌ Erreur:", error.message);
        await pool.end();
        process.exit(1);
    }
}

createAdmin();
