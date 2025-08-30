"use client";

import { useEffect, useState } from "react";
import { useTeacher } from "@/hooks/useTeacher";
import { Card } from "@/components/ui/Card";
import { Header } from "@/components/ui/Header";
import { Text } from "@/components/ui/Text";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Calendar } from "@solar-icons/react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import TeacherVacationList from "./TeacherVacationList";

export default function TeacherVacationManager() {
  const { requestVacation, isLoading, vacations, fetchMyVacations } =
    useTeacher(); // Supondo que o hook retorne 'currentUser'
  const { user } = useCurrentUser();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchMyVacations();
  }, [fetchMyVacations]);

  const handleRequestVacation = async () => {
    if (!startDate || !endDate) return;
    await requestVacation(new Date(startDate), new Date(endDate));
  };

  const remainingDays = user?.vacationDaysRemaining;

  return (
    <Card>
      <div className="p-3 bg-primary/10 border border-primary/20 rounded-md">
        <Text weight="semibold" className="text-primary">
          Você tem {remainingDays} dias de férias restantes para este ano.
        </Text>
        <TeacherVacationList
          vacations={vacations}
          onDelete={fetchMyVacations}
        />
      </div>
      <Header
        heading="Gestão de Férias"
        icon={
          <Calendar weight="BoldDuotone" className="w-8 h-8 text-primary" />
        }
      />
      <div className="p-6 space-y-4">
        <Text variant="subtitle">
          Selecione o período em que estará ausente. Todas as aulas agendadas
          neste intervalo serão marcadas como "Férias" e os alunos serão
          notificados.
        </Text>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div>
            <label
              htmlFor="startDate"
              className="block text-sm font-medium text-subtitle"
            >
              Início
            </label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div>
            <label
              htmlFor="endDate"
              className="block text-sm font-medium text-subtitle"
            >
              Fim
            </label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <Button
            onClick={handleRequestVacation}
            disabled={isLoading || !startDate || !endDate}
          >
            {isLoading ? "A Agendar..." : "Agendar Férias"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
