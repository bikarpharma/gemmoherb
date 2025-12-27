import "dotenv/config";
import { createUser, getUserByUsername } from "../server/db";
import { hashPassword } from "../server/_core/auth";

async function main() {
  // Vérifier que DATABASE_URL est défini
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL n'est pas définie dans le fichier .env");
    process.exit(1);
  }

  console.log("✅ Connexion à la base de données...");
  try {
    console.log("🔐 Création du compte administrateur...");

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await getUserByUsername("admin");
    if (existingUser) {
      console.log("⚠️  Un utilisateur 'admin' existe déjà !");
      console.log("Voulez-vous le recréer ? (Supprimez-le d'abord de la base de données)");
      process.exit(0);
    }

    // Hash du mot de passe
    const hashedPassword = await hashPassword("admin123");

    // Créer l'utilisateur admin
    await createUser({
      username: "admin",
      password: hashedPassword,
      name: "Administrateur GemmoHerb",
      email: "gemoherb@gmail.com",
      role: "admin",
      loginMethod: "local",
    });

    console.log("✅ Compte administrateur créé avec succès !");
    console.log("");
    console.log("📧 Username: admin");
    console.log("🔑 Password: admin123");
    console.log("");
    console.log("🌐 Vous pouvez maintenant vous connecter à http://localhost:3000");

    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur lors de la création du compte admin:", error);
    process.exit(1);
  }
}

main();
