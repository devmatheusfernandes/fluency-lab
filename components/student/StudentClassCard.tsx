"use client";
import { PopulatedStudentClass, ClassStatus } from "@/types/classes/class";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { toast } from "sonner";
import { useState } from "react";
import RescheduleModal from "./RescheduleModal";

export default function StudentClassCard({
  cls,
  canReschedule,
  onCancel,
}: {
  cls: PopulatedStudentClass;
  canReschedule: boolean;
  onCancel?: (classId: string) => Promise<void>;
}) {
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  const isReschedulable =
    (cls.status === ClassStatus.SCHEDULED ||
      cls.status === ClassStatus.NO_SHOW ||
      cls.status === ClassStatus.CANCELED_TEACHER_MAKEUP) &&
    canReschedule;

  const isCancelable = cls.status === ClassStatus.SCHEDULED;

  const isTeacherMakeup = cls.status === ClassStatus.CANCELED_TEACHER_MAKEUP;

  const handleRescheduleClick = () => {
    setIsRescheduleModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsRescheduleModalOpen(false);
  };

  const handleCancelClick = async () => {
    if (!onCancel) return;

    const confirmMessage =
      "Tem certeza que deseja cancelar esta aula? Esta ação não pode ser desfeita.";
    if (!confirm(confirmMessage)) return;

    setIsCanceling(true);
    try {
      await onCancel(cls.id);
      toast.success("Aula cancelada com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao cancelar aula");
    } finally {
      setIsCanceling(false);
    }
  };

  const getStatusBadge = () => {
    if (cls.status === ClassStatus.CANCELED_TEACHER_MAKEUP) {
      return (
        <>
          <Badge variant="warning" className="capitalize">
            Reposição
          </Badge>
          <Badge variant="info" style="outline" className="text-xs">
            Cancelada pelo Professor
          </Badge>
        </>
      );
    }

    return (
      <>
        <Badge variant="secondary" className="capitalize">
          {cls.status}
        </Badge>
        {cls.rescheduledFrom && (
          <Badge variant="info" style="outline" className="text-xs">
            Reagendada
          </Badge>
        )}
      </>
    );
  };

  return (
    <>
      <Card className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start space-x-4">
            <Avatar>
              <AvatarImage src={cls.teacherAvatarUrl} />
              <AvatarFallback>{cls.teacherName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-bold text-lg">{cls.teacherName}</h3>
              <p className="text-sm font-semibold text-primary">
                {new Date(cls.scheduledAt).toLocaleDateString("pt-BR", {
                  weekday: "long",
                  day: "2-digit",
                  month: "long",
                })}
              </p>
              <p className="text-sm text-subtitle">
                {new Date(cls.scheduledAt).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              {isTeacherMakeup && (
                <p className="text-xs text-warning font-medium mt-1">
                  ⚠️ Aula de reposição - Cancelada pelo professor
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">{getStatusBadge()}</div>
        </div>

        <div className="flex justify-end gap-2">
          {isCancelable && onCancel && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCancelClick}
              disabled={isCanceling}
            >
              {isCanceling ? "Cancelando..." : "Cancelar"}
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleRescheduleClick}
            disabled={!isReschedulable}
            variant={isTeacherMakeup ? "primary" : "secondary"}
          >
            {isTeacherMakeup ? "Reagendar com Crédito" : "Reagendar"}
          </Button>
        </div>
      </Card>

      <RescheduleModal
        isOpen={isRescheduleModalOpen}
        onClose={handleCloseModal}
        classToReschedule={cls}
      />
    </>
  );
}
