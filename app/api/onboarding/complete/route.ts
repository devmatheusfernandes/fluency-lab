// app/api/onboarding/complete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { adminDb, adminAuth } from '@/lib/firebase/admin';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { UserRoles } from '@/types/users/userRoles';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      nickname,
      interfaceLanguage,
      theme,
      emailVerified,
      contractLengthMonths,
      contractSigned,
      paymentMethod,
      paymentCompleted,
      subscriptionId
    } = body;

    // Update user document with onboarding completion data
    const userRef = adminDb.collection('users').doc(session.user.id);
    
    const updates: any = {
      tutorialCompleted: true,
      onboardingCompletedAt: new Date(),
    };

    // Update basic info if provided
    if (nickname) updates.nickname = nickname;
    if (interfaceLanguage) updates.interfaceLanguage = interfaceLanguage;
    if (theme) updates.theme = theme;
    
    // Update contract info if completed and convert occasional student to regular student
    if (contractLengthMonths) {
      updates.contractLengthMonths = contractLengthMonths;
      updates.contractStartDate = new Date();
      
      // Convert occasional student to regular student when they sign a contract
      if (session.user.role === UserRoles.OCCASIONAL_STUDENT) {
        updates.role = UserRoles.STUDENT;
      }
    }
    
    // Update subscription info if completed
    if (subscriptionId) {
      updates.mercadoPagoSubscriptionId = subscriptionId;
      if (paymentMethod) {
        updates.subscriptionPaymentMethod = paymentMethod;
      }
    }

    await userRef.update(updates);

    // Update Firebase Auth custom claims if role was changed
    if (updates.role) {
      await adminAuth.setCustomUserClaims(session.user.id, { role: updates.role });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Onboarding completed successfully',
      // Include updated user data to help with session refresh
      user: {
        tutorialCompleted: true,
        ...updates
      }
    });

  } catch (error) {
    console.error('Error completing onboarding:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}