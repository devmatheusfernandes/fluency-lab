import { NextRequest, NextResponse } from 'next/server';
import { withAuth, createTeacherConfig } from '../../../../lib/auth/middleware';
import { schedulingService } from '../../../../services/schedulingService';

/**
 * Endpoint para atualização de status de aulas
 * 
 * Aplicação do novo sistema de autorização:
 * - Validação automática de autenticação
 * - Verificação de role TEACHER, ADMIN ou MANAGER
 * - Validação de contexto (professor só pode atualizar aulas que leciona)
 * - Rate limiting (100 requests/min)
 * - Logging automático de operações
 */
async function updateClassStatusHandler(
  request: NextRequest,
  { params, authContext }: { params?: { classId: string }; authContext: any }
) {
  try {
    if (!params?.classId) {
      return NextResponse.json(
        { error: 'ID da aula é obrigatório.' },
        { status: 400 }
      );
    }
    const { classId } = params;
    const { status, feedback } = await request.json();

    if (!status) {
      return NextResponse.json(
        { error: 'Status é obrigatório.' },
        { status: 400 }
      );
    }

    // Validate status values
    const validStatuses = ['scheduled', 'completed', 'cancelled', 'no_show'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Status inválido.' },
        { status: 400 }
      );
    }

    // O middleware já validou:
    // 1. Autenticação do usuário
    // 2. Role de professor/admin/manager
    // 3. Contexto da aula (professor pode atualizar aulas que leciona)
    // 4. Rate limiting
    
    const result = await schedulingService.updateClassStatus(
      classId,
      status,
      feedback,
      authContext.userId
    );

    return NextResponse.json({
      success: true,
      message: 'Status da aula atualizado com sucesso.',
      data: result
    });
    
  } catch (error) {
    console.error('Erro ao atualizar status da aula:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
}

// Aplicar middleware de autorização com configuração específica para professores
export const PATCH = withAuth(
  updateClassStatusHandler,
  createTeacherConfig('class', 'general')
);