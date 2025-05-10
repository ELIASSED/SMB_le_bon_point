// src/components/Carousel/Form/CheckoutForm.tsx
"use client";
import React from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";

interface CheckoutFormProps {
  clientSecret: string;
  onPaymentSuccess: () => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ clientSecret, onPaymentSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = React.useState<string | null>(null);
  const [processing, setProcessing] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (error) {
      setError(error.message || "Une erreur est survenue lors du paiement.");
      setProcessing(false);
    } else if (paymentIntent?.status === "succeeded") {
      setProcessing(false);
      onPaymentSuccess(); // Appeler la fonction de succès
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {error && <p className="text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={!stripe || processing}
        className="mt-4 bg-blue-500 text-white py-2 px-4 rounded"
      >
        {processing ? "Traitement..." : "Payer"}
      </button>
    </form>
  );
};

export default CheckoutForm;