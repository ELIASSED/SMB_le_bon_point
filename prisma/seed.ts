const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Insertion de données pour les utilisateurs (User)
  await prisma.user.createMany({
    data: [
      { email: "user1@example.com", firstName: "Jean", lastName: "Dupont", phone: "0600000001" },
      { email: "user2@example.com", firstName: "Marie", lastName: "Durand", phone: "0600000002" },
    ],
  });
  console.log("Utilisateurs ajoutés avec succès.");

  // Insertion de données pour les instructeurs (Instructor)
  await prisma.instructor.createMany({
    data: [
      { email: "instructor1@example.com", firstName: "Paul", lastName: "Martin" },
      { email: "instructor2@example.com", firstName: "Laura", lastName: "Bernard" },
    ],
  });
  console.log("Instructeurs ajoutés avec succès.");

  // Insertion de données pour les sessions (Session)
  await prisma.session.createMany({
    data: [
      {
        numeroStagePrefecture: "Stage 1 - 22-23 Décembre 2024",
        description: "Stage de récupération de points",
        startDate: new Date("2024-12-22"),
        endDate: new Date("2024-12-23"),
        location: "Paris",
        capacity: 20,
        instructorId: 1, // Assurez-vous que cet ID existe
      },
      {
        numeroStagePrefecture: "Stage 2 - 29-30 Décembre 2024",
        description: "Stage de sensibilisation",
        startDate: new Date("2024-12-29"),
        endDate: new Date("2024-12-30"),
        location: "Lyon",
        capacity: 15,
        instructorId: 2, // Assurez-vous que cet ID existe
      },
    ],
  });
  console.log("Sessions ajoutées avec succès.");

  // Insertion de données pour les inscriptions (Inscription)
  await prisma.inscription.createMany({
    data: [
      {
        nom: "Dupont",
        prenom: "Jean",
        adresse: "123 Rue de Paris",
        codePostal: "75000",
        ville: "Paris",
        telephone: "0600000001",
        email: "jean.dupont@example.com",
        stage: "Stage 1 - 22-23 Décembre 2024",
        nationalite: "Française",
        dateNaissance: new Date("1985-05-10"),
        idCard: "base64EncodedIdCard1",
        permis: "base64EncodedPermis1",
      },
      {
        nom: "Durand",
        prenom: "Marie",
        adresse: "456 Rue de Lyon",
        codePostal: "69000",
        ville: "Lyon",
        telephone: "0600000002",
        email: "marie.durand@example.com",
        stage: "Stage 2 - 29-30 Décembre 2024",
        nationalite: "Française",
        dateNaissance: new Date("1990-06-20"),
        idCard: "base64EncodedIdCard2",
        permis: "base64EncodedPermis2",
      },
    ],
  });
  console.log("Inscriptions ajoutées avec succès.");

  // Insertion de données pour les paiements (Payment)
  await prisma.payment.createMany({
    data: [
      { userId: 1, amount: 120.5, method: "Carte bancaire", paidAt: new Date("2024-12-01") },
      { userId: 2, amount: 150.0, method: "Virement bancaire", paidAt: new Date("2024-12-02") },
    ],
  });
  console.log("Paiements ajoutés avec succès.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
