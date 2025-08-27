"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  ModalBody,
  ModalClose,
  ModalContent,
  ModalField,
  ModalFooter,
  ModalForm,
  ModalHeader,
  ModalPrimaryButton,
  ModalSecondaryButton,
  ModalTitle,
  ModalDescription,
  ModalIcon,
} from "@/components/ui/Modal";
import { CalendarEvent } from "@/components/ui/Calendar";

interface BookingConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (classTopic: string) => void;
  event: CalendarEvent | null;
  isLoading: boolean;
  error: string | null;
}

export default function BookingConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  event,
  isLoading,
  error,
}: BookingConfirmationModalProps) {
  const [classTopic, setClassTopic] = useState("");

  // Limpa o campo de texto quando o modal é reaberto para um novo evento
  useEffect(() => {
    if (isOpen) {
      setClassTopic("");
    }
  }, [isOpen]);

  if (!event) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(classTopic);
  };

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent>
        <ModalHeader>
          <ModalIcon type="confirm" />
          <ModalTitle>Confirmar Agendamento</ModalTitle>
          <ModalDescription>
            Você está prestes a usar 1 crédito de aula.
          </ModalDescription>
          <ModalClose />
        </ModalHeader>
        <ModalForm onSubmit={handleSubmit}>
          <ModalBody>
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <p>
                <strong>Data:</strong>{" "}
                {new Date(event.date).toLocaleDateString()}
              </p>
              <p>
                <strong>Horário:</strong> {event.startTime} - {event.endTime}
              </p>
            </div>
            <ModalField
              label="O que você gostaria de praticar nesta aula?"
              required
            >
              <textarea
                value={classTopic}
                onChange={(e) => setClassTopic(e.target.value)}
                placeholder="Ex: Preciso de ajuda para preparar uma apresentação em inglês para o trabalho."
                className="w-full p-2 border rounded min-h-[100px]"
                required
              />
            </ModalField>
          </ModalBody>
          <ModalFooter>
            <ModalSecondaryButton
              type="button"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </ModalSecondaryButton>
            <ModalPrimaryButton type="submit" disabled={isLoading}>
              {isLoading ? "Agendando..." : "Confirmar e Crédito"}
            </ModalPrimaryButton>
          </ModalFooter>
          {error && (
            <p style={{ color: "red", textAlign: "center", marginTop: "10px" }}>
              {error}
            </p>
          )}
        </ModalForm>
      </ModalContent>
    </Modal>
  );
}
