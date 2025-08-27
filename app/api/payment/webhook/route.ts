// app/api/payment/webhook/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe/stripe';
import { PaymentService } from '@/services/paymentService';

const paymentService = new PaymentService();

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = (await headers()).get('Stripe-Signature') as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    const userId = session.metadata?.userId;
    const credits = session.metadata?.credits ? parseInt(session.metadata.credits, 10) : 0;
    const stripeCustomerId = session.customer as string;
    
    // 👇 ADICIONE ESTA LINHA para pegar o ID da transação
    const stripePaymentIntentId = session.payment_intent as string;

    if (!userId) {
      console.error("Webhook recebeu sessão sem userId na metadata");
      return NextResponse.json({ error: 'UserId não encontrado.' }, { status: 400 });
    }

    try {
      // 👇 ADICIONE A VARIÁVEL AQUI na chamada da função
      await paymentService.fulfillOneTimePayment({ userId, stripeCustomerId, credits, stripePaymentIntentId });
    } catch (error) {
      console.error("Erro ao processar pagamento no webhook:", error);
      return NextResponse.json({ error: 'Erro no servidor ao processar o webhook.' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}