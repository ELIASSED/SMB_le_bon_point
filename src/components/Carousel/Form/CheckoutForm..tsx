import React, { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

export default function CheckoutForm({ clientSecret }: { clientSecret: string }) {
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
      setError("Stripe n'est pas encore chargé.");
      setIsProcessing(false);
      return;
    }
  
    const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      },
    });
  
    if (paymentError) {
      console.error("Erreur lors du paiement :", paymentError);
      setError(paymentError.message || "Erreur lors du paiement.");
      setIsProcessing(false);
      return;
    }
  
    console.log("Paiement réussi :", paymentIntent);
  
    setIsProcessing(false);
    onPaymentSuccess(); // ← Ici, la fonction doit être bien exécutée
  };
  

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={isProcessing || !stripe}>
        {isProcessing ? "Traitement en cours..." : "Payer"}
      </button>
    </form>
  );
}

onPaymentSuccess();
console.log("onPaymentSuccess exécuté !");


