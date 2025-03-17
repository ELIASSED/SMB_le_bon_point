// /api/update-payment-status/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const { sessionId, userId } = await request.json();
  try {
    const sessionUser = await prisma.sessionUsers.update({
      where: { sessionId_userId: { sessionId, userId } },
      data: { isPaid: true },
    });
    return NextResponse.json({ success: true, sessionUser });
  } catch (error: any) {
    console.error("Erreur lors de la mise à jour du paiement :", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}