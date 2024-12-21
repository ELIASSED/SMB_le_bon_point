import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2022-11-15", // Assurez-vous d'utiliser la version correcte
});

export async function POST(req: Request) {
  try {
    const { stageId, userId, stageDetails } = await req.json();

    if (!stageId || !userId) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }

    // Créer une session de paiement
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Inscription au stage - ${stageDetails.location}`,
              description: `Dates: ${stageDetails.startDate} - ${stageDetails.endDate}`,
            },
            unit_amount: stageDetails.price * 100, // Stripe attend des centimes
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Erreur lors de la création de la session de paiement :", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
