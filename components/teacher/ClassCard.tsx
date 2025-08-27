"use client";

import Link from "next/link";
import { PopulatedStudentClass, ClassStatus } from "@/types/classes/class";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/Avatar";
import { Badge, BadgeProps } from "@/components/ui/Badge"; // 👈 Importe o Badge

interface ClassCardProps {
  cls: PopulatedStudentClass;
}

// Objeto para mapear o status da aula para o texto e a cor do Badge
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

export default function ClassCard({ cls }: ClassCardProps) {
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

  // Verifica se a aula está cancelada para alterar o estilo
  const isCanceled =
    cls.status === ClassStatus.CANCELED_STUDENT ||
    cls.status === ClassStatus.CANCELED_TEACHER;

  // Define as classes do container do card com base no status
  const cardContainerClasses = `block p-4 border rounded-lg shadow-sm transition-all ${
    isCanceled ? "bg-gray-50 opacity-60" : "hover:shadow-md cursor-pointer"
  }`;

  const CardContent = () => (
    <>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <Avatar>
            <AvatarImage src={cls.studentAvatarUrl} alt={cls.studentName} />
            <AvatarFallback>{cls.studentName?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-bold text-lg">{cls.studentName}</h3>
            <p className="text-sm font-semibold text-primary-500">
              {formattedDate}
            </p>
            <p className="text-sm text-gray-600">{formattedTime}</p>
          </div>
        </div>
        {/* 👇 Adiciona o Badge de Status aqui */}
        <Badge variant={statusInfo.variant} style="outline">
          {statusInfo.text}
        </Badge>
      </div>
      {cls.notes && (
        <div className="mt-3 p-3 bg-gray-100 rounded-md border">
          <p className="text-sm text-gray-800 font-semibold">Tópico da Aula:</p>
          <p className="text-sm text-gray-600 italic">"{cls.notes}"</p>
        </div>
      )}
    </>
  );

  // Se a aula não estiver cancelada, o card é um link clicável
  if (!isCanceled) {
    return (
      <Link href={`/hub/plataforma/class/${cls.id}`}>
        <div className={cardContainerClasses}>
          <CardContent />
        </div>
      </Link>
    );
  }

  // Se a aula estiver cancelada, renderiza como uma div não-clicável
  return (
    <div className={cardContainerClasses}>
      <CardContent />
    </div>
  );
}
