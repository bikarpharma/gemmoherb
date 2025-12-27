const pg = require("pg");

async function checkAdmin() {
    const DATABASE_URL = "postgresql://neondb_owner:npg_PifQdUv6eT1I@ep-tiny-waterfall-ahztfp18-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require";

    const pool = new pg.Pool({
        connectionString: DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log("🔍 Vérification de l'utilisateur admin...");

        // Chercher l'utilisateur admin
        const result = await pool.query(
            'SELECT id, username, name, email, role, "loginMethod", password FROM users WHERE username = $1',
            ['admin']
        );

        if (result.rows.length === 0) {
            console.log("❌ Aucun utilisateur 'admin' trouvé !");
        } else {
            const user = result.rows[0];
            console.log("✅ Utilisateur 'admin' trouvé :");
            console.log("   - ID:", user.id);
            console.log("   - Username:", user.username);
            console.log("   - Name:", user.name);
            console.log("   - Email:", user.email);
            console.log("   - Role:", user.role);
            console.log("   - Login Method:", user.loginMethod);
            console.log("   - Password hash:", user.password ? "✓ Défini" : "✗ Non défini");
            console.log("   - Password (first 20 chars):", user.password ? user.password.substring(0, 20) + "..." : "N/A");
        }

        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error("❌ Erreur:", error.message);
        await pool.end();
        process.exit(1);
    }
}

checkAdmin();
