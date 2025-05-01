
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

  // Création de 100 sessions
  console.log("📢 Génération de 100 sessions...");
  const sessions: any[] = [];
  const seed = 12345; // Fixed seed for reproducibility
  const random = seededRandom(seed);

  for (let i = 0; i < 100; i++) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + i * 3);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 1);

    const price = getRandomPrice(200, 300, random); // Random price between €200 and €300

    const session = await prisma.session.create({
      data: {
        numeroStageAnts: `24R22094005${i + 1}`,
        price,
        description: `Session de formation n°${i + 1}`,
        startDate,
        endDate,
        location: 'Paris',
        capacity: 20,
        instructorId: instructor.id,
        psychologueId: psychologue.id,
      },
    });
    sessions.push(session);
    console.log(`Session ${i + 1} créée avec prix : €${price.toFixed(2)}`);
  }
  console.log("✅ 100 sessions créées avec succès !");

  // Création d'un utilisateur
  const user = await prisma.user.create({
    data: {
      civilite: 'Mr',
      nom: 'Dupont',
      prenom: 'Jean',
      adresse: '123 Rue de la République',
      codePostal: '75001',
      ville: 'Paris',
      telephone: '0123456789',
      email: 'jean.dupont@example.com',
      nationalite: 'Française',
      dateNaissance: new Date('1990-01-01'),
      codePostalNaissance: '75001',
      numeroPermis: 'P123456',
      dateDelivrancePermis: new Date('2020-01-01'),
      prefecture: 'Paris',
      etatPermis: 'Valide',
      casStage: 'N/A',
    },
  });
  console.log("✅ Utilisateur créé !");

  // Inscription de l'utilisateur à une session aléatoire
  const randomSession = sessions[Math.floor(Math.random() * sessions.length)];
  const sessionUser = await prisma.sessionUsers.create({
    data: {
      sessionId: randomSession.id,
      userId: user.id,
      isPaid: false,
    },
  });
  console.log(`✅ L'utilisateur a été inscrit à la session ${randomSession.numeroStageAnts}`);

 

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
