// components/teacher/AvailabilitySlotDetailsModal.tsx
"use client";

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
import { Card } from "@/components/ui/Card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarEvent } from "@/types/calendar/calendar";
import { AvailabilityType } from "@/types/time/availability";

interface AvailabilitySlotDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: CalendarEvent | null;
}

export default function AvailabilitySlotDetailsModal({
  isOpen,
  onClose,
  event,
}: AvailabilitySlotDetailsModalProps) {
  if (!event) return null;

  const getAvailabilityTypeText = (type: string) => {
    switch (type) {
      case AvailabilityType.REGULAR:
        return "Regular";
      case AvailabilityType.OCCASIONAL:
        return "Ocasional";
      case AvailabilityType.MAKEUP:
        return "Reposição";
      default:
        return type;
    }
  };

  const getRepeatingTypeText = (type: string) => {
    switch (type) {
      case "weekly":
        return "Semanalmente";
      case "bi-weekly":
        return "Quinzenalmente";
      case "monthly":
        return "Mensalmente";
      default:
        return type;
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Detalhes do Horário</ModalTitle>
          <ModalClose />
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Card className="p-4">
              <Text variant="title" size="lg">
                {event.title}
              </Text>
            </Card>

            <Card className="p-4">
              <Text variant="title" className="mb-3">
                Informações do Horário
              </Text>

              <div className="space-y-2">
                <div>
                  <Text className="text-subtitle font-medium">
                    Data de Início
                  </Text>
                  <Text>
                    {format(new Date(event.date), "PPP", {
                      locale: ptBR,
                    })}
                  </Text>
                </div>

                <div>
                  <Text className="text-subtitle font-medium">Horário</Text>
                  <Text>
                    {event.startTime} - {event.endTime}
                  </Text>
                </div>

                <div>
                  <Text className="text-subtitle font-medium">Tipo</Text>
                  <Text>
                    {event.slotId
                      ? getAvailabilityTypeText(event.slotId)
                      : "Não especificado"}
                  </Text>
                </div>

                {event.repeating && (
                  <>
                    <div>
                      <Text className="text-subtitle font-medium">
                        Repetição
                      </Text>
                      <Text>
                        {getRepeatingTypeText(event.repeating.type)} a cada{" "}
                        {event.repeating.interval} vez(es)
                      </Text>
                    </div>
                    {event.repeating.endDate && (
                      <div>
                        <Text className="text-subtitle font-medium">
                          Data de Término
                        </Text>
                        <Text>
                          {format(new Date(event.repeating.endDate), "PPP", {
                            locale: ptBR,
                          })}
                        </Text>
                      </div>
                    )}
                  </>
                )}
              </div>
            </Card>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Fechar</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
