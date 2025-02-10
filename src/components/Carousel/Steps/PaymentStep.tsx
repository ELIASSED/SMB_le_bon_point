// components/Carousel/PaymentStep.tsx
"use client";
import React from "react";
import { Stage } from "../../types";
import { formatDateWithDay } from "../../utils";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "../Form/CheckoutForm."; // Chemin d'import à ajuster selon votre structure

interface PaymentStepProps {
  selectedStage: Stage | null;
  clientSecret: string | null;
  onPaymentSuccess: () => void;
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

const PaymentStep: React.FC<PaymentStepProps> = ({
  selectedStage,
  clientSecret,
  onPaymentSuccess,
}) => {
  const renderSelectedStageInfo = () =>
    selectedStage && (
      <div className="mb-6 p-4 border rounded bg-gray-50">
        <h3 className="text-lg font-semibold mb-2">Stage Sélectionné</h3>
        <p>
          <span className="font-bold">Dates :</span>{" "}
          {formatDateWithDay(selectedStage.startDate)} au{" "}
          {formatDateWithDay(selectedStage.endDate)}
        </p>
        <p>
          <span className="font-bold">{selectedStage.location}</span>
        </p>
        <p>
          <span className="font-bold">Numéro de stage préfectoral :</span>{" "}
          <span className="font-semibold">{selectedStage.numeroStageAnts}</span>
        </p>
        <p>
          <span className="font-bold">Places restantes :</span>{" "}
          <span
            className={
              selectedStage.capacity <= 5 ? "text-red-600 " : "text-gray-600 "
            }
          >
            {selectedStage.capacity}
          </span>
        </p>
        <p>
          <span className="font-bold text-green-600">Prix :</span>{" "}
          {selectedStage.price.toLocaleString("fr-FR", {
            style: "currency",
            currency: "EUR",
          })}
        </p>
      </div>
    );

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Effectuez votre paiement</h3>
      {renderSelectedStageInfo()}
      {clientSecret ? (
      <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm 
        clientSecret={clientSecret} 
        onPaymentSuccess={onPaymentSuccess}
      />
    </Elements>
    
      ) : (
        <p>Chargement des informations de paiement...</p>
      )}
    </div>
  );
};

export default PaymentStep;
