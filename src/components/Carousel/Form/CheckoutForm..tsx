// components/Form/CheckoutForm.tsx
"use client";

import React from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";

interface CheckoutFormProps {
  clientSecret: string;
  onPaymentSuccess: () => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ clientSecret, onPaymentSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    const card = elements.getElement(CardElement);
    if (!card) {
      return;
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: card,
      },
    });

    if (error) {
      console.error("Erreur de paiement :", error.message);
      alert(`Erreur de paiement : ${error.message}`);
    } else if (paymentIntent?.status === "succeeded") {
      onPaymentSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border p-4 rounded-lg">
        <CardElement options={{ hidePostalCode: true }} />
      </div>
      <button
        type="submit"
        disabled={!stripe || !clientSecret}
        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors w-full"
      >
        Payer
      </button>
    </form>
  );
};

export default CheckoutForm;