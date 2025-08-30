import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { schedulingService } from '@/services/schedulingService';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 401 });
  }

  try {
    const studentId = session.user.id;
    // Usamos o serviço para obter as aulas já "populadas" com os dados do professor
    const populatedClasses = await schedulingService.getPopulatedClassesForStudent(studentId);
    return NextResponse.json(populatedClasses);
  } catch (error: any) {
    console.error("Erro ao buscar as aulas do aluno:", error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}

