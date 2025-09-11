// app/api/profile/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, createUniversalConfig } from '../../../lib/auth/middleware';
import { UserService } from '../../../services/userService';

const userService = new UserService();

/**
 * Endpoint para atualização de perfil do usuário
 * 
 * Aplicação do novo sistema de autorização:
 * - Validação automática de autenticação
 * - Acesso universal (todos os roles podem atualizar seu próprio perfil)
 * - Validação de ownership (usuário só pode atualizar seu próprio perfil)
 * - Rate limiting (100 requests/min)
 * - Logging automático de operações
 */
async function updateProfileHandler(
  request: NextRequest,
  { params, authContext }: { params?: any; authContext: any }
) {
  try {
    const updateData = await request.json();
    
    // Validate that sensitive fields are not being updated
    const restrictedFields = ['id', 'email', 'role', 'createdAt', 'updatedAt'];
    const hasRestrictedFields = restrictedFields.some(field => field in updateData);
    
    if (hasRestrictedFields) {
      return NextResponse.json(
        { error: 'Não é possível atualizar campos restritos.' },
        { status: 400 }
      );
    }

    // Validate data types and formats
    if (updateData.name && typeof updateData.name !== 'string') {
      return NextResponse.json(
        { error: 'Nome deve ser uma string.' },
        { status: 400 }
      );
    }

    if (updateData.phone && typeof updateData.phone !== 'string') {
      return NextResponse.json(
        { error: 'Telefone deve ser uma string.' },
        { status: 400 }
      );
    }

    // O middleware já validou:
    // 1. Autenticação do usuário
    // 2. Rate limiting
    
    const updatedUser = await userService.updateUser(
      authContext.userId,
      updateData
    );
    
    return NextResponse.json({
      success: true,
      message: 'Perfil atualizado com sucesso.',
      data: updatedUser
    });
    
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
}

// GET - Obter dados do perfil
async function getProfileHandler(
  request: NextRequest,
  { params, authContext }: { params?: any; authContext: any }
) {
  try {
    // O middleware já validou:
    // 1. Autenticação do usuário
    // 2. Rate limiting
    
    const user = await userService.getFullUserDetails(authContext.userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado.' },
        { status: 404 }
      );
    }

    // Remove sensitive information if present
    const { password, ...safeUserData } = user as any;
    
    return NextResponse.json({
      success: true,
      data: safeUserData
    });
    
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
}

// Aplicar middleware de autorização com configuração universal
export const PUT = withAuth(
  updateProfileHandler,
  createUniversalConfig('user', 'general')
);

export const GET = withAuth(
  getProfileHandler,
  createUniversalConfig('user', 'general')
);