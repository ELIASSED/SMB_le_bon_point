// api/confirm-payment.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function POST(request: Request) {
  try {
    const { sessionId, userId, paymentIntentId } = await request.json();

    console.log("Données reçues dans /api/confirm-payment :", { sessionId, userId, paymentIntentId });

    if (!sessionId || !userId || !paymentIntentId) {
      return NextResponse.json(
        { error: "Données manquantes pour confirmer le paiement." },
        { status: 400 }
      );
    }

    const sessionUser = await prisma.sessionUsers.findUnique({
      where: {
        sessionId_userId: { sessionId, userId },
      },
    });

    if (!sessionUser) {
      console.log("Inscription non trouvée pour :", { sessionId, userId });
      return NextResponse.json(
        { error: "Inscription non trouvée." },
        { status: 404 }
      );
    }

    if (sessionUser.isPaid) {
      console.log("Inscription déjà payée :", sessionUser);
      return NextResponse.json(
        { error: "Cette inscription est déjà marquée comme payée." },
        { status: 400 }
      );
    }

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      console.log("Session non trouvée :", sessionId);
      return NextResponse.json(
        { error: "Session non trouvée." },
        { status: 404 }
      );
    }

    if (session.capacity <= 0) {
      console.log("Plus de places disponibles :", session);
      return NextResponse.json(
        { error: "Plus de places disponibles pour cette session." },
        { status: 400 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== "succeeded") {
      console.log("Paiement non réussi :", paymentIntent.status);
      return NextResponse.json(
        { error: `Le paiement n'a pas été confirmé. Statut : ${paymentIntent.status}` },
        { status: 400 }
      );
    }

    const updatedSessionUser = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.sessionUsers.update({
        where: {
          sessionId_userId: { sessionId, userId },
        },
        data: {
          isPaid: true,
          paymentIntentId, // Maintenant valide après migration
        },
      });

      await tx.session.update({
        where: { id: sessionId },
        data: { capacity: { decrement: 1 } },
      });

      return updatedUser;
    });

    console.log("Inscription mise à jour avec succès :", updatedSessionUser);

    return NextResponse.json({
      message: "Paiement confirmé avec succès. Votre place est réservée.",
      sessionUser: updatedSessionUser,
    });
  } catch (error: any) {
    console.error("Erreur dans /api/confirm-payment :", error.message);
    return NextResponse.json(
      { error: error.message || "Une erreur est survenue lors de la confirmation du paiement." },
      { status: error.message ? 400 : 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}