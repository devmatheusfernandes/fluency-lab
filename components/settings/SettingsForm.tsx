"use client";

import { useState, useEffect } from "react";
import { useSettings } from "@/hooks/useSettings";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import {
  Select,
  SelectContent,
  SelectOption,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";

interface SettingsFormProps {
  currentLanguage: string;
  currentTheme: "light" | "dark";
}

export default function SettingsForm({
  currentLanguage,
  currentTheme,
}: SettingsFormProps) {
  const [language, setLanguage] = useState(currentLanguage);
  const [theme, setTheme] = useState(currentTheme);
  const { updateSettings, isLoading } = useSettings();

  // Efeito para aplicar a classe 'dark' ao body
  useEffect(() => {
    document.body.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({ interfaceLanguage: language, theme });
  };

  return (
    <Card onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      <section>
        <Text variant="subtitle" size="lg" weight="semibold">
          Interface
        </Text>
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="language">Idioma</label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectOption value="pt">Português</SelectOption>
                <SelectOption value="en">English</SelectOption>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <label htmlFor="theme">Tema Escuro</label>
            <Switch
              id="theme"
              checked={theme === "dark"}
              onCheckedChange={(checked) =>
                setTheme(checked ? "dark" : "light")
              }
            />
          </div>
        </div>
      </section>

      <div className="border-t border-surface-2" />

      <section>
        <Text
          variant="subtitle"
          size="lg"
          weight="semibold"
          className="text-danger"
        >
          Zona de Perigo
        </Text>
        <div className="mt-4 p-4 border border-danger/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <Text weight="medium">Desativar Conta</Text>
              <Text size="sm" variant="placeholder">
                Esta ação não pode ser desfeita.
              </Text>
            </div>
            <Button variant="danger">Desativar</Button>
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "A Salvar..." : "Salvar Configurações"}
        </Button>
      </div>
    </Card>
  );
}
