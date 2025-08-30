import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { schedulingService } from '@/services/schedulingService';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'teacher') {
    return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
  }

  try {
    const teacherId = session.user.id;
    const populatedClasses = await schedulingService.getPopulatedClassesForTeacher(teacherId);
    return NextResponse.json(populatedClasses);
  } catch (error: any) {
    console.error("Erro ao buscar aulas do professor:", error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}