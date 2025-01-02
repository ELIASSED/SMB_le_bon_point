import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

// Helper function to validate inputs
function validateRequestBody(body) {
  const { amount, currency } = body;
  if (!amount || typeof amount !== 'number' || amount <= 0) {
    return 'Montant invalide ou manquant';
  }
  if (!currency || typeof currency !== 'string') {
    return 'Devise invalide ou manquante';
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const validationError = validateRequestBody(body);
    if (validationError) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      );
    }

    const { amount, currency } = body;

    // Create payment intent asynchronously
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method_types: ['card'],
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error: any) {
    console.error('Erreur PaymentIntent :', {
      message: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
