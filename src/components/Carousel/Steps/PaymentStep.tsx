"use client";
import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Stage } from "../types";
import { formatDateWithDay } from "../utils";

interface PaymentStepProps {
  selectedStage: Stage | null;
  clientSecret: string | null;
  onPaymentSuccess: (paymentIntentId: string) => void;
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || "");

const PaymentStep: React.FC<PaymentStepProps> = ({ selectedStage, clientSecret, onPaymentSuccess }) => {
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY) {
    console.error("Clé publique Stripe manquante dans les variables d'environnement.");
    return <p className="text-red-500">Erreur de configuration. Contactez le support.</p>;
  }

  if (!clientSecret) {
    console.error("clientSecret non fourni à PaymentStep.");
    return (
      <p className="text-red-500">Erreur : Impossible de charger le paiement. Veuillez réessayer ou contacter le support.</p>
    );
  }

  if (!selectedStage) {
    console.error("selectedStage non fourni à PaymentStep.");
    return <p className="text-red-500">Erreur : Aucun stage sélectionné.</p>;
  }

  const renderSelectedStageInfo = () => (
    <div className="mb-8 p-6 bg-white border rounded-lg shadow-sm">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Résumé de votre commande</h3>
      <div className="space-y-2 text-gray-700">
        <p>
          <span className="font-medium">Stage :</span> {selectedStage.numeroStageAnts}
        </p>
        <p>
          <span className="font-medium">Dates :</span> {formatDateWithDay(selectedStage.startDate)} au{" "}
          {formatDateWithDay(selectedStage.endDate)}
        </p>
        <p>
          <span className="font-medium">Lieu :</span> {selectedStage.location}
        </p>
        <p>
          <span className="font-medium">Places restantes :</span>{" "}
          <span className={selectedStage.capacity <= 5 ? "text-red-600" : "text-gray-600"}>
            {selectedStage.capacity}
          </span>
        </p>
        <p className="text-lg font-semibold text-gray-900">
          <span>Total :</span>{" "}
          {selectedStage.price.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
        </p>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Paiement sécurisé</h2>
      {renderSelectedStageInfo()}
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <CheckoutForm selectedStage={selectedStage} clientSecret={clientSecret} onPaymentSuccess={onPaymentSuccess} />
      </Elements>
    </div>
  );
};

interface CheckoutFormProps {
  selectedStage: Stage;
  clientSecret: string;
  onPaymentSuccess: (paymentIntentId: string) => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ selectedStage, clientSecret, onPaymentSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [billingDetails, setBillingDetails] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
    country: "FR",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBillingDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isProcessing) {
      console.log("Paiement déjà en cours de traitement.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    if (!stripe || !elements) {
      console.error("Stripe ou Elements non initialisé.");
      setError("Erreur de chargement du paiement. Veuillez rafraîchir la page.");
      setIsProcessing(false);
      return;
    }

    const cardNumberElement = elements.getElement(CardNumberElement);
    if (!cardNumberElement) {
      console.error("Élément de carte non trouvé.");
      setError("Informations de carte invalides.");
      setIsProcessing(false);
      return;
    }

    if (!billingDetails.name || !billingDetails.email || !billingDetails.address || !billingDetails.postalCode) {
      console.error("Champs de facturation manquants :", billingDetails);
      setError("Veuillez remplir tous les champs obligatoires.");
      setIsProcessing(false);
      return;
    }

    try {
      console.log("Tentative de confirmation de paiement avec clientSecret :", clientSecret);
      const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardNumberElement,
          billing_details: {
            name: billingDetails.name,
            email: billingDetails.email,
            address: {
              line1: billingDetails.address,
              city: billingDetails.city,
              postal_code: billingDetails.postalCode,
              country: billingDetails.country,
            },
          },
        },
      });

      if (paymentError) {
        console.error("Erreur Stripe :", paymentError);
        setError(paymentError.message || "Échec du paiement. Vérifiez vos informations.");
        setIsProcessing(false);
        return;
      }

      if (!paymentIntent) {
        console.error("Aucun paymentIntent retourné par Stripe.");
        setError("Erreur interne lors du paiement. Veuillez réessayer.");
        setIsProcessing(false);
        return;
      }

      console.log("paymentIntent reçu :", paymentIntent);
      switch (paymentIntent.status) {
        case "succeeded":
          console.log("Paiement réussi avec paymentIntentId :", paymentIntent.id);
          setIsProcessing(false);
          onPaymentSuccess(paymentIntent.id);
          break;
        case "requires_action":
          console.log("Action supplémentaire requise :", paymentIntent);
          setError("Authentification supplémentaire requise. Vérifiez avec votre banque.");
          setIsProcessing(false);
          break;
        case "requires_payment_method":
          console.log("Méthode de paiement requise :", paymentIntent);
          setError("Paiement échoué. Veuillez essayer une autre méthode de paiement.");
          setIsProcessing(false);
          break;
        default:
          console.error("Statut inattendu :", paymentIntent.status);
          setError(`Statut inattendu : ${paymentIntent.status}. Contactez le support.`);
          setIsProcessing(false);
      }
    } catch (err: any) {
      console.error("Erreur inattendue dans handleSubmit :", err.message, err.stack);
      setError(err.message || "Erreur lors du traitement du paiement. Veuillez réessayer.");
      setIsProcessing(false);
    }
  };

  const inputStyle = "w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500";

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Section Informations de facturation */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Informations de facturation</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet *</label>
            <input
              type="text"
              name="name"
              value={billingDetails.name}
              onChange={handleInputChange}
              className={inputStyle}
              placeholder="Jean Dupont"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              name="email"
              value={billingDetails.email}
              onChange={handleInputChange}
              className={inputStyle}
              placeholder="jean.dupont@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse *</label>
            <input
              type="text"
              name="address"
              value={billingDetails.address}
              onChange={handleInputChange}
              className={inputStyle}
              placeholder="123 Rue Exemple"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ville *</label>
              <input
                type="text"
                name="city"
                value={billingDetails.city}
                onChange={handleInputChange}
                className={inputStyle}
                placeholder="Paris"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code postal *</label>
              <input
                type="text"
                name="postalCode"
                value={billingDetails.postalCode}
                onChange={handleInputChange}
                className={inputStyle}
                placeholder="75001"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
            <select
              name="country"
              value={billingDetails.country}
              onChange={handleInputChange}
              className={inputStyle}
            >
              <option value="FR">France</option>
              <option value="BE">Belgique</option>
              <option value="CH">Suisse</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section Paiement */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Informations de paiement</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de carte *</

label>
            <div className="p-3 bg-gray-50 border border-gray-300 rounded-md">
              <CardNumberElement
                options={{
                  style: {
                    base: { fontSize: "16px", color: "#424770", "::placeholder": { color: "#aab7c4" } },
                    invalid: { color: "#9e2146" },
                  },
                }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date d'expiration *</label>
              <div className="p-3 bg-gray-50 border border-gray-300 rounded-md">
                <CardExpiryElement
                  options={{
                    style: {
                      base: { fontSize: "16px", color: "#424770", "::placeholder": { color: "#aab7c4" } },
                      invalid: { color: "#9e2146" },
                    },
                  }}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CVC *</label>
              <div className="p-3 bg-gray-50 border border-gray-300 rounded-md">
                <CardCvcElement
                  options={{
                    style: {
                      base: { fontSize: "16px", color: "#424770", "::placeholder": { color: "#aab7c4" } },
                      invalid: { color: "#9e2146" },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Message d'erreur et bouton */}
      <div className="md:col-span-2">
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md animate-fade-in">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={isProcessing || !stripe}
          className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-300 ${
            isProcessing || !stripe
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg"
          }`}
        >
          {isProcessing ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin h-5 w-5 mr-2 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                ></path>
              </svg>
              Traitement en cours...
            </span>
          ) : (
            `Payer ${selectedStage.price.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}`
          )}
        </button>
      </div>
    </form>
  );
};

export default PaymentStep;