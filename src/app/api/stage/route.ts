import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Récupération des sessions avec capacité > 0
    // et sélection des champs nécessaires
    const sessions = await prisma.session.findMany({
      where: {
        capacity: {
          gt: 0, // strictly greater than 0
        },
      },
      select: {
        id: true,
        numeroStageAnts: true,
        price: true,
        startDate: true,
        endDate: true,
        location: true,
        capacity: true,
      },
      // Tri croissant par date de début (optionnel)
      orderBy: {
        startDate: "asc",
      },
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Erreur lors de la récupération des sessions:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération des sessions." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
