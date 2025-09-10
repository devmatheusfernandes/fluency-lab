import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { schedulingService } from '@/services/schedulingService';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

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
    const { classId, scheduledAt } = await request.json();
    
    console.log(`[API Cancel] Student ${session.user.id} attempting to cancel class ${classId}`, scheduledAt ? `scheduled for ${scheduledAt}` : '');
    
    if (!classId) {
      return NextResponse.json({ error: 'ID da aula não fornecido.' }, { status: 400 });
    }

    const studentId = session.user.id;
    const scheduledAtDate = scheduledAt ? new Date(scheduledAt) : undefined;
    
    // Use the enhanced cancellation method from the service
    const result = await schedulingService.cancelClassByStudent(studentId, classId, scheduledAtDate);
    
    console.log(`[API Cancel] Cancellation completed successfully for class ${classId}:`, result);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error canceling class:', error);
    return NextResponse.json({ error: error.message || 'Failed to cancel class' }, { status: 500 });
  }
}