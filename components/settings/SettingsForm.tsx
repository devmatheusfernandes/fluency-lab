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
import { Input } from "@/components/ui/Input";
import TwoFactorSetup from "./TwoFactorSetup";
import { GoogleCalendarDefaultTimes } from "@/types/users/users";

interface SettingsFormProps {
  currentLanguage: string;
  currentTheme: "light" | "dark";
  googleCalendarConnected?: boolean;
  googleCalendarDefaultTimes?: GoogleCalendarDefaultTimes;
}

export default function SettingsForm({
  currentLanguage,
  currentTheme,
  googleCalendarConnected = false,
  googleCalendarDefaultTimes = {},
}: SettingsFormProps) {
  const [language, setLanguage] = useState(currentLanguage);
  const [theme, setTheme] = useState(currentTheme);
  const [defaultTimes, setDefaultTimes] = useState<GoogleCalendarDefaultTimes>(
    googleCalendarDefaultTimes || {}
  );
  const { updateSettings, isLoading } = useSettings();

  // Efeito para aplicar a classe 'dark' ao body
  useEffect(() => {
    document.body.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      interfaceLanguage: language,
      theme,
      googleCalendarDefaultTimes: defaultTimes,
    });
  };

  const handleConnectGoogleCalendar = () => {
    window.location.href = "/api/student/google-calendar/connect";
  };

  const handleTimeChange = (
    day: string,
    timeType: "startTime" | "endTime",
    value: string
  ) => {
    setDefaultTimes((prev) => ({
      ...prev,
      [day]: {
        ...prev[day as keyof GoogleCalendarDefaultTimes],
        [timeType]: value,
      },
    }));
  };

  const dayNames = [
    { key: "monday", label: "Segunda-feira" },
    { key: "tuesday", label: "Terça-feira" },
    { key: "wednesday", label: "Quarta-feira" },
    { key: "thursday", label: "Quinta-feira" },
    { key: "friday", label: "Sexta-feira" },
    { key: "saturday", label: "Sábado" },
    { key: "sunday", label: "Domingo" },
  ];

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
        <Text variant="subtitle" size="lg" weight="semibold">
          Google Calendar
        </Text>
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Text weight="medium">Conexão com Google Calendar</Text>
              <Text size="sm" variant="placeholder">
                {googleCalendarConnected
                  ? "Conta conectada com sucesso"
                  : "Conecte sua conta do Google Calendar para sincronizar tarefas"}
              </Text>
            </div>
            <Button
              variant={googleCalendarConnected ? "secondary" : "primary"}
              onClick={handleConnectGoogleCalendar}
            >
              {googleCalendarConnected ? "Reconectar" : "Conectar"}
            </Button>
          </div>

          {googleCalendarConnected && (
            <div className="mt-6">
              <Text weight="medium" className="mb-4">
                Horários padrão para sincronização
              </Text>
              <div className="space-y-4">
                {dayNames.map(({ key, label }) => (
                  <div
                    key={key}
                    className="flex items-center justify-between gap-4"
                  >
                    <label className="w-32">{label}</label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="time"
                        value={
                          defaultTimes[key as keyof GoogleCalendarDefaultTimes]
                            ?.startTime || "09:00"
                        }
                        onChange={(e) =>
                          handleTimeChange(key, "startTime", e.target.value)
                        }
                        className="w-24"
                      />
                      <span>até</span>
                      <Input
                        type="time"
                        value={
                          defaultTimes[key as keyof GoogleCalendarDefaultTimes]
                            ?.endTime || "10:00"
                        }
                        onChange={(e) =>
                          handleTimeChange(key, "endTime", e.target.value)
                        }
                        className="w-24"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="border-t border-surface-2" />

      <section>
        <Text variant="subtitle" size="lg" weight="semibold">
          Security
        </Text>
        <TwoFactorSetup />
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
