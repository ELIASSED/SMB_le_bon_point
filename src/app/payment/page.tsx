'use client'
import React, { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from '../../components/CheckoutForm';

const stripePromise = loadStripe('pk_test_51QZanrRMGRTdZZxCjR9M8KuCAy5WkE8qegWemU6DXLRl8bf9wOaBTn1EXxM904utdj530nWGTUaojNHfg8yArzpg00LfWZneVt');

const PaymentPage: React.FC = () => {
  const [clientSecret, setClientSecret] = useState<string>('');

  useEffect(() => {
    fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 1000, currency: 'eur' }),
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret))
      .catch((err) => console.error('Erreur lors de la récupération du clientSecret:', err));
  }, []);

  const handlePaymentSuccess = () => {
    console.log('Paiement réussi !');
  };

  if (!clientSecret) return <p>Chargement...</p>;

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm clientSecret={clientSecret} onPaymentSuccess={handlePaymentSuccess} />
    </Elements>
  );
};

export default PaymentPage;
