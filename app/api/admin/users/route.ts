import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { AdminService } from '@/services/adminService';
import { UserService } from '@/services/userService';

// Instancia os dois serviços que esta rota utilizará
const adminService = new AdminService();
const userService = new UserService();

/**
 * Handler para o método GET: Lista usuários com filtros.
 */
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') || undefined;
    const isActive = searchParams.has('isActive') ? searchParams.get('isActive') === 'true' : undefined;

    const users = await userService.getUsers({ role, isActive });
    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * Handler para o método POST: Cria um novo usuário.
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 403 });
  }

  try {
    const userData = await request.json();
    const { newUser } = await adminService.createUser(userData);
    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error: any) {
    console.error("Erro na API de criação de usuário:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}