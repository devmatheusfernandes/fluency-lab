// app/api/auth/resend-verification/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { AuthService } from '@/services/authService';

const authService = new AuthService();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - User not authenticated' },
        { status: 401 }
      );
    }

    // Check if email is already verified
    const isVerified = await authService.isEmailVerified(session.user.id);
    if (isVerified) {
      return NextResponse.json({
        success: false,
        message: 'Email is already verified'
      }, { status: 400 });
    }

    // Send email verification using Firebase Auth
    const result = await authService.sendEmailVerification(session.user.id);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.message
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Error resending verification email:', error);
    
    // Handle specific Firebase Auth errors
    if (error instanceof Error) {
      if (error.message.includes('user-not-found')) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      
      if (error.message.includes('too-many-requests')) {
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          { status: 429 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}