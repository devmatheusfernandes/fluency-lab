"use client";

import {
  Modal,
  ModalBody,
  ModalClose,
  ModalContent,
  ModalField,
  ModalFooter,
  ModalForm,
  ModalHeader,
  ModalInput,
  ModalPrimaryButton,
  ModalSecondaryButton,
  ModalTitle,
} from "@/components/ui/Modal";
import {
  AvailabilitySlot,
  AvailabilityType,
  AvailabilityColor,
} from "@/types/time/availability";
import { useState, useEffect } from "react";

// Tipos para o formulário
interface AvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    slotData: Partial<Omit<AvailabilitySlot, "id" | "teacherId">>,
    id?: string
  ) => void;
  onDelete: (slotId: string) => void;
  initialDate: Date | null;
  existingSlot: AvailabilitySlot | null;
}
type RepeatOption = "weekly" | "bi-weekly" | "monthly";
const colorOptions: { label: string; value: AvailabilityColor }[] = [
  { label: "Azul (Padrão)", value: "primary" },
  { label: "Verde (Alunos Avulsos)", value: "success" },
  { label: "Ciano (Reposição)", value: "info" },
];

export default function AvailabilityModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialDate,
  existingSlot,
}: AvailabilityModalProps) {
  const isEditMode = !!existingSlot;

  // Estados do formulário
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [type, setType] = useState(AvailabilityType.OCCASIONAL);
  const [color, setColor] = useState<AvailabilityColor>("success");
  const [isRepeating, setIsRepeating] = useState(false);
  const [repeatOption, setRepeatOption] = useState<RepeatOption>("weekly");
  const [repeatEndDate, setRepeatEndDate] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (existingSlot) {
        // Modo Edição
        setTitle(existingSlot.title);
        setStartTime(existingSlot.startTime);
        setEndTime(existingSlot.endTime);
        setType(existingSlot.type);
        setColor(existingSlot.color || "primary");
        const repeating = existingSlot.repeating;
        setIsRepeating(!!repeating);
        if (repeating) {
          setRepeatOption(
            repeating.type === "weekly" && repeating.interval === 2
              ? "bi-weekly"
              : repeating.type
          );
          setRepeatEndDate(
            repeating.endDate
              ? new Date(repeating.endDate).toISOString().split("T")[0]
              : ""
          );
        }
      } else {
        // Modo Criação
        setTitle("Horário Disponível");
        setStartTime("09:00");
        setEndTime("10:00");
        setType(AvailabilityType.OCCASIONAL);
        setColor("success");
        setIsRepeating(false);
        setRepeatOption("weekly");
        setRepeatEndDate("");
      }
    }
  }, [isOpen, existingSlot]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalDate = existingSlot?.startDate
      ? new Date(existingSlot.startDate)
      : initialDate;
    if (!finalDate) return;

    // 1. Começamos com a base do objeto, os campos que sempre existem.
    // Usamos 'let' para poder modificar o objeto.
    const dataToSend: Partial<Omit<AvailabilitySlot, "id" | "teacherId">> = {
      title,
      startDate: finalDate,
      startTime,
      endTime,
      type,
      color,
    };

    // 2. Apenas se a repetição estiver ativa, nós calculamos e ADICIONAMOS o campo 'repeating'
    if (isRepeating) {
      let repeatingLogic: AvailabilitySlot["repeating"];
      switch (repeatOption) {
        case "weekly":
          repeatingLogic = {
            type: "weekly",
            interval: 1,
            endDate: repeatEndDate ? new Date(repeatEndDate) : undefined,
          };
          break;
        case "bi-weekly":
          repeatingLogic = {
            type: "weekly",
            interval: 2,
            endDate: repeatEndDate ? new Date(repeatEndDate) : undefined,
          };
          break;
        case "monthly":
          repeatingLogic = {
            type: "monthly",
            interval: 1,
            endDate: repeatEndDate ? new Date(repeatEndDate) : undefined,
          };
          break;
      }
      // Adicionamos a propriedade ao nosso objeto
      dataToSend.repeating = repeatingLogic;
    }

    // DEBUG: Adicione esta linha para ver o objeto final no console do navegador
    console.log("Objeto final a ser salvo:", dataToSend);

    // 3. Enviamos o objeto final. Ele SÓ terá a chave 'repeating' se isRepeating for true.
    onSave(dataToSend, existingSlot?.id);
  };

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>
            {isEditMode
              ? "Editar Disponibilidade"
              : "Adicionar Disponibilidade"}
          </ModalTitle>
          <ModalClose />
        </ModalHeader>
        <ModalForm onSubmit={handleSubmit}>
          {/* O JSX do formulário continua o mesmo */}
          <ModalBody>
            <ModalField label="Título">
              <ModalInput
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </ModalField>
            <div className="grid grid-cols-2 gap-4">
              <ModalField label="Início">
                <ModalInput
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </ModalField>
              <ModalField label="Fim">
                <ModalInput
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </ModalField>
            </div>
            <ModalField label="Tipo de Horário">
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AvailabilityType)}
                className="w-full p-2 border rounded"
              >
                {Object.values(AvailabilityType).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </ModalField>
            <ModalField label="Cor do Evento">
              <select
                value={color}
                onChange={(e) => setColor(e.target.value as AvailabilityColor)}
                className="w-full p-2 border rounded"
              >
                {colorOptions.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </ModalField>
            <ModalField>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isRepeating}
                  onChange={(e) => setIsRepeating(e.target.checked)}
                />
                <span>Repetir</span>
              </label>
            </ModalField>
            {isRepeating && (
              <>
                <ModalField label="Frequência da Repetição">
                  <select
                    value={repeatOption}
                    onChange={(e) =>
                      setRepeatOption(e.target.value as RepeatOption)
                    }
                    className="w-full p-2 border rounded"
                  >
                    <option value="weekly">Semanalmente</option>
                    <option value="bi-weekly">
                      Quinzenalmente (a cada 2 semanas)
                    </option>
                    <option value="monthly">
                      Mensalmente (mesmo dia do mês)
                    </option>
                  </select>
                </ModalField>
                <ModalField label="Repetir até (opcional)">
                  <ModalInput
                    type="date"
                    value={repeatEndDate}
                    onChange={(e) => setRepeatEndDate(e.target.value)}
                  />
                </ModalField>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            {isEditMode && (
              <ModalSecondaryButton
                type="button"
                onClick={() => onDelete(existingSlot!.id!)}
                className="!bg-danger/80 hover:!bg-danger !text-white"
              >
                Deletar
              </ModalSecondaryButton>
            )}
            <ModalPrimaryButton type="submit">
              {isEditMode ? "Salvar Alterações" : "Salvar Horário"}
            </ModalPrimaryButton>
          </ModalFooter>
        </ModalForm>
      </ModalContent>
    </Modal>
  );
}
