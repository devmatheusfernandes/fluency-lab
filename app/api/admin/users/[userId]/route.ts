import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { UserService } from '@/services/userService';
import { UserRoles } from '@/types/users/userRoles';

const userService = new UserService();


// Usamos PUT para REATIVAR um usuário
export async function PUT(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
  }

  try {
    await userService.reactivateUser(params.userId);
    return NextResponse.json({ message: 'Usuário reativado com sucesso.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Apenas Admins podem editar certos detalhes
  if (session?.user?.role !== UserRoles.ADMIN) {
    return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
  }

  try {
    const userData = await request.json();
    await userService.updateUserDetails(params.userId, userData);
    return NextResponse.json({ message: 'Utilizador atualizado com sucesso.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Usamos DELETE para DESATIVAR (soft delete) um usuário
export async function DELETE(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
  }

  try {
    await userService.deactivateUser(params.userId);
    return NextResponse.json({ message: 'Usuário desativado com sucesso.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}