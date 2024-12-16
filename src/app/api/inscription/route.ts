import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      nom,
      prenom,
      adresse,
      codePostal,
      ville,
      telephone,
      email,
      stageId, // ID de la session à réserver
      nationalite,
      dateNaissance,
      idCard,
      permis,
    } = body;

    // Vérifier que la session existe et a encore des places disponibles
    const session = await prisma.session.findUnique({
      where: { id: stageId },
    });

    if (!session) {
      return NextResponse.json({ error: "La session n'existe pas." }, { status: 404 });
    }

    if (session.capacity <= 0) {
      return NextResponse.json({ error: "Il n'y a plus de places disponibles pour cette session." }, { status: 400 });
    }

    // Créer un utilisateur s'il n'existe pas déjà
    const user = await prisma.user.upsert({
      where: { email }, // On identifie l'utilisateur par son email
      create: {
        email,
        firstName: prenom,
        lastName: nom,
        phone: telephone,
      },
      update: {
        firstName: prenom,
        lastName: nom,
        phone: telephone,
      },
    });

    // Créer l'inscription
    const inscription = await prisma.inscription.create({
      data: {
        nom,
        prenom,
        adresse,
        codePostal,
        ville,
        telephone,
        email,
        stage: session.numeroStagePrefecture, // Nom ou numéro de la session
        nationalite,
        dateNaissance: new Date(dateNaissance),
        idCard,
        permis,
      },
    });

    // Mettre à jour la capacité de la session (-1)
    await prisma.session.update({
      where: { id: stageId },
      data: {
        capacity: session.capacity - 1,
      },
    });

    return NextResponse.json({ inscription, user }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l\'inscription.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
