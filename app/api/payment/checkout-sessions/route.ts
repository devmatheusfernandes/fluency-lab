// app/api/payment/checkout-sessions/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PaymentService } from '@/services/paymentService';

const paymentService = new PaymentService();

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  try {
    // 👇 CORREÇÃO 1: Ler 'credits' junto com 'priceId' do corpo da requisição
    const { priceId, credits } = await request.json();
    
    // 👇 CORREÇÃO 2: Validar se os créditos foram recebidos
    if (!priceId || credits === undefined) {
      return NextResponse.json({ error: 'ID do Preço e Créditos são obrigatórios.' }, { status: 400 });
    }

    const checkoutSession = await paymentService.createCheckoutSession({
      priceId,
      userId: session.user.id,
      userEmail: session.user.email!,
      credits, // 👇 CORREÇÃO 3: Passar os créditos para o serviço
    });
    
    return NextResponse.json({ sessionId: checkoutSession.id });
  } catch (error: any) {
    console.error("Erro na API de Checkout:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}