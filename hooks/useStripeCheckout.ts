'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export const useStripeCheckout = () => {
  const [isLoading, setIsLoading] = useState(false);

  // VERIFIQUE: A função aceita o segundo argumento 'credits' do tipo number?
  const redirectToCheckout = async (priceId: string, credits: number) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/payment/checkout-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // VERIFIQUE: O 'body' inclui a propriedade 'credits'?
        body: JSON.stringify({ priceId, credits }),
      });

      const { sessionId } = await response.json();
      if (!sessionId) throw new Error('Falha ao criar a sessão de checkout.');

      const stripe = await stripePromise;
      await stripe?.redirectToCheckout({ sessionId });

    } catch (error) {
      console.error("Erro ao redirecionar para o checkout:", error);
      alert("Não foi possível iniciar o pagamento. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return { redirectToCheckout, isLoading };
};