// app/api/sessions/route.ts (ou pages/api/sessions.ts)
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const url = new URL(request.url);
  
  try {
    const sessions = await prisma.session.findMany({
      where: {
        isArchived: false,
        capacity: {
          gt: 0, // Filtre pour les sessions avec places disponibles
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
        instructor: {
          select: {
            numeroAutorisationPrefectorale: true,
          },
        },
        psychologue: {
          select: {
            numeroAutorisationPrefectorale: true,
          },
        },
      }
    });

    return NextResponse.json(sessions, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération des sessions :", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération des sessions" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}