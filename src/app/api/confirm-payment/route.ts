// src/app/api/confirm-payment/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient, SessionUsers, User, Session } from '@prisma/client';
import Stripe from 'stripe';
import generateAttestation from '@/lib/generateAttestation';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

type ConfirmPaymentRequest = {
  sessionId: number;
  userId: number;
  paymentIntentId: string;
};

type ConfirmPaymentResponse = {
  message: string;
  sessionUser?: SessionUsers;
  error?: string;
};

export async function POST(request: Request) {
  try {
    const { sessionId, userId, paymentIntentId } = (await request.json()) as ConfirmPaymentRequest;

   // console.log('📥 Données reçues dans /api/confirm-payment:', { sessionId, userId, paymentIntentId });

    if (!sessionId || !userId || !paymentIntentId) {
      console.warn('⚠️ Données manquantes');
      return NextResponse.json({ error: 'Données manquantes.' }, { status: 400 });
    }

    const sessionUser = await prisma.sessionUsers.findUnique({
      where: { sessionId_userId: { sessionId, userId } },
      include: { user: true, session: true },
    });

    if (!sessionUser) {
      console.warn('⚠️ Inscription non trouvée:', { sessionId, userId });
      return NextResponse.json({ error: 'Inscription non trouvée.' }, { status: 404 });
    }

    if (sessionUser.isPaid) {
     // console.log('ℹ️ Déjà payé:', sessionUser);
      return NextResponse.json({ error: 'Déjà payé.' }, { status: 400 });
    }

    const session = await prisma.session.findUnique({ where: { id: sessionId } });
    if (!session || session.capacity <= 0) {
      console.warn('⚠️ Session invalide:', session);
      return NextResponse.json({ error: 'Session invalide ou complète.' }, { status: 400 });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== 'succeeded') {
      console.warn('⚠️ Paiement non réussi:', paymentIntent.status);
      return NextResponse.json({ error: `Paiement non réussi: ${paymentIntent.status}` }, { status: 400 });
    }

    // Transaction pour les mises à jour critiques uniquement
    const updatedSessionUser = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.sessionUsers.update({
        where: { sessionId_userId: { sessionId, userId } },
        data: { isPaid: true, paymentIntentId },
        include: { user: true, session: true },
      });

      await tx.session.update({
        where: { id: sessionId },
        data: { capacity: { decrement: 1 } },
      });

      return updatedUser;
    });

    return NextResponse.json({
      message: 'Paiement confirmé. Attestation stockée dans la base de données.',
      sessionUser: updatedSessionUser,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error('❌ Erreur dans /api/confirm-payment:', errMessage);
    return NextResponse.json({ error: errMessage }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}