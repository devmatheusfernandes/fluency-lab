// app/api/admin/announcements/route.ts
import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { AnnouncementService } from '@/services/announcementService';
import { UserRoles } from '@/types/users/userRoles';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const announcementService = new AnnouncementService();

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== UserRoles.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const announcements = await announcementService.getAllAnnouncements();
    return NextResponse.json(announcements);
  } catch (error: any) {
    console.error('Error fetching announcements:', error);
    // More detailed error logging
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== UserRoles.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { title, message, type, recipientType, roles, userIds } = body;

    const announcement = await announcementService.createAnnouncement(
      title,
      message,
      type,
      session.user.id, // Use session user ID instead of decoded token
      recipientType,
      roles,
      userIds
    );

    return NextResponse.json(announcement, { status: 201 });
  } catch (error: any) {
    console.error('Error creating announcement:', error);
    // More detailed error logging
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}