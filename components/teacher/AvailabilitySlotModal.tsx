// components/teacher/AvailabilitySlotModal.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
  ModalClose,
  ModalPrimaryButton,
} from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Text } from "@/components/ui/Text";
import {
  Select,
  SelectContent,
  SelectOption,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { toast } from "sonner";
import { AvailabilityType } from "@/types/time/availability";
import { Loading } from "../ui/Loading";

interface AvailabilitySlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: Date;
  onSlotCreated: () => void;
}

export default function AvailabilitySlotModal({
  isOpen,
  onClose,
  selectedDate,
  onSlotCreated,
}: AvailabilitySlotModalProps) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<AvailabilityType>(AvailabilityType.REGULAR);
  const [startDate, setStartDate] = useState<Date>(selectedDate || new Date());
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("09:45");
  const [isRepeating, setIsRepeating] = useState(false);
  const [repeatingType, setRepeatingType] = useState("weekly");
  const [interval, setInterval] = useState(1);
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Set default end time when start time changes
  useEffect(() => {
    if (startTime) {
      const [hours, minutes] = startTime.split(":").map(Number);
      const end = new Date();
      end.setHours(hours, minutes + 45, 0, 0);
      setEndTime(
        `${end.getHours().toString().padStart(2, "0")}:${end.getMinutes().toString().padStart(2, "0")}`
      );
    }
  }, [startTime]);

  // Set default date when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      setStartDate(selectedDate);
      const endDate = new Date(selectedDate);
      endDate.setMonth(endDate.getMonth() + 3);
      setEndDate(endDate.toISOString().split("T")[0]);
    }
  }, [selectedDate]);

  // Set default end date when startDate changes
  useEffect(() => {
    if (startDate) {
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 3);
      setEndDate(endDate.toISOString().split("T")[0]);
    }
  }, [startDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload: any = {
        title,
        type,
        startDate: startDate,
        startTime,
        endTime,
      };

      if (isRepeating) {
        payload.repeating = {
          type: repeatingType,
          interval: Number(interval),
          endDate: endDate ? new Date(endDate) : undefined,
        };
      }

      const response = await fetch("/api/teacher/availability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create availability slot");
      }

      toast.success("Horário adicionado com sucesso!");
      onSlotCreated();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Erro ao adicionar horário");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent>
        <ModalClose />
        <ModalHeader>
          <ModalTitle>Adicionar Novo Horário</ModalTitle>
          <ModalDescription>
            Defina um novo horário disponível para agendamento de aulas.
          </ModalDescription>
        </ModalHeader>
        <form onSubmit={handleSubmit}>
          <ModalBody className="space-y-4">
            <div>
              <label htmlFor="title">Título</label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Horário de aulas"
                required
              />
            </div>

            <div>
              <label htmlFor="type">Tipo de Horário</label>
              <Select
                value={type}
                onValueChange={(value) => setType(value as AvailabilityType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectOption value={AvailabilityType.REGULAR}>
                    Regular (Aulas fixas)
                  </SelectOption>
                  <SelectOption value={AvailabilityType.OCCASIONAL}>
                    Ocasional (Aulas avulsas)
                  </SelectOption>
                  <SelectOption value={AvailabilityType.MAKEUP}>
                    Reposição (Aulas de reposição)
                  </SelectOption>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="startDate">Data de Início</label>
              <Input
                id="startDate"
                type="date"
                value={startDate.toISOString().split("T")[0]}
                onChange={(e) => setStartDate(new Date(e.target.value))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startTime">Início</label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="endTime">Fim</label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isRepeating"
                checked={isRepeating}
                onCheckedChange={(checked) =>
                  setIsRepeating(checked as boolean)
                }
              />
              <label htmlFor="isRepeating">Repetir este horário</label>
            </div>

            {isRepeating && (
              <div className="space-y-4 pl-6 border-l-2 border-surface-2">
                <div>
                  <label htmlFor="repeatingType">Frequência</label>
                  <Select
                    value={repeatingType}
                    onValueChange={setRepeatingType}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectOption value="weekly">Semanalmente</SelectOption>
                      <SelectOption value="bi-weekly">
                        Quinzenalmente
                      </SelectOption>
                      <SelectOption value="monthly">Mensalmente</SelectOption>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label htmlFor="interval">Intervalo</label>
                  <Input
                    id="interval"
                    type="number"
                    min="1"
                    value={interval}
                    onChange={(e) => setInterval(Number(e.target.value))}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="endDate">Data de Término (Opcional)</label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <ModalPrimaryButton type="submit" disabled={isLoading}>
              {isLoading ? <Loading size="sm" /> : "Adicionar Horário"}
            </ModalPrimaryButton>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
