// src/app/api/stripe-webhook/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-02-24.acacia' });

export async function POST(request: Request) {
  try {
    const sig = request.headers.get('stripe-signature');
    const body = await request.text();
    
    if (!sig) return NextResponse.json({ error: 'No signature' }, { status: 400 });
    
    const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Instead of directly accessing charges, retrieve the charges associated with this payment intent
        const charges = await stripe.charges.list({
          payment_intent: paymentIntent.id
        });
        
        const charge = charges.data[0];
        let notes = 'Détails de paiement non disponibles';
        
        if (charge && charge.payment_method_details && charge.payment_method_details.type === 'card') {
          const cardDetails = charge.payment_method_details.card;
          
          if (cardDetails) { // ✅ Check if cardDetails exists before accessing properties
            notes = `Carte: ${cardDetails.brand} se terminant par ${cardDetails.last4}, Pays: ${cardDetails.country || 'Inconnu'}, Type: ${cardDetails.funding || 'Inconnu'}`;
          }
        }
        await prisma.payment.update({
          where: { stripePaymentIntentId: paymentIntent.id },
          data: {
            status: 'COMPLETED',
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency.toUpperCase(),
            method: paymentIntent.payment_method_types.includes('card') ? 'CREDIT_CARD' : 'BANK_TRANSFER',
            notes,
            paidAt: charge ? new Date(charge.created * 1000) : new Date(),
            updatedAt: new Date(),
          },
        });
        
        // Also update the SessionUsers record to mark it as paid
        await prisma.sessionUsers.updateMany({
          where: { paymentIntentId: paymentIntent.id },
          data: { isPaid: true }
        });
        
        break;
      }
      
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        await prisma.payment.update({
          where: { stripePaymentIntentId: paymentIntent.id },
          data: {
            status: 'FAILED',
            notes: `Échec: ${paymentIntent.last_payment_error?.message || 'Raison inconnue'}`,
            updatedAt: new Date(),
          },
        });
        
        break;
      }
      
      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        
        await prisma.payment.update({
          where: { stripePaymentIntentId: charge.payment_intent as string },
          data: {
            status: 'REFUNDED',
            refundedAmount: charge.amount_refunded / 100,
            refundedAt: new Date(),
            updatedAt: new Date(),
          },
        });
        
        // If fully refunded, also update the SessionUsers record
        if (charge.refunded) {
          await prisma.sessionUsers.updateMany({
            where: { paymentIntentId: charge.payment_intent as string },
            data: { isPaid: false }
          });
        }
        
        break;
      }
    }
    
    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    console.error('❌ Erreur webhook:', error);
    return NextResponse.json({ error: 'Erreur webhook' }, { status: 400 });
  } finally {
    await prisma.$disconnect();
  }
}