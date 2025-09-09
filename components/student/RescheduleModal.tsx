"use client";

import { useState, useEffect } from "react";
import { PopulatedStudentClass, StudentClass } from "@/types/classes/class";
import { AvailabilitySlot } from "@/types/time/availability";
import { AvailableTimeSlot } from "@/hooks/useTeacherAvailabilityForReschedule";
import { useStudent } from "@/hooks/useStudent";
import {
  Modal,
  ModalBody,
  ModalClose,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { TextArea } from "@/components/ui/TextArea";
import { Loading } from "@/components/ui/Loading";
import { toast } from "sonner";
import { useRescheduleAvailability } from "@/hooks/useRescheduleAvailability";
import { useTeacherAvailabilityForReschedule } from "@/hooks/useTeacherAvailabilityForReschedule";

interface RescheduleModalProps {
  isOpen: any;
  onClose: any;
  classToReschedule: PopulatedStudentClass | null;
}

export default function RescheduleModal({
  isOpen,
  onClose,
  classToReschedule,
}: RescheduleModalProps) {
  const {
    rescheduleClass,
    fetchTeacherAvailability,
    isLoading: isHookLoading,
  } = useStudent();
  const [selectedSlot, setSelectedSlot] = useState<AvailableTimeSlot | null>(
    null
  );
  const [reason, setReason] = useState("");
  const { availableSlots, isLoadingSlots, rawData } =
    useTeacherAvailabilityForReschedule(isOpen, classToReschedule);

  const handleConfirmReschedule = async () => {
    if (!classToReschedule || !selectedSlot) return;

    const success = await rescheduleClass(
      classToReschedule.id,
      selectedSlot.date,
      reason,
      selectedSlot.availabilitySlotId
    );
    if (success) {
      onClose();
    }
  };

  // Check if this is a teacher makeup class that will use a teacher cancellation credit
  const isTeacherMakeupClass =
    classToReschedule?.status === "canceled-teacher-makeup";

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Reagendar Aula</ModalTitle>
          <ModalClose />
        </ModalHeader>
        {classToReschedule && (
          <ModalBody>
            <Text>
              Selecione um novo horário para a sua aula com{" "}
              <span className="font-bold">{classToReschedule.teacherName}</span>
              .
            </Text>

            {isTeacherMakeupClass && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md mb-4">
                <p className="text-sm text-yellow-800">
                  <span className="font-bold">Aviso:</span> Esta aula foi
                  cancelada pelo professor e será reagendada usando um crédito
                  de reposição. Após reagendar, o crédito será consumido.
                </p>
              </div>
            )}

            {isLoadingSlots ? (
              <Loading />
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {availableSlots.length > 0 ? (
                  availableSlots.map((slot) => (
                    <button
                      key={`${slot.availabilitySlotId}-${slot.date.toISOString()}`}
                      onClick={() => setSelectedSlot(slot)}
                      className={`w-full text-left p-3 rounded-md border transition-colors ${selectedSlot?.date.getTime() === slot.date.getTime() ? "bg-primary text-primary-foreground border-primary" : "hover:bg-surface-1"}`}
                    >
                      {slot.date.toLocaleString("pt-BR", {
                        dateStyle: "full",
                        timeStyle: "short",
                      })}
                    </button>
                  ))
                ) : (
                  <div className="space-y-2">
                    <Text variant="placeholder">
                      Nenhum horário de reposição disponível.
                    </Text>
                    {rawData && (
                      <details className="text-xs text-gray-500">
                        <summary>Debug Info</summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs">
                          {JSON.stringify(
                            {
                              slotsCount: rawData.slots?.length || 0,
                              sampleSlots: rawData.slots?.slice(0, 2),
                              settings: rawData.settings,
                            },
                            null,
                            2
                          )}
                        </pre>
                      </details>
                    )}
                  </div>
                )}
              </div>
            )}

            <div>
              <label
                htmlFor="reason"
                className="block text-sm font-medium text-subtitle mb-1"
              >
                Motivo (Opcional)
              </label>
              <TextArea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ex: Compromisso de trabalho"
              />
            </div>
          </ModalBody>
        )}
        <ModalFooter>
          <Button onClick={onClose}>Cancelar</Button>
          <Button
            onClick={handleConfirmReschedule}
            disabled={!selectedSlot || isHookLoading}
          >
            {isHookLoading
              ? "A Reagendar..."
              : isTeacherMakeupClass
                ? "Confirmar e Usar Crédito"
                : "Confirmar Novo Horário"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
