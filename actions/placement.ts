'use server';

import { placementService } from '@/services/placementService';
import { placementRepository } from '@/repositories/placementRepository';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function getPlacementTests() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }

    const tests = await placementRepository.getPlacementTestsByUserId(session.user.id);
    const processedTests = placementService.processPlacementTests(tests);

    return {
      success: true,
      data: processedTests
    };
  } catch (error) {
    console.error('Error fetching placement tests:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    };
  }
}