// pages/api/session/[id].ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const sessionId = parseInt(id, 10);
    const session = await prisma.session.findFirst({
      where: {
        id: sessionId,
        isArchived: false, // On ne renvoie que les sessions non archivées
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

    if (!session) {
      return NextResponse.json({ error: "Session non trouvée ou archivée" }, { status: 404 });
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error("Erreur lors de la récupération de la session :", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la session" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
