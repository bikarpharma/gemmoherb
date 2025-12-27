const { scrypt, randomBytes } = require("crypto");
const { promisify } = require("util");
const pg = require("pg");

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
    const salt = randomBytes(16).toString("hex");
    const derivedKey = await scryptAsync(password, salt, 64);
    return `${salt}:${derivedKey.toString("hex")}`;
}

async function createPharmacy() {
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
            ['pharmacie1']
        );

        if (checkResult.rows.length > 0) {
            console.log("⚠️  Un utilisateur 'pharmacie1' existe déjà !");
            console.log("Suppression de l'ancien compte...");
            await pool.query('DELETE FROM users WHERE username = $1', ['pharmacie1']);
        }

        console.log("🏥 Création du compte pharmacie...");

        // Hash du mot de passe
        const hashedPassword = await hashPassword("pharmacie123");

        // Insérer l'utilisateur
        await pool.query(
            `INSERT INTO users (username, password, name, email, role, "loginMethod", "pharmacyName", "pharmacyAddress", "pharmacyPhone", "createdAt", "updatedAt", "lastSignedIn")
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW(), NOW())`,
            [
                'pharmacie1',
                hashedPassword,
                'Pharmacie Centrale',
                'pharmacie.centrale@example.com',
                'user', // role = user (pas admin)
                'local',
                'Pharmacie Centrale',
                '123 Rue de la Santé, Paris',
                '01 23 45 67 89'
            ]
        );

        console.log("✅ Compte pharmacie créé avec succès !");
        console.log("");
        console.log("🏥 Informations de connexion :");
        console.log("   📧 Username: pharmacie1");
        console.log("   🔑 Password: pharmacie123");
        console.log("");
        console.log("📋 Informations de la pharmacie :");
        console.log("   Nom: Pharmacie Centrale");
        console.log("   Adresse: 123 Rue de la Santé, Paris");
        console.log("   Téléphone: 01 23 45 67 89");
        console.log("");
        console.log("🌐 Connectez-vous sur http://localhost:3000");

        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error("❌ Erreur:", error.message);
        await pool.end();
        process.exit(1);
    }
}

createPharmacy();
