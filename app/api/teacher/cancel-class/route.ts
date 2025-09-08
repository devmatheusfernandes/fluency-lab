import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { schedulingService } from '@/services/schedulingService';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 401 });
  }

  // Verificar se é professor
  if (session.user.role !== 'teacher' && session.user.role !== 'admin' && session.user.role !== 'manager') {
    return NextResponse.json({ error: 'Apenas professores podem cancelar aulas.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { classId, reason, allowMakeup = true } = body;

    if (!classId) {
      return NextResponse.json({ error: 'ID da aula é obrigatório.' }, { status: 400 });
    }

    console.log(`[API Route] Canceling class ${classId} by teacher ${session.user.id}`, { reason, allowMakeup });
    
    const teacherId = session.user.id;
    const result = await schedulingService.cancelClassByTeacher(
      teacherId,
      classId,
      reason,
      allowMakeup
    );

    console.log(`[API Route] Class cancellation completed successfully for class ${classId}`);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[API Route] Erro ao cancelar aula:", error);
    console.error("[API Route] Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}