import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe('sk_test_51QZanrRMGRTdZZxCupIjUDrSfw7VlF1AZH5tl2HkwtaOZ4R2l5W3jX1Ejn7hpM8Sr3X2c020nuDOIeGLVvOY5Hwk00RUBcLkNx', {
  apiVersion: '2024-12-18.acacia',
});


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, currency } = body;

    if (!amount || !currency) {
      return NextResponse.json(
        { error: 'Montant et devise requis' },
        { status: 400 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method_types: ['card'],
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    console.error('Erreur PaymentIntent :', error.message);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
