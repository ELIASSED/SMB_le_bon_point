import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Réutilisation du client Prisma (Singleton)
let prisma;
if (!global.prisma) {
  global.prisma = new PrismaClient();
}
prisma = global.prisma;

export async function GET(req) {
  try {
    // Extraction des paramètres de pagination ou de filtre (optionnel)
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    // Requête optimisée avec sélection et pagination
    const sessions = await prisma.session.findMany({
      select: {
        id: true, // ID du stage
        numeroStageAnts: true, // Numéro de stage ANTS
        price: true, // Prix
        startDate: true, // Date de début
        endDate: true, // Date de fin
        location: true, // Localisation
        capacity: true, // Capacité
      },
      skip,
      take: limit,
    });

    // Compte total pour la pagination
    const total = await prisma.session.count();

    // Structure de réponse paginée
    return NextResponse.json({
      data: sessions,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des sessions:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des sessions.' },
      { status: 500 }
    );
  }
}
