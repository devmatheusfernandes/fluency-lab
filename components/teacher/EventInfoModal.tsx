"use client";

import {
  Modal,
  ModalBody,
  ModalClose,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalIcon,
  ModalPrimaryButton,
  ModalSecondaryButton,
} from "@/components/ui/Modal";
import { CalendarEvent } from "@/components/ui/Calendar";
import { Text } from "@/components/ui/Text";
import { Badge } from "@/components/ui/Badge";

interface EventInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: CalendarEvent | null;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function EventInfoModal({
  isOpen,
  onClose,
  event,
  onEdit,
  onDelete,
}: EventInfoModalProps) {
  if (!event) return null;

  const isReservedClass = event.title === "Reservado";
  const isAvailabilitySlot = !isReservedClass;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (startTime?: string, endTime?: string) => {
    if (!startTime) return "Horário não especificado";
    return endTime ? `${startTime} - ${endTime}` : startTime;
  };

  const getEventColorDisplay = (color: CalendarEvent["color"]) => {
    const colorMap = {
      primary: { label: "Primário", class: "bg-primary text-primary-text" },
      secondary: {
        label: "Secundário",
        class: "bg-secondary text-secondary-text",
      },
      success: { label: "Sucesso", class: "bg-success text-white" },
      warning: { label: "Aviso", class: "bg-warning text-white" },
      danger: { label: "Perigo", class: "bg-danger text-white" },
      info: { label: "Informação", class: "bg-info text-white" },
    };
    return colorMap[color || "primary"];
  };

  const getPriorityDisplay = (priority: CalendarEvent["priority"]) => {
    const priorityMap = {
      high: { label: "Alta", icon: "🔴" },
      medium: { label: "Média", icon: "🟡" },
      low: { label: "Baixa", icon: "🟢" },
    };
    return priority ? priorityMap[priority] : null;
  };

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent className="max-w-md">
        <ModalHeader>
          <ModalIcon type={isReservedClass ? "info" : "success"} />
          <ModalTitle>
            {isReservedClass ? "Aula Agendada" : "Horário de Disponibilidade"}
          </ModalTitle>
          <ModalDescription>
            {isReservedClass
              ? "Informações sobre a aula agendada"
              : "Detalhes do seu horário disponível"}
          </ModalDescription>
          <ModalClose />
        </ModalHeader>

        <ModalBody>
          <div className="space-y-4">
            {/* Title */}
            <div>
              <Text size="sm" className="font-medium text-subtitle mb-1">
                Título
              </Text>
              <Text className="text-title font-semibold">{event.title}</Text>
            </div>

            {/* Description */}
            {event.description && (
              <div>
                <Text size="sm" className="font-medium text-subtitle mb-1">
                  Descrição
                </Text>
                <Text className="text-paragraph">{event.description}</Text>
              </div>
            )}

            {/* Date and Time */}
            <div>
              <Text size="sm" className="font-medium text-subtitle mb-1">
                Data e Horário
              </Text>
              <div className="bg-surface-1 p-3 rounded-lg">
                <Text className="text-title font-medium mb-1">
                  📅 {formatDate(event.date)}
                </Text>
                <Text className="text-paragraph">
                  ⏰ {formatTime(event.startTime, event.endTime)}
                </Text>
              </div>
            </div>

            {/* Student Information (for reserved classes) */}
            {isReservedClass && event.studentInfo && (
              <div>
                <Text size="sm" className="font-medium text-subtitle mb-1">
                  Aluno
                </Text>
                <div className="bg-surface-1 p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    {event.studentInfo.studentAvatarUrl && (
                      <img
                        src={event.studentInfo.studentAvatarUrl}
                        alt={event.studentInfo.studentName || "Aluno"}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <Text className="text-title font-medium">
                        👤{" "}
                        {event.studentInfo.studentName || "Nome não disponível"}
                      </Text>
                      <Text size="sm" className="text-subtitle">
                        ID: {event.studentInfo.studentId}
                      </Text>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Person (for reserved classes) - Legacy fallback */}
            {event.person && !event.studentInfo && (
              <div>
                <Text size="sm" className="font-medium text-subtitle mb-1">
                  Aluno
                </Text>
                <Text className="text-paragraph">👤 {event.person}</Text>
              </div>
            )}

            {/* Location */}
            {event.location && (
              <div>
                <Text size="sm" className="font-medium text-subtitle mb-1">
                  Local
                </Text>
                <Text className="text-paragraph">📍 {event.location}</Text>
              </div>
            )}

            {/* Additional Information */}
            <div className="grid grid-cols-2 gap-4">
              {/* Color */}
              <div>
                <Text size="sm" className="font-medium text-subtitle mb-1">
                  Cor
                </Text>
                <Badge
                  variant="secondary"
                  className={getEventColorDisplay(event.color).class}
                >
                  {getEventColorDisplay(event.color).label}
                </Badge>
              </div>

              {/* Priority */}
              {event.priority && (
                <div>
                  <Text size="sm" className="font-medium text-subtitle mb-1">
                    Prioridade
                  </Text>
                  <div className="flex items-center gap-1">
                    <span>{getPriorityDisplay(event.priority)?.icon}</span>
                    <Text size="sm">
                      {getPriorityDisplay(event.priority)?.label}
                    </Text>
                  </div>
                </div>
              )}
            </div>

            {/* Repeating Information */}
            {event.repeating && (
              <div>
                <Text size="sm" className="font-medium text-subtitle mb-1">
                  Repetição
                </Text>
                <div className="bg-surface-1 p-3 rounded-lg">
                  <Text className="text-paragraph mb-1">
                    🔄 Repete{" "}
                    {event.repeating.type === "weekly"
                      ? "semanalmente"
                      : event.repeating.type === "monthly"
                        ? "mensalmente"
                        : event.repeating.type === "daily"
                          ? "diariamente"
                          : "anualmente"}
                  </Text>
                  <Text size="sm" className="text-subtitle">
                    Intervalo: A cada {event.repeating.interval}{" "}
                    {event.repeating.type === "weekly"
                      ? "semana(s)"
                      : event.repeating.type === "monthly"
                        ? "mês(es)"
                        : event.repeating.type === "daily"
                          ? "dia(s)"
                          : "ano(s)"}
                  </Text>
                  {event.repeating.endDate && (
                    <Text size="sm" className="text-subtitle">
                      Até: {event.repeating.endDate.toLocaleDateString("pt-BR")}
                    </Text>
                  )}
                </div>
              </div>
            )}

            {/* All Day Event */}
            {event.isAllDay && (
              <div>
                <Badge variant="info" style="outline">
                  📅 Evento de dia inteiro
                </Badge>
              </div>
            )}
          </div>
        </ModalBody>

        <ModalFooter>
          {/* Show different actions based on event type */}
          {isAvailabilitySlot ? (
            <>
              {onEdit && (
                <ModalPrimaryButton onClick={onEdit}>
                  Editar Horário
                </ModalPrimaryButton>
              )}
              {onDelete && (
                <ModalSecondaryButton
                  onClick={onDelete}
                  className="bg-danger hover:bg-danger/80 text-white"
                >
                  Deletar
                </ModalSecondaryButton>
              )}
            </>
          ) : (
            <ModalPrimaryButton onClick={onClose}>Fechar</ModalPrimaryButton>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
