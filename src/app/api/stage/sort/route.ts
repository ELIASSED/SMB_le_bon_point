import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const url = new URL(request.url);

  // Récupération des paramètres de tri
  const orderDate = url.searchParams.get("orderDate") === "desc" ? "desc" : "asc";
  const orderPrice = url.searchParams.get("orderPrice") === "desc" ? "desc" : "asc";

  try {
    const sessions = await prisma.session.findMany({
      where: {
        capacity: {
          gt: 0, // Sessions avec des places disponibles
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
        { startDate: orderDate },
        { price: orderPrice },
      ],
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Erreur lors du tri des sessions :", error);
    return NextResponse.json(
      { error: "Impossible de trier les sessions" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
