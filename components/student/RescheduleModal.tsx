"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  ModalIcon,
  ModalPrimaryButton,
  ModalSecondaryButton,
} from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { TextArea } from "@/components/ui/TextArea";
import { Loading } from "@/components/ui/Loading";
import { toast } from "sonner";
import { useRescheduleAvailability } from "@/hooks/useRescheduleAvailability";
import { useTeacherAvailabilityForReschedule } from "@/hooks/useTeacherAvailabilityForReschedule";
import { Card } from "@/components/ui/Card";

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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent>
        <AnimatePresence mode="wait">
          <motion.div
            key="reschedule"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <ModalHeader>
              <ModalIcon type="calendar" />
              <ModalTitle>Reagendar Aula</ModalTitle>
              <ModalClose />
            </ModalHeader>
            {classToReschedule && (
              <ModalBody>
                <Text variant="subtitle" size="sm" className="text-center mb-6">
                  Selecione um novo horário para a sua aula com{" "}
                  <span className="font-bold">
                    {classToReschedule.teacherName}
                  </span>
                  .
                </Text>

                {isTeacherMakeupClass && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-800 text-center">
                      <span className="font-bold">Aviso:</span> Esta aula foi
                      cancelada pelo professor. Você pode reagendá-la usando um
                      crédito de reposição sem consumir seus reagendamentos
                      mensais.
                    </p>
                  </div>
                )}

                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 mb-6">
                  <div className="font-medium text-blue-900 dark:text-blue-100">
                    {classToReschedule.language}
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    {formatDate(new Date(classToReschedule.scheduledAt))}
                  </div>
                </div>

                {isLoadingSlots ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {availableSlots.length > 0 ? (
                      availableSlots.map((slot) => (
                        <Card
                          key={`${slot.availabilitySlotId}-${slot.date.toISOString()}`}
                          className={`cursor-pointer transition-all duration-200 ${
                            selectedSlot?.date.getTime() === slot.date.getTime()
                              ? "!border-2 !border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500/20"
                              : "hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700"
                          }`}
                          onClick={() => setSelectedSlot(slot)}
                        >
                          <div className="p-4">
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {formatDate(slot.date)} às{" "}
                              {slot.date.toLocaleTimeString("pt-BR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
                          <div className="text-gray-500 dark:text-gray-400 font-medium">
                            Nenhum horário disponível
                          </div>
                          <div className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                            Não há opções de reagendamento no momento
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-4">
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
              <ModalSecondaryButton onClick={onClose}>
                Cancelar
              </ModalSecondaryButton>
              <ModalPrimaryButton
                onClick={handleConfirmReschedule}
                disabled={!selectedSlot || isHookLoading}
              >
                {isHookLoading
                  ? "A Reagendar..."
                  : isTeacherMakeupClass
                    ? "Confirmar e Usar Crédito"
                    : "Confirmar Novo Horário"}
              </ModalPrimaryButton>
            </ModalFooter>
          </motion.div>
        </AnimatePresence>
      </ModalContent>
    </Modal>
  );
}
