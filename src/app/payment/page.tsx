// src/app/payment/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutForm from "../../components/Carousel/Form/CheckoutForm";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY)
  : null;

const PaymentPage = () => {
  const [clientSecret, setClientSecret] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!stripePromise) {
      setError("Clé publique Stripe manquante.");
      setLoading(false);
      return;
    }

    const fetchClientSecret = async () => {
      try {
        const response = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: 1000, currency: "eur" }),
        });

        if (!response.ok) {
          throw new Error("Échec de la création du PaymentIntent");
        }

        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (err) {
        console.error("Erreur lors de la récupération du clientSecret:", err);
        setError("Erreur lors de la préparation du paiement.");
      } finally {
        setLoading(false);
      }
    };

    fetchClientSecret();
  }, []);

  const handlePaymentSuccess = () => {
    console.log("Paiement réussi !");
  };

  if (loading) return <p>Chargement...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!clientSecret) return <p>Erreur : Aucun secret client disponible.</p>;

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm
        clientSecret={clientSecret}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </Elements>
  );
};

export default PaymentPage;