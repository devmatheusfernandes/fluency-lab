// components/onboarding/steps/BasicInfoStep.tsx
"use client";

import React from "react";
import { OnboardingStepProps } from "../OnboardingModal";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectOption,
} from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

import { useSession } from "next-auth/react";
import { useTheme } from "@/context/ThemeContext";
import {
  LinkRoundAngle,
  Moon,
  Speaker,
  Sun,
  User,
} from "@solar-icons/react/ssr";

interface ThemeOptionProps {
  value: "light" | "dark" | "system";
  label: string;
  icon: React.ReactNode;
  description: string;
  selected: boolean;
  onClick: () => void;
}

const ThemeOption: React.FC<ThemeOptionProps> = ({
  value,
  label,
  icon,
  description,
  selected,
  onClick,
}) => {
  return (
    <Card
      className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
        selected
          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400"
          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
      }`}
      onClick={onClick}
    >
      <div className="text-center">
        <div
          className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-3 ${
            selected
              ? "bg-blue-100 dark:bg-blue-800"
              : "bg-gray-100 dark:bg-gray-700"
          }`}
        >
          <div
            className={
              selected
                ? "text-blue-600 dark:text-blue-300"
                : "text-gray-600 dark:text-gray-300"
            }
          >
            {icon}
          </div>
        </div>
        <Text
          className={`font-semibold mb-1 ${selected ? "text-blue-900 dark:text-blue-100" : ""}`}
        >
          {label}
        </Text>
        <Text
          size="sm"
          className={`${selected ? "text-blue-700 dark:text-blue-200" : "text-gray-600 dark:text-gray-300"}`}
        >
          {description}
        </Text>
      </div>
    </Card>
  );
};

export const BasicInfoStep: React.FC<OnboardingStepProps> = ({
  data,
  onDataChange,
  onNext,
}) => {
  const { data: session } = useSession();
  const { isDark, setTheme } = useTheme();

  const languageOptions = [
    { value: "pt", label: "Português" },
    { value: "en", label: "English" },
    { value: "es", label: "Español" },
  ];

  const themeOptions = [
    {
      value: "light" as const,
      label: "Claro",
      icon: <Sun className="w-6 h-6" />,
      description: "Interface com fundo claro",
    },
    {
      value: "dark" as const,
      label: "Escuro",
      icon: <Moon className="w-6 h-6" />,
      description: "Interface com fundo escuro",
    },
  ];

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDataChange({ nickname: e.target.value });
  };

  const handleLanguageChange = (value: string) => {
    onDataChange({ interfaceLanguage: value });
  };

  const handleThemeChange = (theme: "light" | "dark") => {
    onDataChange({ theme });
    // Actually apply the theme change immediately
    setTheme(theme === "dark");
  };

  const isValid = data.nickname.trim().length >= 2;

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <User className="w-8 h-8 text-white" />
          </div>

          <Text variant="title">Vamos personalizar sua experiência</Text>
          <Text size="lg" className="text-gray-600 dark:text-gray-300">
            Essas informações nos ajudarão a criar uma experiência mais
            personalizada para você.
          </Text>
        </div>

        {/* Form Section */}
        <div className="space-y-8">
          {/* Nickname Section */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center">
                <Speaker className="w-5 h-5 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <Text variant="title">Como gostaria de ser chamado?</Text>
                <Text size="sm" className="text-gray-600 dark:text-gray-300">
                  Escolha um apelido ou use seu nome completo
                </Text>
              </div>
            </div>

            <Input
              placeholder="Digite seu apelido preferido..."
              value={data.nickname}
              onChange={handleNicknameChange}
              className="text-lg"
            />

            {data.nickname.trim().length > 0 &&
              data.nickname.trim().length < 2 && (
                <Text size="sm" className="text-red-500 mt-2">
                  O apelido deve ter pelo menos 2 caracteres
                </Text>
              )}

            {data.nickname.trim().length >= 2 && (
              <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <Text size="sm" className="text-green-700 dark:text-green-300">
                  ✓ Perfeito! Vamos chamá-lo de <strong>{data.nickname}</strong>
                </Text>
              </div>
            )}
          </Card>

          {/* Language Section */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-lg flex items-center justify-center">
                <LinkRoundAngle className="w-5 h-5 text-green-600 dark:text-green-300" />
              </div>
              <div>
                <Text variant="title">Idioma da interface</Text>
                <Text size="sm" className="text-gray-600 dark:text-gray-300">
                  Em que idioma você prefere navegar pela plataforma?
                </Text>
              </div>
            </div>

            <Select
              value={data.interfaceLanguage}
              onValueChange={handleLanguageChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o idioma" />
              </SelectTrigger>
              <SelectContent>
                {languageOptions.map((option) => (
                  <SelectOption key={option.value} value={option.value}>
                    {option.label}
                  </SelectOption>
                ))}
              </SelectContent>
            </Select>
          </Card>

          {/* Theme Section */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-800 rounded-lg flex items-center justify-center">
                <LinkRoundAngle className="w-5 h-5 text-purple-600 dark:text-purple-300" />
              </div>
              <div>
                <Text variant="title">Aparência</Text>
                <Text size="sm" className="text-gray-600 dark:text-gray-300">
                  Escolha o tema que mais combina com você
                </Text>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {themeOptions.map((option) => (
                <ThemeOption
                  key={option.value}
                  {...option}
                  selected={data.theme === option.value}
                  onClick={() => handleThemeChange(option.value)}
                />
              ))}
            </div>
          </Card>

          {/* Help Text */}
          <div className="text-center bg-secondary/15 p-3 rounded-xl">
            <Text size="sm" className="text-gray-800 dark:text-gray-200">
              💡 Não se preocupe, você pode alterar essas configurações a
              qualquer momento nas preferências da conta.
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
};
