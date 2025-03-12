import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { sessionId, userId, paymentIntentId } = await request.json();

    console.log("Données reçues dans /api/update-payment :", { sessionId, userId, paymentIntentId });

    if (!sessionId || !userId || !paymentIntentId) {
      return NextResponse.json(
        { error: "Données manquantes pour confirmer le paiement." },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // Vérifier l'existence de l'inscription
      const sessionUser = await tx.sessionUsers.findUnique({
        where: {
          sessionId_userId: { sessionId, userId },
        },
      });

      if (!sessionUser) {
        console.log("Inscription non trouvée pour :", { sessionId, userId });
        throw new Error("Inscription non trouvée.");
      }

      if (sessionUser.isPaid) {
        console.log("Inscription déjà payée :", sessionUser);
        throw new Error("Cette inscription est déjà marquée comme payée.");
      }

      // Vérifier la session et la capacité
      const session = await tx.session.findUnique({
        where: { id: sessionId },
      });

      if (!session) {
        console.log("Session non trouvée :", sessionId);
        throw new Error("Session non trouvée.");
      }

      if (session.capacity <= 0) {
        console.log("Plus de places disponibles :", session);
        throw new Error("Plus de places disponibles pour cette session.");
      }

      // Mettre à jour l'inscription avec isPaid à true
      const updatedSessionUser = await tx.sessionUsers.update({
        where: {
          sessionId_userId: { sessionId, userId },
        },
        data: {
          isPaid: true,
          paymentIntentId,
        },
      });

      // Décrémenter la capacité
      await tx.session.update({
        where: { id: sessionId },
        data: { capacity: { decrement: 1 } },
      });

      console.log("Inscription mise à jour avec succès :", updatedSessionUser);
      return updatedSessionUser;
    });

    return NextResponse.json({
      message: "Paiement confirmé avec succès. Votre place est réservée.",
      sessionUser: result,
    });
  } catch (error: any) {
    console.error("Erreur dans /api/update-payment :", error.message);
    return NextResponse.json(
      { error: error.message || "Une erreur est survenue lors de la confirmation du paiement." },
      { status: error.message ? 400 : 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}