import React, { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

interface CheckoutFormProps {
  clientSecret: string; // Requis pour confirmer le paiement
  onPaymentSuccess: () => void; // Callback pour le succès du paiement
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ clientSecret, onPaymentSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Vérifiez que Stripe et Elements sont prêts
    if (!stripe || !elements) {
      setErrorMessage("Le système de paiement n'est pas prêt. Veuillez réessayer.");
      return;
    }

    setLoading(true); // Indique que le traitement est en cours
    setErrorMessage(null);

    // Récupérer l'élément de la carte
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setErrorMessage("Erreur lors du chargement de l'élément de carte. Veuillez réessayer.");
      setLoading(false);
      return;
    }

    try {
      // Confirmer le paiement avec Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement },
      });

      if (error) {
        // Gestion des erreurs de Stripe
        setErrorMessage(error.message || "Une erreur est survenue lors du paiement.");
        setLoading(false);
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        // Paiement réussi
        setErrorMessage(null);
        setLoading(false);
        onPaymentSuccess(); // Appeler le callback en cas de succès
      } else {
        // Autres statuts de paiement
        setErrorMessage("Le paiement n'a pas été finalisé. Veuillez réessayer.");
        setLoading(false);
      }
    } catch (error) {
      // Gestion des erreurs imprévues
      console.error("Erreur inattendue :", error);
      setErrorMessage("Une erreur inattendue est survenue. Veuillez réessayer.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <CardElement className="p-4 border rounded bg-white" />
      <button
        type="submit"
        disabled={!stripe || loading}
        className={`py-2 px-4 rounded text-white ${loading ? "bg-gray-400" : "bg-green-500 hover:bg-green-600"}`}
      >
        {loading ? "Traitement..." : "Payer"}
      </button>
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
    </form>
  );
};

export default CheckoutForm;
