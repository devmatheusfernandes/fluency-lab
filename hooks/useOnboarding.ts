// hooks/useOnboarding.ts
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { UserRoles } from "@/types/users/userRoles";

export const useOnboarding = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Only check onboarding status for authenticated regular students
    if (status === 'loading') return;
    
    if (status === 'unauthenticated') {
      setIsChecking(false);
      return;
    }

    // Debug logging for troubleshooting
    console.log('🔍 Onboarding Debug:', {
      status,
      userRole: session?.user?.role,
      tutorialCompleted: session?.user?.tutorialCompleted,
      userId: session?.user?.id
    });

    if ((session?.user?.role === UserRoles.STUDENT || session?.user?.role === UserRoles.OCCASIONAL_STUDENT) && !session?.user?.tutorialCompleted) {
      // Show onboarding for new students who haven't completed tutorial
      console.log('✅ Showing onboarding modal for user');
      setShowOnboarding(true);
    } else {
      console.log('❌ Onboarding conditions not met');
    }
    
    setIsChecking(false);
  }, [session, status]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    // Redirect to dashboard after onboarding completion
    router.push('/hub/plataforma');
  };

  const handleOnboardingClose = () => {
    // Only allow closing if not in critical steps
    setShowOnboarding(false);
  };

  return {
    showOnboarding,
    isChecking,
    handleOnboardingComplete,
    handleOnboardingClose,
  };
};