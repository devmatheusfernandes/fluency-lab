import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { adminDb } from '@/lib/firebase/admin';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { ClassStatus } from '@/types/classes/class';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 401 });
  }

  // Check if the current user is a student
  if (session.user.role !== 'student') {
    return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
  }

  try {
    const { classId } = await request.json();
    
    if (!classId) {
      return NextResponse.json({ error: 'ID da aula não fornecido.' }, { status: 400 });
    }

    const studentId = session.user.id;
    
    // Get the class document
    const classRef = adminDb.doc(`classes/${classId}`);
    const classDoc = await classRef.get();
    
    if (!classDoc.exists) {
      return NextResponse.json({ error: 'Aula não encontrada.' }, { status: 404 });
    }
    
    const classData = classDoc.data();
    
    // Verify that this class belongs to the student
    if (classData?.studentId !== studentId) {
      return NextResponse.json({ error: 'Acesso não autorizado para modificar esta aula.' }, { status: 403 });
    }
    
    // Update the class status to canceled by student
    await classRef.update({
      status: ClassStatus.CANCELED_STUDENT,
      updatedAt: new Date(),
    });

    return NextResponse.json({ message: 'Aula cancelada com sucesso.' });
  } catch (error: any) {
    console.error('Error canceling class:', error);
    return NextResponse.json({ error: 'Failed to cancel class' }, { status: 500 });
  }
}