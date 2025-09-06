import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { ClassStatus } from '@/types/classes/class';
import { schedulingService } from '@/services/schedulingService';
import { authOptions } from '../../auth/[...nextauth]/route';

// Manipulador para o método PATCH para atualizar status da aula
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 401 });
  }

  try {
    const { classId } = await params;
    const { status, feedback } = (await request.json()) as { status?: ClassStatus, feedback?: string };

    // If neither status nor feedback is provided, return an error
    if (!status && !feedback) {
      return NextResponse.json({ error: 'Nenhum dado fornecido para atualização.' }, { status: 400 });
    }

    // If status is provided, validate it
    if (status && !Object.values(ClassStatus).includes(status)) {
      return NextResponse.json({ error: 'Status inválido fornecido.' }, { status: 400 });
    }

    const updatedClass = await schedulingService.updateClassStatus(
      classId,
      status || undefined, // Pass undefined if no status provided
      feedback,
      session.user.id
    );

    return NextResponse.json({ message: 'Aula atualizada com sucesso.', data: updatedClass });
  } catch (error: any) {
    console.error("Erro ao atualizar aula:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}