"use client";

import Link from "next/link";
import { PopulatedStudentClass, ClassStatus } from "@/types/classes/class";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/Avatar";
import { Badge, BadgeProps } from "@/components/ui/Badge";
import { Button } from "../ui/Button";
import {
  Select,
  SelectContent,
  SelectOption,
  SelectTrigger,
  SelectValue,
} from "../ui/Select";

interface ClassCardProps {
  cls: PopulatedStudentClass;
  onUpdateStatus: (classId: string, newStatus: ClassStatus) => Promise<boolean>;
  isUpdating: boolean;
}

const statusMap: Record<
  ClassStatus,
  { text: string; variant: BadgeProps["variant"] }
> = {
  [ClassStatus.SCHEDULED]: { text: "Agendada", variant: "primary" },
  [ClassStatus.COMPLETED]: { text: "Concluída", variant: "success" },
  [ClassStatus.CANCELED_STUDENT]: {
    text: "Cancelada (Aluno)",
    variant: "warning",
  },
  [ClassStatus.CANCELED_TEACHER]: {
    text: "Cancelada (Você)",
    variant: "warning",
  },
  [ClassStatus.NO_SHOW]: { text: "Não Compareceu", variant: "secondary" },
  [ClassStatus.RESCHEDULED]: { text: "Reagendada", variant: "info" },
  [ClassStatus.TEACHER_VACATION]: { text: "Férias", variant: "secondary" },
  [ClassStatus.OVERDUE]: { text: "Pendente", variant: "secondary" },
};

export default function ClassCard({
  cls,
  onUpdateStatus,
  isUpdating,
}: ClassCardProps) {
  const classDate = new Date(cls.scheduledAt);
  const formattedDate = classDate.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
  const formattedTime = classDate.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const statusInfo = statusMap[cls.status] || {
    text: cls.status,
    variant: "secondary",
  };
  const canChangeStatus = cls.status === ClassStatus.SCHEDULED;
  const isCanceled =
    cls.status === ClassStatus.CANCELED_STUDENT ||
    cls.status === ClassStatus.CANCELED_TEACHER;

  // ▼▼▼ CORREÇÃO AQUI ▼▼▼
  // O card agora é sempre uma 'div'. O Link foi removido do encapsulamento.
  return (
    <div
      className={`p-4 border rounded-lg shadow-sm transition-all ${isCanceled ? "bg-gray-50 opacity-60" : "bg-container"}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <Avatar>
            <AvatarImage src={cls.studentAvatarUrl} alt={cls.studentName} />
            <AvatarFallback>{cls.studentName?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-bold text-lg">{cls.studentName}</h3>
            <p className="text-sm font-semibold text-primary">
              {formattedDate}
            </p>
            <p className="text-sm text-gray-600">{formattedTime}</p>
          </div>
        </div>
        <Badge
          variant={statusInfo.variant}
          style="outline"
          className="capitalize"
        >
          {statusInfo.text}
        </Badge>
      </div>
      {cls.notes && (
        <div className="mt-3 p-3 bg-gray-100 rounded-md border">
          <p className="text-sm text-gray-800 font-semibold">Tópico da Aula:</p>
          <p className="text-sm text-gray-600 italic">"{cls.notes}"</p>
        </div>
      )}
      <div className="flex items-center justify-end gap-2 pt-3 border-t border-surface-2 mt-3">
        {/* O Link agora está apenas no botão, o que é semanticamente correto. */}
        <Link href={`/hub/plataforma/class/${cls.id}`}>
          <Button size="sm">Ver Detalhes</Button>
        </Link>
        <Select
          onValueChange={(value) =>
            onUpdateStatus(cls.id, value as ClassStatus)
          }
          disabled={!canChangeStatus || isUpdating}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Mudar Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectOption value={ClassStatus.COMPLETED}>
              Marcar como Concluída
            </SelectOption>
            <SelectOption value={ClassStatus.NO_SHOW}>
              Marcar como Falta
            </SelectOption>
            <SelectOption value={ClassStatus.CANCELED_TEACHER}>
              EU CANCELEI
            </SelectOption>
            <SelectOption value={ClassStatus.CANCELED_STUDENT}>
              ALUNO CANCELOU
            </SelectOption>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
