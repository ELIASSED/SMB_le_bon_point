// /app/api/payment/route.ts (ou le chemin de votre endpoint)
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, currency } = body;

    // Validation du montant et de la devise
    if (
      !amount ||
      typeof amount !== "number" ||
      amount <= 0 ||
      !currency
    ) {
      return NextResponse.json(
        { error: "Montant positif et devise requise." },
        { status: 400 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method_types: ["card"],
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error: any) {
    console.error("Erreur PaymentIntent :", error.message);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
