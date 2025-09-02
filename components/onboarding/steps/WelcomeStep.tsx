// components/onboarding/steps/WelcomeStep.tsx
"use client";

import React from "react";
import { OnboardingStepProps } from "../OnboardingModal";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { useSession } from "next-auth/react";
import { LinkRoundAngle } from "@solar-icons/react/ssr";

export const WelcomeStep: React.FC<OnboardingStepProps> = ({ onNext }) => {
  const { data: session } = useSession();

  const userName = session?.user?.name || "Estudante";
  const firstName = userName.split(" ")[0];

  return (
    <div className="p-8 text-center">
      <div className="max-w-2xl mx-auto">
        {/* Welcome Animation Container */}
        <div className="mb-8 relative">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6 relative overflow-hidden">
            <LinkRoundAngle className="w-12 h-12 text-white" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 animate-pulse rounded-full"></div>
          </div>

          <LinkRoundAngle className="w-6 h-6 text-yellow-400 absolute top-4 left-1/2 transform -translate-x-8 animate-bounce" />
          <LinkRoundAngle className="w-4 h-4 text-blue-400 absolute top-8 right-1/2 transform translate-x-12 animate-bounce delay-300" />
          <LinkRoundAngle className="w-5 h-5 text-purple-400 absolute bottom-4 left-1/2 transform translate-x-6 animate-bounce delay-700" />
        </div>

        {/* Welcome Message */}
        <Text
          size="2xl"
          className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
        >
          Bem-vindo ao Fluency Lab, {firstName}! 🎉
        </Text>

        <Text
          size="lg"
          className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed"
        >
          Estamos muito empolgados em tê-lo conosco! Vamos configurar sua conta
          e escolher o plano ideal para sua jornada de aprendizado.
        </Text>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-4 text-center border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-lg mb-3 mx-auto">
              <LinkRoundAngle className="w-6 h-6 text-blue-600 dark:text-blue-300" />
            </div>
            <Text className="font-semibold mb-2">Professores Qualificados</Text>
            <Text size="sm" className="text-gray-600 dark:text-gray-300">
              Aulas com professores experientes e dedicados
            </Text>
          </Card>

          <Card className="p-4 text-center border border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/20">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-800 rounded-lg mb-3 mx-auto">
              <LinkRoundAngle className="w-6 h-6 text-green-600 dark:text-green-300" />
            </div>
            <Text className="font-semibold mb-2">Horários Flexíveis</Text>
            <Text size="sm" className="text-gray-600 dark:text-gray-300">
              Agende suas aulas quando for conveniente
            </Text>
          </Card>

          <Card className="p-4 text-center border border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-900/20">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-800 rounded-lg mb-3 mx-auto">
              <LinkRoundAngle className="w-6 h-6 text-purple-600 dark:text-purple-300" />
            </div>
            <Text className="font-semibold mb-2">
              Aprendizado Personalizado
            </Text>
            <Text size="sm" className="text-gray-600 dark:text-gray-300">
              Conteúdo adaptado ao seu nível e objetivos
            </Text>
          </Card>
        </div>

        {/* Next Steps Info */}
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border border-blue-200 dark:border-blue-700">
          <Text className="font-semibold mb-3 text-blue-900 dark:text-blue-100">
            O que vamos fazer agora:
          </Text>
          <div className="text-left space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-300">
                1
              </div>
              <Text size="sm">
                Conhecer a plataforma e suas funcionalidades
              </Text>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-300">
                2
              </div>
              <Text size="sm">Configurar suas preferências pessoais</Text>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-300">
                3
              </div>
              <Text size="sm">Escolher e assinar seu plano de estudos</Text>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-300">
                4
              </div>
              <Text size="sm">Começar sua jornada de aprendizado!</Text>
            </div>
          </div>
        </Card>

        <div className="mt-8">
          <Button
            onClick={onNext}
            size="lg"
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Vamos começar! ✨
          </Button>
        </div>
      </div>
    </div>
  );
};
