// components/onboarding/steps/FinishStep.tsx
"use client";

import React from "react";
import { OnboardingStepProps } from "../OnboardingModal";
import { Card } from "@/components/ui/Card";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  CheckCircle,
  Star,
  Calendar,
  MessageCircle,
  BookOpen,
  Trophy,
  Users,
  ArrowRight,
  Sparkles,
  Gift,
  Heart,
  Zap,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { formatPrice } from "@/config/pricing";

interface NextStepCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: string;
  color: "blue" | "green" | "purple" | "orange";
}

const NextStepCard: React.FC<NextStepCardProps> = ({
  icon,
  title,
  description,
  action,
  color,
}) => {
  const colorClasses = {
    blue: {
      bg: "bg-blue-50 dark:bg-blue-900/20",
      border: "border-blue-200 dark:border-blue-800",
      iconBg: "bg-blue-100 dark:bg-blue-800",
      iconColor: "text-blue-600 dark:text-blue-300",
      textColor: "text-blue-900 dark:text-blue-100",
      descColor: "text-blue-700 dark:text-blue-200",
    },
    green: {
      bg: "bg-green-50 dark:bg-green-900/20",
      border: "border-green-200 dark:border-green-800",
      iconBg: "bg-green-100 dark:bg-green-800",
      iconColor: "text-green-600 dark:text-green-300",
      textColor: "text-green-900 dark:text-green-100",
      descColor: "text-green-700 dark:text-green-200",
    },
    purple: {
      bg: "bg-purple-50 dark:bg-purple-900/20",
      border: "border-purple-200 dark:border-purple-800",
      iconBg: "bg-purple-100 dark:bg-purple-800",
      iconColor: "text-purple-600 dark:text-purple-300",
      textColor: "text-purple-900 dark:text-purple-100",
      descColor: "text-purple-700 dark:text-purple-200",
    },
    orange: {
      bg: "bg-orange-50 dark:bg-orange-900/20",
      border: "border-orange-200 dark:border-orange-800",
      iconBg: "bg-orange-100 dark:bg-orange-800",
      iconColor: "text-orange-600 dark:text-orange-300",
      textColor: "text-orange-900 dark:text-orange-100",
      descColor: "text-orange-700 dark:text-orange-200",
    },
  };

  const classes = colorClasses[color];

  return (
    <Card
      className={`p-6 ${classes.bg} ${classes.border} hover:shadow-md transition-all duration-200`}
    >
      <div
        className={`w-12 h-12 ${classes.iconBg} rounded-lg flex items-center justify-center mb-4`}
      >
        <div className={classes.iconColor}>{icon}</div>
      </div>

      <Heading size="lg" className={`${classes.textColor} mb-2`}>
        {title}
      </Heading>
      <Text className={`${classes.descColor} mb-3`}>{description}</Text>

      <div className="flex items-center gap-2 text-sm font-medium">
        <span className={classes.textColor}>{action}</span>
        <ArrowRight className={`w-4 h-4 ${classes.iconColor}`} />
      </div>
    </Card>
  );
};

export const FinishStep: React.FC<OnboardingStepProps> = ({ data }) => {
  const { data: session } = useSession();

  const firstName =
    session?.user?.name?.split(" ")[0] || data.nickname || "Estudante";

  // Get pricing info
  const isGuardedStudent = session?.user?.role === "GUARDED_STUDENT";
  const basePrice = isGuardedStudent ? 39900 : 29900;
  const monthlyPrice =
    data.contractLengthMonths === 12 ? Math.round(basePrice * 0.85) : basePrice;

  const nextSteps = [
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Agende sua Primeira Aula",
      description:
        "Escolha um horário conveniente com um dos nossos professores qualificados.",
      action: "Ir para Agendamento",
      color: "blue" as const,
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Complete seu Perfil",
      description:
        "Adicione informações sobre seus objetivos e nível atual de conhecimento.",
      action: "Completar Perfil",
      color: "green" as const,
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "Conheça a Plataforma",
      description:
        "Explore todas as funcionalidades disponíveis no seu dashboard.",
      action: "Tour da Plataforma",
      color: "purple" as const,
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Junte-se à Comunidade",
      description:
        "Conecte-se com outros estudantes e participe de eventos especiais.",
      action: "Ver Comunidade",
      color: "orange" as const,
    },
  ];

  const achievements = [
    {
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      text: "Conta criada e verificada",
    },
    {
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      text: "Preferências configuradas",
    },
    {
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      text: "Contrato assinado digitalmente",
    },
    {
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      text: "Pagamento configurado",
    },
    {
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      text: "Pronto para começar!",
    },
  ];

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Main Celebration */}
        <div className="text-center mb-12">
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6 mx-auto relative overflow-hidden">
              <Trophy className="w-12 h-12 text-white" />
              <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 via-blue-500/20 to-purple-600/20 animate-pulse rounded-full"></div>
            </div>

            {/* Floating celebration icons */}
            <Sparkles className="w-6 h-6 text-yellow-400 absolute -top-2 -left-4 animate-bounce" />
            <Star className="w-5 h-5 text-blue-400 absolute -top-4 -right-2 animate-bounce delay-300" />
            <Heart className="w-4 h-4 text-pink-400 absolute -bottom-2 -left-6 animate-bounce delay-700" />
            <Zap className="w-5 h-5 text-orange-400 absolute -bottom-4 right-0 animate-bounce delay-500" />
          </div>

          <Heading
            size="3xl"
            className="mb-4 bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent"
          >
            Parabéns, {firstName}! 🎉
          </Heading>

          <Text
            size="xl"
            className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto"
          >
            Você completou sua integração ao Fluency Lab com sucesso! Sua
            jornada de aprendizado está prestes a começar.
          </Text>

          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <Badge className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200 px-3 py-1">
              ✅ Integração Completa
            </Badge>
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200 px-3 py-1">
              🎯 Pronto para Aprender
            </Badge>
            <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200 px-3 py-1">
              🚀 Vamos Começar!
            </Badge>
          </div>
        </div>

        {/* Onboarding Summary */}
        <Card className="p-8 mb-8 bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 dark:from-green-900/30 dark:via-blue-900/30 dark:to-purple-900/30 border border-green-200 dark:border-green-700">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <Heading
                size="lg"
                className="mb-4 text-green-800 dark:text-green-100"
              >
                Resumo da sua Configuração
              </Heading>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Text className="text-gray-600 dark:text-gray-300">
                    Apelido:
                  </Text>
                  <Text className="font-medium">{data.nickname}</Text>
                </div>
                <div className="flex justify-between">
                  <Text className="text-gray-600 dark:text-gray-300">
                    Idioma:
                  </Text>
                  <Text className="font-medium">
                    {data.interfaceLanguage === "pt" ? "Português" : "English"}
                  </Text>
                </div>
                <div className="flex justify-between">
                  <Text className="text-gray-600 dark:text-gray-300">
                    Tema:
                  </Text>
                  <Text className="font-medium capitalize">{data.theme}</Text>
                </div>
                <div className="flex justify-between">
                  <Text className="text-gray-600 dark:text-gray-300">
                    Contrato:
                  </Text>
                  <Text className="font-medium">
                    {data.contractLengthMonths} meses
                  </Text>
                </div>
                <div className="flex justify-between">
                  <Text className="text-gray-600 dark:text-gray-300">
                    Pagamento:
                  </Text>
                  <Text className="font-medium">
                    {data.paymentMethod === "pix" ? "PIX" : "Cartão de Crédito"}
                  </Text>
                </div>
                <div className="flex justify-between">
                  <Text className="text-gray-600 dark:text-gray-300">
                    Mensalidade:
                  </Text>
                  <Text className="font-bold text-green-600">
                    {formatPrice(monthlyPrice)}
                  </Text>
                </div>
              </div>
            </div>

            <div>
              <Heading
                size="lg"
                className="mb-4 text-blue-800 dark:text-blue-100"
              >
                Progresso da Integração
              </Heading>
              <div className="space-y-3">
                {achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center gap-3">
                    {achievement.icon}
                    <Text className="text-gray-700 dark:text-gray-200">
                      {achievement.text}
                    </Text>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Next Steps */}
        <div className="mb-8">
          <Heading size="xl" className="text-center mb-6">
            Próximos Passos
          </Heading>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {nextSteps.map((step, index) => (
              <NextStepCard key={index} {...step} />
            ))}
          </div>
        </div>

        {/* Welcome Benefits */}
        <Card className="p-8 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-700 mb-8">
          <div className="text-center mb-6">
            <Gift className="w-12 h-12 text-yellow-600 dark:text-yellow-300 mx-auto mb-3" />
            <Heading
              size="lg"
              className="text-yellow-900 dark:text-yellow-100 mb-2"
            >
              Bônus de Boas-Vindas! 🎁
            </Heading>
            <Text className="text-yellow-700 dark:text-yellow-200">
              Como novo estudante, você tem direito a estes benefícios
              especiais:
            </Text>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white dark:bg-yellow-900/20 rounded-lg">
              <BookOpen className="w-8 h-8 text-yellow-600 dark:text-yellow-300 mx-auto mb-2" />
              <Text className="font-semibold mb-1">Material Gratuito</Text>
              <Text size="sm" className="text-gray-600 dark:text-gray-300">
                Acesso completo a todos os materiais didáticos
              </Text>
            </div>

            <div className="text-center p-4 bg-white dark:bg-yellow-900/20 rounded-lg">
              <MessageCircle className="w-8 h-8 text-yellow-600 dark:text-yellow-300 mx-auto mb-2" />
              <Text className="font-semibold mb-1">Suporte Prioritário</Text>
              <Text size="sm" className="text-gray-600 dark:text-gray-300">
                Atendimento especial nos primeiros 30 dias
              </Text>
            </div>

            <div className="text-center p-4 bg-white dark:bg-yellow-900/20 rounded-lg">
              <Trophy className="w-8 h-8 text-yellow-600 dark:text-yellow-300 mx-auto mb-2" />
              <Text className="font-semibold mb-1">Avaliação Gratuita</Text>
              <Text size="sm" className="text-gray-600 dark:text-gray-300">
                Teste de nivelamento sem custo adicional
              </Text>
            </div>
          </div>
        </Card>

        {/* Success Message */}
        <Card className="p-6 bg-gradient-to-r from-green-500 to-blue-600 text-white text-center">
          <Heading size="xl" className="mb-3 text-white">
            Bem-vindo à família Fluency Lab! 💙
          </Heading>
          <Text className="mb-4 text-green-50">
            Estamos muito empolgados em fazer parte da sua jornada de
            aprendizado. Nossa equipe está pronta para ajudá-lo a alcançar a
            fluência dos seus sonhos!
          </Text>

          <div className="flex flex-wrap justify-center gap-2 text-sm">
            <span className="bg-white/20 px-3 py-1 rounded-full">
              📚 Aprenda no seu ritmo
            </span>
            <span className="bg-white/20 px-3 py-1 rounded-full">
              🎯 Foque nos seus objetivos
            </span>
            <span className="bg-white/20 px-3 py-1 rounded-full">
              🏆 Alcance a fluência
            </span>
          </div>
        </Card>

        {/* Contact Info */}
        <div className="text-center mt-8">
          <Text size="sm" className="text-gray-500 dark:text-gray-400 mb-2">
            Precisa de ajuda? Nossa equipe está sempre disponível!
          </Text>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <span className="text-blue-600 dark:text-blue-400">
              📧 contato@fluencylab.com.br
            </span>
            <span className="text-green-600 dark:text-green-400">
              📱 WhatsApp: (49) 99999-9999
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
