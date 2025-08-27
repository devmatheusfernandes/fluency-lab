import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { ClassRepository } from '@/repositories/classRepository';

const classRepository = new ClassRepository();

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const myClasses = await classRepository.findClassesByStudentId(session.user.id);
    return NextResponse.json(myClasses);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}