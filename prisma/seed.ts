// prisma/seed.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Créer des instructeurs
  const instructor = await prisma.instructor.create({
    data: {
      email: "instructor@example.com",
      firstName: "Jean",
      lastName: "Doe",
    },
  });

  // Créer des psychologues
  const psychologue = await prisma.psychologue.create({
    data: {
      email: "psychologue@example.com",
      firstName: "Marie",
      lastName: "Curie",
    },
  });

  // Créer des sessions
  const session = await prisma.session.create({
    data: {
      numeroStageAnts: "STAGE123",
      price: 250.0,
      description: "Stage de récupération de points",
      startDate: new Date("2024-01-15"),
      endDate: new Date("2024-01-16"),
      location: "Paris",
      capacity: 20,
      instructorId: instructor.id,
      psychologueId: psychologue.id,
    },
  });

  // Créer des utilisateurs
  const user = await prisma.user.create({
    data: {
      civilite: "Monsieur",
      nom: "Dupont",
      prenom: "Jean",
      prenom2: "Louis",
      adresse: "12 rue Exemple",
      codePostal: "75001",
      ville: "Paris",
      telephone: "0123456789",
      email: "jean.dupont@example.com",
      nationalite: "Française",
      dateNaissance: new Date("1990-01-01"),
      codePostalNaissance: "75001",
    },
  });

  // Associer l'utilisateur à une session
  await prisma.sessionUsers.create({
    data: {
      sessionId: session.id,
      userId: user.id,
      numeroPermis: "123456789",
      dateDelivrancePermis: new Date("2015-06-01"),
      prefecture: "Paris",
      etatPermis: "Valide",
      casStage: "Volontaire",
    },
  });

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
