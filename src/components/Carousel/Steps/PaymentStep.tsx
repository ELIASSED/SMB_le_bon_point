"use client";
import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Stage } from "../types";
import { formatDateWithDay } from "../utils";

interface PaymentStepProps {
  selectedStage: Stage | null;
  clientSecret: string | null;
  onPaymentSuccess: (paymentIntentId: string) => void;
}

// Configuration du style pour CardElement
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#32325d",
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": {
        color: "#aab7c4",
      },
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a",
    },
  },
};

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

const PaymentStep: React.FC<PaymentStepProps> = ({ selectedStage, clientSecret, onPaymentSuccess }) => {
  const renderSelectedStageInfo = () =>
    selectedStage && (
      <div className="mb-6 p-5 border border-gray-200 rounded-lg bg-white shadow-sm">
        <h3 className="text-lg font-semibold mb-3 pb-2 border-b border-gray-100">Récapitulatif de commande</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Dates :</span>
            <span className="font-medium">
              {formatDateWithDay(selectedStage.startDate)} au{" "}
              {formatDateWithDay(selectedStage.endDate)}
            </span>
          </div>
      
          <div className="flex justify-between">
            <span className="text-gray-600">N° préfectoral :</span>
            <span className="font-medium">{selectedStage.numeroStageAnts}</span>
          </div>
          <div className="flex justify-between pt-3 mt-2 border-t border-gray-100">
            <span className="text-lg font-bold">Total à payer :</span>
            <span className="text-lg font-bold text-green-600">
              {(selectedStage.price).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
            </span>
          </div>
        </div>
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto">

      {renderSelectedStageInfo()}
      <div className="bg-white p-5 border border-gray-200 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Informations de paiement</h3>
        {clientSecret ? (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm 
              clientSecret={clientSecret} 
              onPaymentSuccess={onPaymentSuccess} 
              price={selectedStage?.price || 0} 
            />
          </Elements>
        ) : (
          <div className="flex items-center justify-center py-6">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mr-2"></div>
            <p>Chargement des informations de paiement...</p>
          </div>
        )}
      </div>
      <div className="mt-5 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-gray-500 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p className="text-sm text-gray-600">
            Paiement sécurisé par Stripe. Vos données bancaires sont cryptées et ne transitent jamais par nos serveurs.
          </p>
        </div>
      </div>
    </div>
  );
};

interface CheckoutFormProps {
  clientSecret: string;
  onPaymentSuccess: (paymentIntentId: string) => void;
  price: number;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ clientSecret, onPaymentSuccess, price }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isProcessing) return;

    setIsProcessing(true);
    setError(null);

    const cardElement = elements?.getElement(CardElement);
    if (!stripe || !cardElement) {
      setError("Une erreur est survenue lors du chargement du module de paiement.");
      setIsProcessing(false);
      return;
    }

    const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      },
    });

    if (paymentError) {
      setError(paymentError.message || "Une erreur est survenue lors du traitement de votre paiement.");
      setIsProcessing(false);
      return;
    }

    if (paymentIntent && paymentIntent.status === "succeeded") {
      setIsProcessing(false);
      onPaymentSuccess(paymentIntent.id);
    } else {
      setError("Le paiement n'a pas pu être complété. Veuillez réessayer.");
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Numéro de carte, date d'expiration, CVC
        </label>
        <div className="p-4 border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <img src="/images/secure-payment.svg" alt="Paiement sécurisé" className="h-8 w-auto mr-2" />
        </div>
        <button
          type="submit"
          disabled={isProcessing || !stripe}
          className="w-1/2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-md font-medium transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {isProcessing ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              <span>Traitement...</span>
            </div>
          ) : (
            `Payer ${price ? (price).toLocaleString("fr-FR", { style: "currency", currency: "EUR" }) : ""}`
          )}
        </button>
      </div>
    </form>
  );
};

export default PaymentStep;