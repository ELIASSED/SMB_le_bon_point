"use client";

import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Stage } from "../types";
import { formatDateWithDay } from "../utils";

interface PaymentStepProps {
  selectedStage: Stage | null;
  clientSecret: string | null;
  onPaymentSuccess: () => void;
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

const PaymentStep: React.FC<PaymentStepProps> = ({ selectedStage, clientSecret, onPaymentSuccess }) => {
  const renderSelectedStageInfo = () =>
    selectedStage && (
      <div className="mb-6 p-4 border rounded bg-gray-50">
        <h3 className="text-lg font-semibold mb-2">Stage Sélectionné</h3>
        <p>
          <span className="font-bold">Dates :</span> {formatDateWithDay(selectedStage.startDate)} au{" "}
          {formatDateWithDay(selectedStage.endDate)}
        </p>
        <p>
          <span className="font-bold">Localisation :</span> {selectedStage.location}
        </p>
        <p>
          <span className="font-bold">Numéro de stage préfectoral :</span>{" "}
          <span className="font-semibold">{selectedStage.numeroStageAnts}</span>
        </p>
        <p>
          <span className="font-bold">Places restantes :</span>{" "}
          <span className={selectedStage.capacity <= 5 ? "text-red-600" : "text-gray-600"}>
            {selectedStage.capacity}
          </span>
        </p>
        <p>
          <span className="font-bold text-green-600">Prix :</span>{" "}
          {selectedStage.price.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
        </p>
      </div>
    );

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Effectuez votre paiement</h3>
      {renderSelectedStageInfo()}
      {clientSecret ? (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm clientSecret={clientSecret} onPaymentSuccess={onPaymentSuccess} />
        </Elements>
      ) : (
        <p>Chargement des informations de paiement...</p>
      )}
    </div>
  );
};

interface CheckoutFormProps {
  clientSecret: string;
  onPaymentSuccess: () => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ clientSecret, onPaymentSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isProcessing || !stripe || !elements) return;

    setIsProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      console.error("CardElement non trouvé.");
      setError("Erreur avec les informations de paiement.");
      setIsProcessing(false);
      return;
    }

    console.log("Tentative de confirmation du paiement avec clientSecret :", clientSecret);
    const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardElement },
    });

    if (paymentError) {
      console.error("Erreur lors de la confirmation du paiement :", paymentError);
      setError(paymentError.message || "Erreur lors du paiement.");
      setIsProcessing(false);
    } else {
      console.log("Paiement réussi :", paymentIntent);
      setIsProcessing(false);
      onPaymentSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      {error && <div className="error text-red-500 mt-2">{error}</div>}
      <button
        type="submit"
        disabled={isProcessing || !stripe}
        className="mt-4 bg-indigo-600 text-white py-2 px-4 rounded disabled:opacity-50"
      >
        {isProcessing ? "Traitement en cours..." : "Payer"}
      </button>
    </form>
  );
};

export default PaymentStep;