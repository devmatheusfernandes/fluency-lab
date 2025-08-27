// app/api/student/available-teachers/route.ts
import { NextResponse } from 'next/server';
import { TeacherService } from '@/services/teacherService';

const teacherService = new TeacherService();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extrai os filtros da URL
    const language = searchParams.get('language') || undefined;
    const leadTime = searchParams.get('leadTime') ? Number(searchParams.get('leadTime')) : undefined;

    const teachers = await teacherService.findAvailableTeachersForOccasional({ language, leadTime });
    return NextResponse.json(teachers);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}