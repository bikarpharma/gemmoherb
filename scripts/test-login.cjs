const { scrypt, timingSafeEqual } = require("crypto");
const { promisify } = require("util");
const pg = require("pg");

const scryptAsync = promisify(scrypt);

async function verifyPassword(password, hash) {
    const [salt, key] = hash.split(":");
    const keyBuffer = Buffer.from(key, "hex");
    const derivedKey = await scryptAsync(password, salt, 64);
    return timingSafeEqual(keyBuffer, derivedKey);
}

async function testLogin() {
    const DATABASE_URL = "postgresql://neondb_owner:npg_PifQdUv6eT1I@ep-tiny-waterfall-ahztfp18-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require";

    const pool = new pg.Pool({
        connectionString: DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log("🔐 Test de connexion...");
        console.log("Username: admin");
        console.log("Password: admin123");
        console.log("");

        // Récupérer l'utilisateur
        const result = await pool.query(
            'SELECT username, password FROM users WHERE username = $1',
            ['admin']
        );

        if (result.rows.length === 0) {
            console.log("❌ Utilisateur 'admin' non trouvé !");
            await pool.end();
            process.exit(1);
        }

        const user = result.rows[0];
        console.log("✅ Utilisateur trouvé");
        console.log("Password hash:", user.password.substring(0, 30) + "...");
        console.log("");

        // Tester le mot de passe
        console.log("🔍 Vérification du mot de passe...");
        const isValid = await verifyPassword("admin123", user.password);

        if (isValid) {
            console.log("✅ ✅ ✅ Mot de passe CORRECT ! ✅ ✅ ✅");
            console.log("");
            console.log("Le login devrait fonctionner avec :");
            console.log("  Username: admin");
            console.log("  Password: admin123");
        } else {
            console.log("❌ Mot de passe INCORRECT !");
            console.log("Il y a un problème avec le hash du mot de passe.");
        }

        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error("❌ Erreur:", error.message);
        await pool.end();
        process.exit(1);
    }
}

testLogin();
