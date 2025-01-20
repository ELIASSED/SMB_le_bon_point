import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST: Enregistrer des informations personnelles
// POST: Enregistrer les informations complètes
export async function POST(request: Request) {
  try {
    const personalInfo = await request.json();

    // Validation des données reçues
    if (!personalInfo.nom || !personalInfo.prenom || !personalInfo.email) {
      return NextResponse.json(
        { error: "Certains champs obligatoires sont manquants." },
        { status: 400 }
      );
    }

    // Sauvegarde dans la base de données
    const savedInfo = await prisma.personalInfo.create({
      data: personalInfo,
    });

    return NextResponse.json({
      message: "Données enregistrées avec succès.",
      data: savedInfo,
    });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement des données :", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'enregistrement." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
