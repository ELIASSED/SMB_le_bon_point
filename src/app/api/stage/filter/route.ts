import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const url = new URL(request.url);

  // Paramètres de filtrage
  const minPrice = parseFloat(url.searchParams.get("minPrice") || "0");
  const maxPrice = parseFloat(url.searchParams.get("maxPrice") || "Infinity");
  const location = url.searchParams.get("location");

  try {
    const sessions = await prisma.session.findMany({
      where: {
        price: {
          gte: minPrice,
          lte: maxPrice,
        },
        ...(location && { location }), // Filtre par lieu si fourni
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
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Erreur lors du filtrage des sessions :", error);
    return NextResponse.json(
      { error: "Impossible de filtrer les sessions" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
