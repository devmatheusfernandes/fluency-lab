// app/api/teacher/create-class-with-credits/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { SchedulingService } from '@/services/schedulingService';
import { RegularCreditType } from '@/types/credits/regularClassCredits';

const schedulingService = new SchedulingService();

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  // Check permissions
  const userPermissions = session.user.permissions || [];
  if (!userPermissions.includes('class.create.with.credits')) {
    return NextResponse.json({ 
      error: 'Permissão insuficiente para criar aulas com créditos' 
    }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { studentId, scheduledAt, language, creditType, reason } = body;

    if (!studentId || !scheduledAt || !language) {
      return NextResponse.json({ 
        error: 'Dados obrigatórios faltando: studentId, scheduledAt, language' 
      }, { status: 400 });
    }

    // Validate scheduledAt is a valid date
    const classDate = new Date(scheduledAt);
    if (isNaN(classDate.getTime())) {
      return NextResponse.json({ 
        error: 'Data de agendamento inválida' 
      }, { status: 400 });
    }

    // Validate creditType if provided
    if (creditType && !Object.values(RegularCreditType).includes(creditType)) {
      return NextResponse.json({ 
        error: 'Tipo de crédito inválido. Use "bonus" ou "late-students"' 
      }, { status: 400 });
    }

    const result = await schedulingService.createClassWithCredits(
      session.user.id, // teacherId
      studentId,
      classDate,
      language,
      creditType,
      reason
    );

    return NextResponse.json({
      success: true,
      message: 'Aula criada com sucesso usando créditos do estudante',
      classData: result.classData,
      creditUsed: result.creditUsed
    });
  } catch (error: any) {
    console.error('Erro ao criar aula com créditos:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}