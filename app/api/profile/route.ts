// app/api/profile/route.ts

import { NextResponse } from 'next/server';
import { UserService } from '@/services/userService';
import { requireAuth } from '@/lib/auth';

const userService = new UserService();

export async function PUT(request: Request) {
  try {
    const user = await requireAuth();
    
    const profileData = await request.json();
    await userService.updateUserProfile(user.id, profileData);
    return NextResponse.json({ message: 'Perfil atualizado com sucesso.' });
  } catch (error: any) {
    if (error.message === "Authentication required") {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}