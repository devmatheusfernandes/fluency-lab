// components/onboarding/steps/PlatformOverviewStep.tsx
"use client";

import React, { useState } from "react";
import { OnboardingStepProps } from "../OnboardingModal";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LinkRoundAngle } from "@solar-icons/react/ssr";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  highlights: string[];
  color: "blue" | "green" | "purple" | "orange";
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  highlights,
  color,
}) => {
  const colorClasses = {
    blue: {
      border: "border-blue-200 dark:border-blue-800",
      bg: "bg-blue-50/50 dark:bg-blue-900/20",
      iconBg: "bg-blue-100 dark:bg-blue-800",
      iconColor: "text-blue-600 dark:text-blue-300",
      badgeColor:
        "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200",
    },
    green: {
      border: "border-green-200 dark:border-green-800",
      bg: "bg-green-50/50 dark:bg-green-900/20",
      iconBg: "bg-green-100 dark:bg-green-800",
      iconColor: "text-green-600 dark:text-green-300",
      badgeColor:
        "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200",
    },
    purple: {
      border: "border-purple-200 dark:border-purple-800",
      bg: "bg-purple-50/50 dark:bg-purple-900/20",
      iconBg: "bg-purple-100 dark:bg-purple-800",
      iconColor: "text-purple-600 dark:text-purple-300",
      badgeColor:
        "bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-purple-200",
    },
    orange: {
      border: "border-orange-200 dark:border-orange-800",
      bg: "bg-orange-50/50 dark:bg-orange-900/20",
      iconBg: "bg-orange-100 dark:bg-orange-800",
      iconColor: "text-orange-600 dark:text-orange-300",
      badgeColor:
        "bg-orange-100 text-orange-700 dark:bg-orange-800 dark:text-orange-200",
    },
  };

  const classes = colorClasses[color];

  return (
    <Card
      className={`p-6 ${classes.border} ${classes.bg} transition-all duration-200 hover:shadow-lg hover:scale-105`}
    >
      <div
        className={`inline-flex items-center justify-center w-12 h-12 ${classes.iconBg} rounded-lg mb-4`}
      >
        <div className={classes.iconColor}>{icon}</div>
      </div>

      <Text size="lg" className="mb-3">
        {title}
      </Text>
      <Text className="text-gray-600 dark:text-gray-300 mb-4">
        {description}
      </Text>

      <div className="space-y-2">
        {highlights.map((highlight, index) => (
          <Badge
            key={index}
            variant="secondary"
            className={`${classes.badgeColor} text-xs px-2 py-1 mr-2 mb-1`}
          >
            {highlight}
          </Badge>
        ))}
      </div>
    </Card>
  );
};

export const PlatformOverviewStep: React.FC<OnboardingStepProps> = ({
  onNext,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const features = [
    {
      icon: <LinkRoundAngle className="w-6 h-6" />,
      title: "Agendamento Inteligente",
      description:
        "Agende suas aulas de forma fácil e flexível, de acordo com sua disponibilidade e preferências.",
      highlights: [
        "Horários flexíveis",
        "Reagendamento fácil",
        "Lembretes automáticos",
      ],
      color: "blue" as const,
    },
    {
      icon: <LinkRoundAngle className="w-6 h-6" />,
      title: "Aulas Online ao Vivo",
      description:
        "Tenha aulas personalizadas com professores qualificados através de videoconferência.",
      highlights: [
        "1 a 1 com professor",
        "Material incluído",
        "Gravação das aulas",
      ],
      color: "green" as const,
    },
    {
      icon: <LinkRoundAngle className="w-6 h-6" />,
      title: "Acompanhe seu Progresso",
      description:
        "Visualize seu desenvolvimento através de relatórios detalhados e métricas de aprendizado.",
      highlights: [
        "Relatórios detalhados",
        "Metas personalizadas",
        "Certificados",
      ],
      color: "purple" as const,
    },
    {
      icon: <LinkRoundAngle className="w-6 h-6" />,
      title: "Pagamentos Flexíveis",
      description:
        "Escolha entre planos mensais com PIX ou cartão de crédito, com total transparência.",
      highlights: ["PIX ou Cartão", "Sem surpresas", "Cancelamento fácil"],
      color: "orange" as const,
    },
  ];

  const handleVideoToggle = () => {
    setIsPlaying(!isPlaying);
    // Here you would integrate with actual video player
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Text size="2xl" className="mb-4">
            Conheça a Plataforma Fluency Lab
          </Text>
          <Text
            size="lg"
            className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
          >
            Uma experiência completa de aprendizado de idiomas, projetada para
            maximizar seus resultados com total flexibilidade e acompanhamento
            personalizado.
          </Text>
        </div>

        {/* Demo Video Section */}
        <Card className="p-6 mb-8 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/30">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1">
              <Text variant="title">Veja como funciona na prática</Text>
              <Text className="text-gray-600 dark:text-gray-300 mb-4">
                Assista a este vídeo rápido para entender como você vai usar a
                plataforma no seu dia a dia de estudos.
              </Text>
              <Button
                onClick={handleVideoToggle}
                className="flex items-center gap-2"
              >
                {isPlaying ? (
                  <LinkRoundAngle className="w-4 h-4" />
                ) : (
                  <LinkRoundAngle className="w-4 h-4" />
                )}
                {isPlaying ? "Pausar" : "Assistir"} demonstração (2 min)
              </Button>
            </div>

            <div className="w-full md:w-80 h-48 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              {isPlaying ? (
                <div className="text-center">
                  <div className="animate-pulse">
                    <LinkRoundAngle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <Text size="sm" className="text-gray-500">
                      Reproduzindo...
                    </Text>
                  </div>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  onClick={handleVideoToggle}
                  className="flex flex-col items-center gap-2 h-full w-full"
                >
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                    <LinkRoundAngle className="w-8 h-8 text-white ml-1" />
                  </div>
                  <Text size="sm" className="text-gray-600">
                    Clique para assistir
                  </Text>
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>

        {/* Learning Path Preview */}
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border border-blue-200 dark:border-blue-700">
          <div className="text-center mb-6">
            <Text size="lg" className="mb-3">
              Sua jornada de aprendizado
            </Text>
            <Text className="text-gray-600 dark:text-gray-300">
              Veja como será sua experiência desde o primeiro dia até a fluência
            </Text>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {[
              {
                step: "1",
                title: "Avaliação inicial",
                desc: "Definimos seu nível atual",
              },
              {
                step: "2",
                title: "Plano personalizado",
                desc: "Criamos sua trilha de estudos",
              },
              {
                step: "3",
                title: "Aulas regulares",
                desc: "Progresso consistente e acompanhado",
              },
              {
                step: "4",
                title: "Fluência alcançada",
                desc: "Certificação e novos objetivos",
              },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-lg mb-2 mx-auto">
                  {item.step}
                </div>
                <Text className="font-semibold mb-1">{item.title}</Text>
                <Text size="sm" className="text-gray-600 dark:text-gray-300">
                  {item.desc}
                </Text>
                {index < 3 && (
                  <LinkRoundAngle className="w-4 h-4 text-gray-400 mx-auto mt-2 hidden md:block" />
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Success Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="text-center p-4">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
              98%
            </div>
            <Text size="sm" className="text-gray-600 dark:text-gray-300">
              Taxa de satisfação
            </Text>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
              500+
            </div>
            <Text size="sm" className="text-gray-600 dark:text-gray-300">
              Alunos ativos
            </Text>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
              12k+
            </div>
            <Text size="sm" className="text-gray-600 dark:text-gray-300">
              Aulas ministradas
            </Text>
          </div>
        </div>

        <div className="text-center mt-8">
          <Button
            onClick={onNext}
            size="lg"
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold"
          >
            Entendi! Vamos configurar minha conta
          </Button>
        </div>
      </div>
    </div>
  );
};
