const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Créer des instructeurs
  const instructor1 = await prisma.instructor.create({
    data: {
      email: "instructor1@example.com",
      firstName: "Jean",
      lastName: "Doe",
    },
  });

  const instructor2 = await prisma.instructor.create({
    data: {
      email: "instructor2@example.com",
      firstName: "Alice",
      lastName: "Smith",
    },
  });

  // Créer des psychologues
  const psychologue1 = await prisma.psychologue.create({
    data: {
      email: "psychologue1@example.com",
      firstName: "Marie",
      lastName: "Curie",
    },
  });

  const psychologue2 = await prisma.psychologue.create({
    data: {
      email: "psychologue2@example.com",
      firstName: "Albert",
      lastName: "Einstein",
    },
  });

  // Créer des sessions
  await prisma.session.createMany({
    data: [
      {
        numeroStageAnts: "STG001",
        price: 200.0,
        description: "Stage de récupération de points",
        startDate: new Date("2024-01-05T09:00:00Z"),
        endDate: new Date("2024-01-06T17:00:00Z"),
        location: "Saint-Maur-des-Fossés",
        capacity: 15,
        instructorId: instructor1.id,
        psychologueId: psychologue1.id,
      },
      {
        numeroStageAnts: "STG002",
        price: 180.0,
        description: "Stage de récupération de points",
        startDate: new Date("2024-02-10T09:00:00Z"),
        endDate: new Date("2024-02-11T17:00:00Z"),
        location: "Saint-Maur-des-Fossés",
        capacity: 10,
        instructorId: instructor2.id,
        psychologueId: psychologue1.id,
      },
      {
        numeroStageAnts: "STG003",
        price: 220.0,
        description: "Stage de récupération de points",
        startDate: new Date("2024-03-15T09:00:00Z"),
        endDate: new Date("2024-03-16T17:00:00Z"),
        location: "Saint-Maur-des-Fossés",
        capacity: 20,
        instructorId: instructor1.id,
        psychologueId: psychologue2.id,
      },
      {
        numeroStageAnts: "STG004",
        price: 250.0,
        description: "Stage de récupération de points",
        startDate: new Date("2024-04-20T09:00:00Z"),
        endDate: new Date("2024-04-21T17:00:00Z"),
        location: "Saint-Maur-des-Fossés",
        capacity: 5,
        instructorId: instructor2.id,
        psychologueId: psychologue2.id,
      },
    ],
  });

  // Créer un utilisateur
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
      sessionId: 1, // Assurez-vous que l'ID correspond à une session existante
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
