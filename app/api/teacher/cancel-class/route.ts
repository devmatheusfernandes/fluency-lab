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

    const teacherId = session.user.id;
    const result = await schedulingService.cancelClassByTeacher(
      teacherId,
      classId,
      reason,
      allowMakeup
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Erro ao cancelar aula:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}