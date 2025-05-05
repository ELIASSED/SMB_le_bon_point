
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Simple seeded random number generator for reproducibility
function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
}

// Generate random price between min and max, rounded to 2 decimal places
function getRandomPrice(min: number, max: number, random: () => number): number {
  const range = max - min;
  const price = min + range * random();
  return Math.round(price * 100) / 100; // Round to 2 decimal places
}

async function main() {
  console.log("📢 Suppression des anciennes données...");

  try {
    // Suppression des données existantes
    await prisma.sessionUsers.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.session.deleteMany();
    await prisma.psychologue.deleteMany();
    await prisma.instructor.deleteMany();
    await prisma.user.deleteMany();
    await prisma.admin.deleteMany();
    console.log("✅ Anciennes données supprimées !");
  } catch (error) {
    console.error("❌ Erreur lors de la suppression des données :", error);
    throw error;
  }

  // Création d'un administrateur
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.admin.create({
    data: {
      email: "admin@example.com",
      password: adminPassword,
      name: "Administrateur",
    },
  });
  console.log("✅ Administrateur créé ! Email: admin@example.com, Mot de passe: admin123");

  // Création d'un instructeur
  const instructor = await prisma.instructor.create({
    data: {
      email: 'instructor@example.com',
      firstName: 'John',
      lastName: 'Doe',
      numeroAutorisationPrefectorale: 'AUTH123456',
      phone: '0123456789',
    },
  });

  // Création d'un psychologue
  const psychologue = await prisma.psychologue.create({
    data: {
      email: 'psychologue@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      numeroAutorisationPrefectorale: 'AUTH654321',
      phone: '0987654321',
    },
  });

  console.log("✅ Instructeur et psychologue créés !");


  


 

  console.log("🎉 Base de données semée avec succès !");
}

main()
  .catch((error) => {
    console.error('❌ Erreur lors du seed : ', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
