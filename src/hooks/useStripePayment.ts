// src/hooks/useStripePayment.ts
import { useState } from 'react';
import { useStripe, useElements } from '@stripe/react-stripe-js';
import { CardElement } from '@stripe/react-stripe-js';

export function useStripePayment(clientSecret: string, onPaymentSuccess: (paymentIntentId: string) => void) {
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
      setError('Une erreur est survenue lors du chargement du module de paiement.');
      setIsProcessing(false);
      return;
    }

    try {
      const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement },
      });

      if (paymentError) throw new Error(paymentError.message || 'Erreur lors du traitement du paiement.');
      if (paymentIntent?.status === 'succeeded') {
        onPaymentSuccess(paymentIntent.id);
      } else {
        throw new Error('Le paiement n’a pas pu être complété.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return { handleSubmit, isProcessing, error };
}