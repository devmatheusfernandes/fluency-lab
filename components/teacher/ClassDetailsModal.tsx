import { PopulatedStudentClass, ClassStatus } from "@/types/classes/class";
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

interface ClassDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  classData: PopulatedStudentClass | null;
}

export default function ClassDetailsModal({
  isOpen,
  onClose,
  classData,
}: ClassDetailsModalProps) {
  if (!classData) return null;

  const getStatusText = (status: ClassStatus) => {
    switch (status) {
      case ClassStatus.SCHEDULED:
        return "Agendada";
      case ClassStatus.COMPLETED:
        return "Concluída";
      case ClassStatus.CANCELED_STUDENT:
        return "Cancelada pelo aluno";
      case ClassStatus.CANCELED_TEACHER:
        return "Cancelada pelo professor";
      case ClassStatus.CANCELED_TEACHER_MAKEUP:
        return "Cancelada pelo professor (reposição)";
      case ClassStatus.CANCELED_CREDIT:
        return "Cancelada (crédito)";
      case ClassStatus.NO_SHOW:
        return "Falta";
      case ClassStatus.RESCHEDULED:
        return "Reagendada";
      case ClassStatus.TEACHER_VACATION:
        return "Férias do professor";
      case ClassStatus.OVERDUE:
        return "Vencida";
      default:
        return status;
    }
  };

  const getStatusColor = (status: ClassStatus) => {
    switch (status) {
      case ClassStatus.SCHEDULED:
        return "bg-blue-100 text-blue-800";
      case ClassStatus.COMPLETED:
        return "bg-green-100 text-green-800";
      case ClassStatus.CANCELED_STUDENT:
      case ClassStatus.CANCELED_TEACHER:
      case ClassStatus.CANCELED_TEACHER_MAKEUP:
      case ClassStatus.CANCELED_CREDIT:
        return "bg-red-100 text-red-800";
      case ClassStatus.NO_SHOW:
        return "bg-yellow-100 text-yellow-800";
      case ClassStatus.RESCHEDULED:
        return "bg-purple-100 text-purple-800";
      case ClassStatus.TEACHER_VACATION:
        return "bg-indigo-100 text-indigo-800";
      case ClassStatus.OVERDUE:
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Detalhes da Aula</ModalTitle>
          <ModalClose />
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <Text variant="title" size="lg">
                  {classData.studentName}
                </Text>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(classData.status)}`}
                >
                  {getStatusText(classData.status)}
                </span>
              </div>

              {classData.studentAvatarUrl && (
                <div className="mt-3">
                  <img
                    src={classData.studentAvatarUrl}
                    alt={classData.studentName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                </div>
              )}
            </Card>

            <Card className="p-4">
              <Text variant="title" className="mb-3">
                Informações da Aula
              </Text>

              <div className="space-y-2">
                <div>
                  <Text className="text-subtitle font-medium">Data e Hora</Text>
                  <Text>
                    {format(new Date(classData.scheduledAt), "PPP 'às' HH:mm", {
                      locale: ptBR,
                    })}
                  </Text>
                </div>

                <div>
                  <Text className="text-subtitle font-medium">Duração</Text>
                  <Text>{classData.durationMinutes} minutos</Text>
                </div>

                <div>
                  <Text className="text-subtitle font-medium">
                    Tipo de Aula
                  </Text>
                  <Text>
                    {classData.classType === "regular" ? "Regular" : "Avulsa"}
                  </Text>
                </div>

                {classData.notes && (
                  <div>
                    <Text className="text-subtitle font-medium">Notas</Text>
                    <Text>{classData.notes}</Text>
                  </div>
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
