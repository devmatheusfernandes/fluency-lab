"use client";

import React, { useState, useCallback } from "react";
import {
  Modal,
  ModalContent,
  ModalClose,
  ModalDescription,
  ModalTitle,
} from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ProgressTracker } from "@/components/ui/ProgressTracker";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import "./onboarding.css";

// Import step components
import {
  WelcomeStep,
  PlatformOverviewStep,
  BasicInfoStep,
  EmailVerificationStep,
  BestPracticesStep,
  ContractSelectionStep,
  ContractReviewStep,
  PaymentStep,
  FinishStep,
} from "./steps";

// Types for onboarding data
export interface OnboardingData {
  // Basic Info
  nickname: string;
  interfaceLanguage: string;
  theme: "light" | "dark";

  // Email verification
  emailVerified: boolean;

  // Contract
  contractLengthMonths: 6 | 12;
  contractSigned: boolean;
  contractData?: any;

  // Payment
  paymentMethod: "pix" | "credit_card" | null;
  paymentCompleted: boolean;
  subscriptionId?: string;
}

export interface OnboardingStepProps {
  data: OnboardingData;
  onDataChange: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  isLoading: boolean;
}

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const STEPS = [
  { id: "welcome", title: "Bem-vindo", component: WelcomeStep },
  { id: "overview", title: "Visão Geral", component: PlatformOverviewStep },
  { id: "basic-info", title: "Informações Básicas", component: BasicInfoStep },
  {
    id: "email-verification",
    title: "Verificação de Email",
    component: EmailVerificationStep,
  },
  {
    id: "best-practices",
    title: "Boas Práticas",
    component: BestPracticesStep,
  },
  {
    id: "contract-selection",
    title: "Seleção de Contrato",
    component: ContractSelectionStep,
  },
  {
    id: "contract-review",
    title: "Revisão do Contrato",
    component: ContractReviewStep,
  },
  { id: "payment", title: "Pagamento", component: PaymentStep },
  { id: "finish", title: "Finalização", component: FinishStep },
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const { data: session, update: updateSession } = useSession();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    nickname: session?.user?.name || "",
    interfaceLanguage: "pt",
    theme: "light",
    emailVerified: false,
    contractLengthMonths: 6,
    contractSigned: false,
    paymentMethod: null,
    paymentCompleted: false,
  });

  const handleDataChange = useCallback((updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  }, []);

  const canGoNext = useCallback(() => {
    const step = STEPS[currentStep];
    switch (step.id) {
      case "welcome":
      case "overview":
        return true;
      case "basic-info":
        return data.nickname.trim().length > 0;
      case "email-verification":
        return true; // Optional step
      case "best-practices":
        return true;
      case "contract-selection":
        return data.contractLengthMonths > 0;
      case "contract-review":
        return data.contractSigned;
      case "payment":
        return data.paymentCompleted;
      case "finish":
        return true;
      default:
        return true;
    }
  }, [currentStep, data]);

  const handleNext = useCallback(async () => {
    if (!canGoNext()) {
      toast.error(
        "Por favor, complete as informações necessárias para continuar."
      );
      return;
    }

    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Complete onboarding
      await handleCompleteOnboarding();
    }
  }, [currentStep, canGoNext]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const handleCompleteOnboarding = async () => {
    try {
      setIsLoading(true);

      // Mark tutorial as completed
      const response = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to complete onboarding");
      }

      // Update session
      await updateSession();

      toast.success("Bem-vindo ao Fluency Lab!");
      onComplete();
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast.error("Erro ao finalizar o processo de integração.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = (open: boolean) => {
    // Prevent closing during critical steps
    if (!open && currentStep >= 6 && !data.paymentCompleted) {
      toast.warning(
        "Por favor, complete o processo de pagamento antes de fechar."
      );
      return;
    }
    if (!open) {
      onClose();
    }
  };

  if (!isOpen) return null;

  console.log("🎯 OnboardingModal rendering:", {
    isOpen,
    currentStep,
    stepTitle: STEPS[currentStep]?.title,
    dataState: data,
  });

  const CurrentStepComponent = STEPS[currentStep].component;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === STEPS.length - 1;

  return (
    <Modal open={isOpen} onOpenChange={handleClose}>
      <ModalContent
        className="max-w-4xl w-full mx-4 onboarding-modal-enter p-0 max-h-[90vh] overflow-hidden flex flex-col onboarding-card bg-white dark:bg-gray-900"
        style={{ zIndex: 9999, position: "fixed" }}
      >
        {/* Required title and description for accessibility */}
        <ModalTitle className="sr-only">Integração ao Fluency Lab</ModalTitle>
        <ModalDescription className="sr-only">
          Processo de integração ao Fluency Lab - Passo {currentStep + 1} de{" "}
          {STEPS.length}: {STEPS[currentStep].title}
        </ModalDescription>

        {/* Header with progress */}
        <div className="flex-shrink-0 p-6 border-b border-gray-200 dark:border-gray-700">
          {/* Close button - only show before payment/contract steps */}
          {currentStep < 6 && <ModalClose />}

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Integração ao Fluency Lab
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {currentStep + 1} de {STEPS.length}
            </span>
          </div>

          <ProgressTracker
            variant="steps"
            totalSteps={STEPS.length}
            currentStep={currentStep + 1}
            value={(currentStep + 1) * (100 / STEPS.length)}
            className="mb-2"
          />
        </div>

        {/* Step content */}
        <div className="flex-1 overflow-y-auto step-content-enter">
          <CurrentStepComponent
            data={data}
            onDataChange={handleDataChange}
            onNext={handleNext}
            onBack={handleBack}
            isLoading={isLoading}
          />
        </div>

        {/* Footer with navigation buttons */}
        <div className="flex-shrink-0 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={isFirstStep || isLoading}
              className="flex items-center gap-2 step-nav-button"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>

            <div className="flex gap-3">
              {!isLastStep && (
                <Button
                  onClick={handleNext}
                  disabled={!canGoNext() || isLoading}
                  className="flex items-center gap-2 step-nav-button"
                  isLoading={isLoading}
                >
                  Continuar
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}

              {isLastStep && (
                <Button
                  onClick={handleCompleteOnboarding}
                  disabled={isLoading}
                  className="flex items-center gap-2 step-nav-button"
                  isLoading={isLoading}
                >
                  Finalizar
                </Button>
              )}
            </div>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
};
