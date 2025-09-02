import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { TeacherService } from '@/services/teacherService';

const teacherService = new TeacherService();

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  // Allow both teachers and admins to access this endpoint
  if (!session?.user?.id || !session?.user?.role || !['teacher', 'admin'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  try {
    const students = await teacherService.getMyStudents(session.user.id);
    return NextResponse.json(students);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}