"use client";

import React, { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { CircularProgress } from "@mui/material"; // Import pour un spinner élégant

interface CheckoutFormProps {
  clientSecret: string;
  onPaymentSuccess: () => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ clientSecret, onPaymentSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) return;

    setLoading(true);
    setErrorMessage(null);

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardElement },
    });

    if (error) {
      setLoading(false);
      setErrorMessage(error.message || "Une erreur est survenue.");
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      setLoading(false);
      onPaymentSuccess();
    }
  };

  return (
    <div className="flex flex-col items-center bg-gray-100 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Paiement sécurisé</h2>
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
        <div className="p-4 bg-white rounded-md shadow-sm border border-gray-300">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#424770",
                  "::placeholder": {
                    color: "#aab7c4",
                  },
                },
                invalid: {
                  color: "#9e2146",
                },
              },
            }}
          />
        </div>
        {errorMessage && (
          <div className="text-red-500 text-sm font-medium">{errorMessage}</div>
        )}

        <button
          type="submit"
          disabled={!stripe || loading}
          className={`w-full py-3 text-white font-semibold rounded-md shadow-sm transition-all duration-200 ${
            loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center space-x-2">
              <CircularProgress size={20} color="inherit" />
              <span>Traitement...</span>
            </span>
          ) : (
            "Valider le paiement"
          )}
        </button>
      </form>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-center">
            <CircularProgress size={50} />
            <p className="text-white mt-4">Nous vérifions votre transaction...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutForm;