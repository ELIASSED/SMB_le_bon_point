// prisma/seed.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Suppression des données existantes dans l'ordre (pour respecter les contraintes relationnelles)
  await prisma.payment.deleteMany();
  await prisma.relance.deleteMany();
  await prisma.sessionUsers.deleteMany();
  await prisma.session.deleteMany();
  await prisma.psychologue.deleteMany();
  await prisma.instructor.deleteMany();
  await prisma.user.deleteMany();

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

  // Création d'une session
  const session = await prisma.session.create({
    data: {
      numeroStageAnts: 'STAGE001',
      price: 200.0,
      description: 'Session de formation initiale',
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000), // 1 jour plus tard
      location: 'Paris',
      capacity: 20,
      instructorId: instructor.id,
      psychologueId: psychologue.id,
    },
  });

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
      // Suivi des relances
      relanceCount: 0,
      lastRelanceAt: null,
      // Scans d'images (optionnels)
      id_recto: null,
      id_verso: null,
      permis_recto: null,
      permis_verso: null,
      // Infos provenant de SessionUsers
      numeroPermis: 'P123456',
      dateDelivrancePermis: new Date('2020-01-01'),
      prefecture: 'Paris',
      etatPermis: 'Valide',
      casStage: 'N/A',
      // Statut de paiement global
      isPaid: false,
    },
  });

  // Création d'une inscription (SessionUsers) liant l'utilisateur à la session
  const sessionUser = await prisma.sessionUsers.create({
    data: {
      sessionId: session.id,
      userId: user.id,
    },
  });

  // Création d'un paiement associé à l'inscription
  const payment = await prisma.payment.create({
    data: {
      sessionUserId: sessionUser.id,
      amount: 200.0,
      method: 'Credit Card',
    },
  });

  // Création d'une relance pour l'utilisateur (en lien avec la session)
  const relance = await prisma.relance.create({
    data: {
      email: user.email,
      firstName: user.prenom,
      lastName: user.nom,
      phone: user.telephone,
      userId: user.id,
      lastSessionId: session.id, // Champ optionnel renseigné ici
      profession: 'Ingénieur',
    },
  });

  console.log('Base de données semée avec succès !');
  console.log({ instructor, psychologue, session, user, sessionUser, payment, relance });
}

main()
  .catch((error) => {
    console.error('Erreur lors du seed : ', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
