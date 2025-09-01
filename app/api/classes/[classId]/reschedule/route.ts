import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { schedulingService } from '@/services/schedulingService';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ classId: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Acesso não autorizado. Sessão não encontrada.' }, { status: 401 });
    }

    try {
        const { classId } = await params;
        const { newScheduledAt, reason, availabilitySlotId } = await request.json();
        const reschedulerId = session.user.id;

        // --- Validação dos dados de entrada ---
        if (!newScheduledAt) {
            return NextResponse.json({ error: 'A nova data de agendamento é obrigatória.' }, { status: 400 });
        }

        const newScheduledDate = new Date(newScheduledAt);
        if (isNaN(newScheduledDate.getTime())) {
            return NextResponse.json({ error: 'Formato de data inválido.' }, { status: 400 });
        }

        // --- Chamada ao Serviço ---
        const result = await schedulingService.rescheduleClass({
            classId,
            reschedulerId,
            newScheduledAt: newScheduledDate,
            reason,
            availabilitySlotId,
        });

        return NextResponse.json({ message: 'Aula reagendada com sucesso.', data: result });

    } catch (error: any) {
        console.error("Erro ao reagendar aula:", error);
        // Retorna a mensagem de erro específica do serviço para o frontend
        return NextResponse.json({ error: error.message || 'Erro interno do servidor.' }, { status: 500 });
    }
}