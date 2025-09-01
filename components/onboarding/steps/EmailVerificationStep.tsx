// components/onboarding/steps/EmailVerificationStep.tsx
"use client";

import React, { useState, useEffect } from "react";
import { OnboardingStepProps } from "../OnboardingModal";
import { Card } from "@/components/ui/Card";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import {
  Mail,
  CheckCircle,
  Clock,
  RefreshCw,
  AlertCircle,
  Shield,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export const EmailVerificationStep: React.FC<OnboardingStepProps> = ({
  data,
  onDataChange,
  onNext,
  isLoading: parentLoading,
}) => {
  const { data: session } = useSession();
  const [verificationStatus, setVerificationStatus] = useState<
    "checking" | "verified" | "unverified"
  >("checking");
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Check verification status on mount
  useEffect(() => {
    checkVerificationStatus();
  }, []);

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const checkVerificationStatus = async () => {
    try {
      const response = await fetch("/api/auth/verification-status");
      const result = await response.json();

      setVerificationStatus(result.verified ? "verified" : "unverified");
      onDataChange({ emailVerified: result.verified });
    } catch (error) {
      console.error("Error checking verification status:", error);
      setVerificationStatus("unverified");
    }
  };

  const resendVerificationEmail = async () => {
    if (cooldown > 0) return;

    setIsResending(true);
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
      });

      if (response.ok) {
        toast.success("Email de verificação reenviado!");
        setCooldown(60); // 60 seconds cooldown
      } else {
        toast.error("Erro ao reenviar email de verificação");
      }
    } catch (error) {
      console.error("Error resending verification:", error);
      toast.error("Erro ao reenviar email de verificação");
    } finally {
      setIsResending(false);
    }
  };

  const skipVerification = () => {
    onDataChange({ emailVerified: false });
    onNext();
  };

  if (verificationStatus === "checking") {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <Text>Verificando status do email...</Text>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
              verificationStatus === "verified"
                ? "bg-green-100 dark:bg-green-800"
                : "bg-yellow-100 dark:bg-yellow-800"
            }`}
          >
            {verificationStatus === "verified" ? (
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-300" />
            ) : (
              <Mail className="w-8 h-8 text-yellow-600 dark:text-yellow-300" />
            )}
          </div>

          <Heading size="2xl" className="mb-4">
            {verificationStatus === "verified"
              ? "Email Verificado!"
              : "Verificação de Email"}
          </Heading>

          <Text size="lg" className="text-gray-600 dark:text-gray-300">
            {verificationStatus === "verified"
              ? "Seu email foi verificado com sucesso."
              : "Para garantir a segurança da sua conta, recomendamos verificar seu email."}
          </Text>
        </div>

        {verificationStatus === "verified" ? (
          /* Email Verified Content */
          <Card className="p-6 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700">
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <Heading
                size="lg"
                className="text-green-800 dark:text-green-100 mb-2"
              >
                Tudo certo!
              </Heading>
              <Text className="text-green-700 dark:text-green-200 mb-6">
                Seu email <strong>{session?.user?.email}</strong> foi verificado
                com sucesso. Você receberá todas as notificações importantes
                sobre suas aulas e pagamentos.
              </Text>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3 p-3 bg-white dark:bg-green-800/50 rounded-lg">
                  <Shield className="w-5 h-5 text-green-600 dark:text-green-300" />
                  <Text size="sm">Conta protegida</Text>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white dark:bg-green-800/50 rounded-lg">
                  <Mail className="w-5 h-5 text-green-600 dark:text-green-300" />
                  <Text size="sm">Notificações ativas</Text>
                </div>
              </div>

              <Button
                onClick={onNext}
                className="bg-green-600 hover:bg-green-700"
              >
                Continuar para as boas práticas
              </Button>
            </div>
          </Card>
        ) : (
          /* Email Not Verified Content */
          <div className="space-y-6">
            <Card className="p-6 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-300 mt-1" />
                <div className="flex-1">
                  <Heading
                    size="lg"
                    className="text-yellow-800 dark:text-yellow-100 mb-2"
                  >
                    Email não verificado
                  </Heading>
                  <Text className="text-yellow-700 dark:text-yellow-200 mb-4">
                    Enviamos um link de verificação para{" "}
                    <strong>{session?.user?.email}</strong>. Verifique sua caixa
                    de entrada e clique no link para confirmar seu email.
                  </Text>

                  <div className="space-y-3">
                    <Button
                      onClick={resendVerificationEmail}
                      disabled={isResending || cooldown > 0}
                      className="w-full sm:w-auto"
                      isLoading={isResending}
                    >
                      {cooldown > 0 ? (
                        `Reenviar em ${cooldown}s`
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Reenviar email de verificação
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={checkVerificationStatus}
                      variant="ghost"
                      className="w-full sm:w-auto ml-0 sm:ml-3"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Já verifiquei, atualizar status
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Why Verify Section */}
            <Card className="p-6">
              <Heading size="lg" className="mb-4">
                Por que verificar seu email?
              </Heading>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-blue-500" />
                  <Text>Maior segurança para sua conta</Text>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-green-500" />
                  <Text>
                    Receber lembretes de aulas e notificações importantes
                  </Text>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-purple-500" />
                  <Text>Recuperação de conta em caso de problemas</Text>
                </div>
              </div>
            </Card>

            {/* Continue Options */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={onNext}
                disabled={parentLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Continuar (verificarei depois)
              </Button>

              <Button
                onClick={skipVerification}
                variant="ghost"
                className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100"
              >
                Pular verificação
              </Button>
            </div>

            <div className="text-center">
              <Text size="sm" className="text-gray-500 dark:text-gray-400">
                💡 Não encontrou o email? Verifique sua pasta de spam ou lixo
                eletrônico.
              </Text>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
