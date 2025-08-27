import { NextResponse } from 'next/server';
import { AuthService } from '@/services/authService';

const authService = new AuthService();

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes.' }, { status: 400 });
    }

    const newUser = await authService.registerUser({ name, email, password });
    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      return NextResponse.json({ error: 'Este email já está em uso.' }, { status: 409 });
    }
    console.error("Signup API Error:", error);
    return NextResponse.json({ error: 'Erro ao criar conta.' }, { status: 500 });
  }
}