"use client";

import { Vacation } from "@/types/time/vacation";
import { Card } from "../ui/Card";
import { Text } from "../ui/Text";
import { Button } from "../ui/Button";
import { TrashBinMinimalistic } from "@solar-icons/react";
import { toast } from "sonner";

interface TeacherVacationListProps {
  vacations: Vacation[];
  onDelete: () => void; // Função para recarregar a lista após a exclusão
}

export default function TeacherVacationList({
  vacations,
  onDelete,
}: TeacherVacationListProps) {
  const handleDelete = async (vacationId: string) => {
    if (
      !confirm(
        "Tem a certeza de que deseja cancelar este período de férias? As aulas afetadas serão reagendadas."
      )
    )
      return;

    // A lógica de exclusão seria implementada aqui, chamando uma API DELETE
    // Por enquanto, vamos simular a ação.
    toast.info("Funcionalidade de exclusão de férias a ser implementada.");
  };

  if (vacations.length === 0) {
    return (
      <Text variant="placeholder">Nenhum período de férias agendado.</Text>
    );
  }

  return (
    <div className="space-y-4">
      <Text weight="semibold">Os seus períodos de férias agendados</Text>
      {vacations.map((vac) => (
        <Card
          key={vac.id}
          className="p-4 flex justify-between items-center bg-surface-1"
        >
          <div>
            <Text>
              <span className="font-medium">De:</span>{" "}
              {new Date(vac.startDate).toLocaleDateString("pt-BR")}
            </Text>
            <Text>
              <span className="font-medium">Até:</span>{" "}
              {new Date(vac.endDate).toLocaleDateString("pt-BR")}
            </Text>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-danger"
            onClick={() => handleDelete(vac.id!)}
          >
            <TrashBinMinimalistic />
          </Button>
        </Card>
      ))}
    </div>
  );
}
