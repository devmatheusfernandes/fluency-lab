"use client";

import { useState } from "react";
import { StudentClass, ClassStatus } from "@/types/classes/class";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { Badge } from "@/components/ui/Badge";
import {
  Select,
  SelectContent,
  SelectOption,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { toast } from "sonner";

interface TeacherMyClassesClientProps {
  initialClasses: StudentClass[];
}

export default function TeacherMyClassesClient({
  initialClasses,
}: TeacherMyClassesClientProps) {
  const [classes, setClasses] = useState<StudentClass[]>(initialClasses);
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusChange = async (
    classId: string,
    newStatus: ClassStatus
  ) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/classes/${classId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      // Atualiza a lista de aulas localmente com o novo status
      setClasses((prevClasses) =>
        prevClasses.map((cls) =>
          cls.id === classId ? { ...cls, status: newStatus } : cls
        )
      );
      toast.success("Status da aula atualizado!");
    } catch (error: any) {
      toast.error(`Erro ao atualizar status: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Minhas Aulas</h1>
      {classes.length === 0 ? (
        <Text>Você não tem nenhuma aula agendada.</Text>
      ) : (
        classes.map((cls) => (
          <Card
            key={cls.id}
            className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          >
            <div>
              <Text weight="bold">
                {new Date(cls.scheduledAt).toLocaleString("pt-BR", {
                  dateStyle: "full",
                  timeStyle: "short",
                })}
              </Text>
              <Text variant="subtitle">
                Aluno: {cls.studentId || "Carregando..."}
              </Text>
              <Text variant="placeholder">Tipo: {cls.classType || "N/D"}</Text>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <Badge
                variant={cls.status === "completed" ? "success" : "primary"}
                className="capitalize"
              >
                {cls.status}
              </Badge>
              <Select
                value={cls.status} // ▼▼▼ CORREÇÃO DO ERRO DE DIGITAÇÃO ▼▼▼
                onValueChange={(value) =>
                  handleStatusChange(cls.id, value as ClassStatus)
                }
                disabled={isLoading || cls.status !== "scheduled"}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Alterar Status" />
                </SelectTrigger>

                <SelectContent>
                  <SelectOption value={ClassStatus.COMPLETED}>
                    Concluída
                  </SelectOption>

                  <SelectOption value={ClassStatus.NO_SHOW}>
                    Aluno Faltou
                  </SelectOption>
                </SelectContent>
              </Select>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
