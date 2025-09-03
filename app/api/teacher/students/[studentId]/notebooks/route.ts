import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { adminDb } from '@/lib/firebase/admin';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 401 });
  }

  // Allow both teachers and admins to access this endpoint
  if (!session?.user?.role || !['teacher', 'admin'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
  }

  try {
    const { studentId } = await params;
    
    // Verify that this student belongs to the teacher (only for teachers)
    if (session.user.role === 'teacher') {
      const teacherId = session.user.id;
      const studentDoc = await adminDb.doc(`users/${studentId}`).get();
      
      if (!studentDoc.exists) {
        return NextResponse.json({ error: 'Aluno não encontrado.' }, { status: 404 });
      }
      
      const studentData = studentDoc.data();
      const studentTeachers = studentData?.teachersIds || [];
      
      if (!studentTeachers.includes(teacherId)) {
        return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
      }
    }
    
    // Fetch notebooks from Firestore
    const notebooksSnapshot = await adminDb
      .collection(`users/${studentId}/Notebooks`)
      .orderBy('createdAt', 'desc')
      .get();

    const notebooks = notebooksSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
      };
    });

    return NextResponse.json(notebooks);
  } catch (error: any) {
    console.error('Error fetching notebooks:', error);
    return NextResponse.json({ error: 'Failed to fetch notebooks' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 401 });
  }

  // Check if the current user is a teacher
  if (session.user.role !== 'teacher') {
    return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
  }

  try {
    const { studentId } = await params;
    const body = await request.json();
    
    // Verify that this student belongs to the teacher
    const teacherId = session.user.id;
    const studentDoc = await adminDb.doc(`users/${studentId}`).get();
    
    if (!studentDoc.exists) {
      return NextResponse.json({ error: 'Aluno não encontrado.' }, { status: 404 });
    }
    
    const studentData = studentDoc.data();
    const studentTeachers = studentData?.teachersIds || [];
    
    if (!studentTeachers.includes(teacherId)) {
      return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
    }
    
    // Create notebook in Firestore
    const notebookData = {
      ...body,
      student: studentId,
      studentName: studentData?.name || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await adminDb.collection(`users/${studentId}/Notebooks`).add(notebookData);
    
    const newNotebook = {
      id: docRef.id,
      ...notebookData,
      createdAt: notebookData.createdAt,
      updatedAt: notebookData.updatedAt,
    };

    return NextResponse.json(newNotebook, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao criar o caderno do aluno:", error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}