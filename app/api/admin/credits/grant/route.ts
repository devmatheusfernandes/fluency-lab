// app/api/admin/credits/grant/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { CreditService } from '@/services/creditService';
import { GrantCreditRequest } from '@/types/credits/regularClassCredits';

const creditService = new CreditService();

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  // Check permissions
  const userPermissions = session.user.permissions || [];
  if (!userPermissions.includes('credits.grant')) {
    return NextResponse.json({ error: 'Permissão insuficiente para conceder créditos' }, { status: 403 });
  }

  try {
    const body: GrantCreditRequest = await request.json();
    const { studentId, type, amount, expiresAt, reason } = body;

    if (!studentId || !type || !amount || !expiresAt) {
      return NextResponse.json({ 
        error: 'Dados obrigatórios faltando: studentId, type, amount, expiresAt' 
      }, { status: 400 });
    }

    if (amount <= 0) {
      return NextResponse.json({ 
        error: 'A quantidade de créditos deve ser maior que zero' 
      }, { status: 400 });
    }

    if (new Date(expiresAt) <= new Date()) {
      return NextResponse.json({ 
        error: 'A data de expiração deve ser no futuro' 
      }, { status: 400 });
    }

    const credit = await creditService.grantCredits(body, session.user.id);

    return NextResponse.json({
      success: true,
      message: 'Créditos concedidos com sucesso',
      credit
    });
  } catch (error: any) {
    console.error('Erro ao conceder créditos:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}