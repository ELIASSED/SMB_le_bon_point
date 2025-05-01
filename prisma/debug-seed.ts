import { PrismaClient } from '@prisma/client';

// Créer une nouvelle instance de PrismaClient
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function main() {
  console.log("🔍 Débogage des modèles Prisma");
  
  // Imprimons les propriétés disponibles sur prisma
  console.log("Propriétés disponibles sur l'objet prisma:");
  console.log(Object.keys(prisma));

  try {
    // Essayons de réinitialiser quelques tables
    console.log("Tentative de suppression des données...");
    
    // Suppression des sessions d'authentification (essai avec différentes syntaxes)
    try {
      console.log("Tentative avec prisma.authSession.deleteMany()");
      await prisma.authSession.deleteMany();
      console.log("✅ Suppression avec authSession réussie");
    } catch (e) {
      console.error("❌ Erreur avec authSession:", e.message);
    }
    
    try {
      console.log("Tentative avec prisma.AuthSession.deleteMany()");
      await prisma.AuthSession.deleteMany();
      console.log("✅ Suppression avec AuthSession réussie");
    } catch (e) {
      console.error("❌ Erreur avec AuthSession:", e.message);
    }
    
    try {
      console.log("Vérification autres modèles...");
      console.log("Modèle Payment existe:", prisma.payment ? "Oui" : "Non");
      console.log("Modèle VerificationToken existe:", prisma.verificationToken ? "Oui" : "Non");
      console.log("Modèle Account existe:", prisma.account ? "Oui" : "Non");
      console.log("Modèle SessionUsers existe:", prisma.sessionUsers ? "Oui" : "Non");
    } catch (e) {
      console.error("❌ Erreur lors de la vérification:", e.message);
    }
    
  } catch (error) {
    console.error("❌ Erreur générale:", error);
  }
}

main()
  .catch((e) => {
    console.error("Erreur fatale:", e);
    process.exit(1);
  })
  .finally(async () => {
    // Déconnexion de Prisma
    await prisma.$disconnect();
  });