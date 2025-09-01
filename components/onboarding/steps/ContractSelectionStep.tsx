// components/onboarding/steps/ContractSelectionStep.tsx
"use client";

import React, { useState } from "react";
import { OnboardingStepProps } from "../OnboardingModal";
import { Card } from "@/components/ui/Card";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Calendar,
  TrendingUp,
  Star,
  Clock,
  Target,
  Zap,
  Gift,
  CheckCircle,
  ArrowRight,
  Calculator,
  Award,
} from "lucide-react";
import { formatPrice } from "@/config/pricing";
import { useSession } from "next-auth/react";

interface ContractOptionProps {
  duration: 6 | 12;
  title: string;
  description: string;
  monthlyPrice: number;
  totalPrice: number;
  savings?: number;
  benefits: string[];
  popular?: boolean;
  selected: boolean;
  onSelect: () => void;
}

const ContractOption: React.FC<ContractOptionProps> = ({
  duration,
  title,
  description,
  monthlyPrice,
  totalPrice,
  savings,
  benefits,
  popular,
  selected,
  onSelect,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card
      className={`relative p-6 cursor-pointer transition-all duration-300 hover:shadow-lg ${
        selected
          ? "border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-lg transform scale-105"
          : "border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
      } ${popular ? "ring-2 ring-yellow-400 ring-opacity-50" : ""}`}
      onClick={onSelect}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-yellow-500 text-white font-bold px-3 py-1">
            ⭐ MAIS POPULAR
          </Badge>
        </div>
      )}

      <div className="text-center mb-6">
        <div
          className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
            selected
              ? "bg-blue-100 dark:bg-blue-800"
              : "bg-gray-100 dark:bg-gray-700"
          }`}
        >
          <Calendar
            className={`w-8 h-8 ${
              selected
                ? "text-blue-600 dark:text-blue-300"
                : "text-gray-600 dark:text-gray-300"
            }`}
          />
        </div>

        <Heading
          size="xl"
          className={selected ? "text-blue-900 dark:text-blue-100" : ""}
        >
          {title}
        </Heading>
        <Text
          className={`mt-2 ${selected ? "text-blue-700 dark:text-blue-200" : "text-gray-600 dark:text-gray-300"}`}
        >
          {description}
        </Text>
      </div>

      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Text
            size="3xl"
            className={`font-bold ${selected ? "text-blue-900 dark:text-blue-100" : ""}`}
          >
            {formatPrice(monthlyPrice)}
          </Text>
          <Text className="text-gray-500 dark:text-gray-400">/mês</Text>
        </div>

        <div className="space-y-1">
          <Text size="sm" className="text-gray-600 dark:text-gray-300">
            Total: <strong>{formatPrice(totalPrice)}</strong>
          </Text>
          {savings && (
            <div className="flex items-center justify-center gap-1">
              <Text
                size="sm"
                className="text-green-600 dark:text-green-400 font-medium"
              >
                Economiza {formatPrice(savings)}
              </Text>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {benefits
          .slice(0, isExpanded ? benefits.length : 3)
          .map((benefit, index) => (
            <div key={index} className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <Text
                size="sm"
                className={
                  selected
                    ? "text-blue-700 dark:text-blue-200"
                    : "text-gray-600 dark:text-gray-300"
                }
              >
                {benefit}
              </Text>
            </div>
          ))}
      </div>

      {benefits.length > 3 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className={`w-full mb-4 ${selected ? "text-blue-600 hover:text-blue-700" : ""}`}
        >
          {isExpanded
            ? "Ver menos"
            : `Ver mais ${benefits.length - 3} benefícios`}
          <ArrowRight
            className={`w-4 h-4 ml-1 transition-transform ${isExpanded ? "rotate-90" : ""}`}
          />
        </Button>
      )}

      <div
        className={`text-center p-3 rounded-lg ${
          selected
            ? "bg-blue-100 dark:bg-blue-800/50"
            : "bg-gray-50 dark:bg-gray-700/50"
        }`}
      >
        <Text
          size="sm"
          className={`font-medium ${
            selected
              ? "text-blue-900 dark:text-blue-100"
              : "text-gray-700 dark:text-gray-300"
          }`}
        >
          {selected ? "✓ Plano Selecionado" : "Clique para selecionar"}
        </Text>
      </div>
    </Card>
  );
};

export const ContractSelectionStep: React.FC<OnboardingStepProps> = ({
  data,
  onDataChange,
  onNext,
}) => {
  const { data: session } = useSession();

  // Get pricing based on user role (STUDENT vs GUARDED_STUDENT)
  const isGuardedStudent = session?.user?.role === "GUARDED_STUDENT";
  const basePrice = isGuardedStudent ? 39900 : 29900; // in centavos

  const contractOptions = [
    {
      duration: 6 as const,
      title: "Plano Semestral",
      description: "Ideal para objetivos de curto prazo",
      monthlyPrice: basePrice,
      totalPrice: basePrice * 6,
      benefits: [
        "Aulas semanais personalizadas",
        "Material didático incluído",
        "Suporte técnico completo",
        "Relatórios mensais de progresso",
        "Acesso à plataforma 24/7",
        "Certificado de participação",
      ],
      popular: false,
    },
    {
      duration: 12 as const,
      title: "Plano Anual",
      description: "Melhor custo-benefício para fluência",
      monthlyPrice: Math.round(basePrice * 0.85), // 15% discount
      totalPrice: Math.round(basePrice * 0.85) * 12,
      savings: basePrice * 12 - Math.round(basePrice * 0.85) * 12,
      benefits: [
        "Aulas semanais personalizadas",
        "Material didático incluído",
        "Suporte técnico completo",
        "Relatórios mensais de progresso",
        "Acesso à plataforma 24/7",
        "Certificado de conclusão",
        "15% de desconto no valor mensal",
        "Aulas de conversação extras",
        "Avaliação de proficiência inclusa",
        "Suporte prioritário",
      ],
      popular: true,
    },
  ];

  const selectedOption = contractOptions.find(
    (option) => option.duration === data.contractLengthMonths
  );

  const handleSelect = (duration: 6 | 12) => {
    onDataChange({ contractLengthMonths: duration });
  };

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full mb-4">
            <Target className="w-8 h-8 text-white" />
          </div>

          <Heading size="2xl" className="mb-4">
            Escolha a Duração do seu Contrato
          </Heading>
          <Text
            size="lg"
            className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-6"
          >
            Selecione o plano que melhor se adapta aos seus objetivos de
            aprendizado. Ambos os planos incluem as mesmas funcionalidades
            principais.
          </Text>

          {/* User Type Badge */}
          <Badge
            variant="secondary"
            className={`px-3 py-1 ${
              isGuardedStudent
                ? "bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-purple-200"
                : "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200"
            }`}
          >
            {isGuardedStudent
              ? "👨‍👩‍👧‍👦 Estudante Acompanhado"
              : "🎓 Estudante Regular"}
          </Badge>
        </div>

        {/* Contract Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {contractOptions.map((option) => (
            <ContractOption
              key={option.duration}
              {...option}
              selected={data.contractLengthMonths === option.duration}
              onSelect={() => handleSelect(option.duration)}
            />
          ))}
        </div>

        {/* Comparison Table */}
        <Card className="p-6 mb-8">
          <Heading size="lg" className="text-center mb-6">
            Comparação Detalhada
          </Heading>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4">Benefício</th>
                  <th className="text-center py-3 px-4">Plano Semestral</th>
                  <th className="text-center py-3 px-4">Plano Anual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                <tr>
                  <td className="py-3 px-4 font-medium">Preço mensal</td>
                  <td className="text-center py-3 px-4">
                    {formatPrice(basePrice)}
                  </td>
                  <td className="text-center py-3 px-4">
                    <div className="flex flex-col items-center">
                      <span className="text-green-600 font-bold">
                        {formatPrice(Math.round(basePrice * 0.85))}
                      </span>
                      <span className="text-xs text-gray-500 line-through">
                        {formatPrice(basePrice)}
                      </span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Economia total</td>
                  <td className="text-center py-3 px-4">-</td>
                  <td className="text-center py-3 px-4 text-green-600 font-bold">
                    {formatPrice(
                      basePrice * 12 - Math.round(basePrice * 0.85) * 12
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">
                    Aulas extras de conversação
                  </td>
                  <td className="text-center py-3 px-4">❌</td>
                  <td className="text-center py-3 px-4">✅</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">
                    Avaliação de proficiência
                  </td>
                  <td className="text-center py-3 px-4">Pago à parte</td>
                  <td className="text-center py-3 px-4">✅ Incluso</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Suporte prioritário</td>
                  <td className="text-center py-3 px-4">❌</td>
                  <td className="text-center py-3 px-4">✅</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* Selected Plan Summary */}
        {selectedOption && (
          <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border border-blue-200 dark:border-blue-700 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                </div>
                <div>
                  <Text className="font-semibold text-blue-900 dark:text-blue-100">
                    Plano Selecionado: {selectedOption.title}
                  </Text>
                  <Text size="sm" className="text-blue-700 dark:text-blue-200">
                    {selectedOption.duration} meses •{" "}
                    {formatPrice(selectedOption.monthlyPrice)}/mês
                    {selectedOption.savings &&
                      ` • Economiza ${formatPrice(selectedOption.savings)}`}
                  </Text>
                </div>
              </div>

              <div className="text-right">
                <Text size="sm" className="text-blue-600 dark:text-blue-300">
                  Total do contrato
                </Text>
                <Text
                  size="xl"
                  className="font-bold text-blue-900 dark:text-blue-100"
                >
                  {formatPrice(selectedOption.totalPrice)}
                </Text>
              </div>
            </div>
          </Card>
        )}

        {/* Success Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <Award className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
              95%
            </div>
            <Text size="sm" className="text-green-700 dark:text-green-300">
              dos alunos anuais atingem fluência
            </Text>
          </div>

          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Zap className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
              3x
            </div>
            <Text size="sm" className="text-blue-700 dark:text-blue-300">
              progresso mais rápido que estudos tradicionais
            </Text>
          </div>

          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <Star className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
              4.9/5
            </div>
            <Text size="sm" className="text-purple-700 dark:text-purple-300">
              avaliação média dos estudantes
            </Text>
          </div>
        </div>

        {/* Info Card */}
        <Card className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-800 rounded-full flex items-center justify-center">
              <Gift className="w-6 h-6 text-yellow-600 dark:text-yellow-300" />
            </div>
            <div>
              <Text className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                💡 Dica: A maioria dos nossos alunos de sucesso escolhe o plano
                anual
              </Text>
              <Text size="sm" className="text-yellow-700 dark:text-yellow-200">
                O aprendizado de idiomas requer consistência e tempo. Com mais
                tempo para praticar, você desenvolve fluência real e duradoura,
                além de economizar no processo.
              </Text>
            </div>
          </div>
        </Card>

        <div className="text-center mt-8">
          <Button
            onClick={onNext}
            disabled={!data.contractLengthMonths}
            size="lg"
            className={`px-8 py-3 font-semibold transition-all duration-200 ${
              data.contractLengthMonths
                ? "bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white transform hover:scale-105 shadow-lg hover:shadow-xl"
                : "bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed"
            }`}
          >
            {data.contractLengthMonths
              ? "Revisar contrato e assinar"
              : "Selecione um plano para continuar"}
          </Button>
        </div>
      </div>
    </div>
  );
};
