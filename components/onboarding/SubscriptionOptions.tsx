"use client";

import { useStripeCheckout } from "@/hooks/useStripeCheckout";

const plans = [
  // Garanta que 'credits' existe aqui para cada plano
  //MODIFICAR CREDITOS PARA OUTRO LUGAR POR QUESTIES DE SEGURANÇA
  {
    name: "Pacote 4 Aulas",
    priceId: "price_1RzpNqR2ryMkitGRmweb0CK2",
    credits: 4,
  },
  {
    name: "Pacote 8 Aulas",
    priceId: "price_1RzpOJR2ryMkitGRIsDcWEbi",
    credits: 8,
  },
];

export default function SubscriptionOptions() {
  const { redirectToCheckout, isLoading } = useStripeCheckout();

  return (
    <div>
      {plans.map((plan) => (
        <div key={plan.priceId} /* ... */>
          <h2>{plan.name}</h2>
          <p>{plan.credits} créditos de aula</p>
          {/* VERIFIQUE: A função é chamada com DOIS argumentos: priceId e plan.credits? */}
          <button
            onClick={() => redirectToCheckout(plan.priceId, plan.credits)}
            disabled={isLoading}
          >
            {isLoading ? "Aguarde..." : "Assinar Agora"}
          </button>
        </div>
      ))}
    </div>
  );
}
