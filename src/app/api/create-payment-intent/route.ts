import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

interface PaymentIntentRequest {
  amount: number;
  currency: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as PaymentIntentRequest;

    if (!body.amount || !body.currency) {
      return NextResponse.json({ error: 'Amount and currency are required.' }, { status: 400 });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: body.amount,
      currency: body.currency,
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}