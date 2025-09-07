"use client";

import { Vacation } from "@/types/time/vacation";
import { Card } from "../ui/Card";
import { Text } from "../ui/Text";
import { Button } from "../ui/Button";
import { TrashBinMinimalistic } from "@solar-icons/react";
import { toast } from "sonner";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
  ModalClose,
  ModalPrimaryButton,
  ModalSecondaryButton,
} from "@/components/ui/Modal";
import { useState } from "react";

interface TeacherVacationListProps {
  vacations: Vacation[];
  onDelete: () => void; // Função para recarregar a lista após a exclusão
}

export default function TeacherVacationList({
  vacations,
  onDelete,
}: TeacherVacationListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vacationToDelete, setVacationToDelete] = useState<string | null>(null);

  const openDeleteModal = (vacationId: string) => {
    setVacationToDelete(vacationId);
    setIsModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsModalOpen(false);
    setVacationToDelete(null);
  };

  const handleDelete = async () => {
    if (!vacationToDelete) return;

    try {
      const response = await fetch(`/api/vacations?id=${vacationToDelete}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao cancelar período de férias");
      }

      toast.success("Período de férias cancelado com sucesso!");
      onDelete(); // Recarrega a lista
      closeDeleteModal();
    } catch (error: any) {
      console.error("Erro ao cancelar período de férias:", error);
      toast.error(`Falha ao cancelar período de férias: ${error.message}`);
    }
  };

  if (vacations.length === 0) {
    return (
      <Text variant="placeholder">Nenhum período de férias agendado.</Text>
    );
  }

  return (
    <>
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
              onClick={() => openDeleteModal(vac.id!)}
            >
              <TrashBinMinimalistic />
            </Button>
          </Card>
        ))}
      </div>

      <Modal open={isModalOpen} onOpenChange={closeDeleteModal}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Cancelar Período de Férias</ModalTitle>
            <ModalDescription>
              Tem a certeza de que deseja cancelar este período de férias? As
              aulas afetadas serão reagendadas.
            </ModalDescription>
            <ModalClose />
          </ModalHeader>
          <ModalFooter>
            <ModalSecondaryButton onClick={closeDeleteModal}>
              Cancelar
            </ModalSecondaryButton>
            <ModalPrimaryButton onClick={handleDelete}>
              Confirmar
            </ModalPrimaryButton>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
