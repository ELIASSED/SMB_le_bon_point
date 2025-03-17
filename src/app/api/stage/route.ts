import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const url = new URL(request.url);

  // Paramètres de tri
  const orderDate = url.searchParams.get("orderDate") === "desc" ? "desc" : "asc";
  const orderPrice = url.searchParams.get("orderPrice") === "desc" ? "desc" : "asc";

  try {
    // Requête Prisma avec tri croisé
    const sessions = await prisma.session.findMany({
      where: {
        isArchived: false,
        capacity: {
          gt: 0, // Filtre : sessions avec des places disponibles
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
      orderBy: [
        { startDate: orderDate }, // Tri par date
        { price: orderPrice },    // Tri par prix
      ],
    });
    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Erreur Prisma :", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des sessions" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
