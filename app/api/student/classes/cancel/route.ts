import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { SchedulingService } from '@/services/schedulingService';

const schedulingService = new SchedulingService();

// Agora a rota é estática, ex: POST /api/student/classes/cancel
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    // Pegamos o ID da aula do corpo da requisição
    const { classId } = await request.json();
    if (!classId) {
      return NextResponse.json({ error: 'O ID da aula é obrigatório.' }, { status: 400 });
    }

    const result = await schedulingService.cancelClassByStudent(session.user.id, classId);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}