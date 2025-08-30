"use client";

import { useEffect, useState, useMemo } from "react";
import { PopulatedStudentClass, ClassStatus } from "@/types/classes/class";
import ClassCard from "@/components/teacher/ClassCard";
import { Badge } from "@/components/ui/Badge";
import { useTeacher } from "@/hooks/useTeacher";
import {
  Select,
  SelectContent,
  SelectOption,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Text } from "@/components/ui/Text";

const filterOptions: { label: string; value: ClassStatus | "all" }[] = [
  { label: "Todas", value: "all" },
  { label: "Agendadas", value: ClassStatus.SCHEDULED },
  { label: "Concluídas", value: ClassStatus.COMPLETED },
  { label: "Canceladas", value: ClassStatus.CANCELED_STUDENT },
];

// Funções auxiliares para os filtros de data
const monthOptions = Array.from({ length: 12 }, (_, i) => ({
  value: i,
  label: new Date(0, i).toLocaleString("pt-BR", { month: "long" }),
}));
const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

export default function MyTeacherClassesPage() {
  const { myClasses, fetchMyClasses, updateClassStatus, isLoading, error } =
    useTeacher(); // Estados para todos os filtros

  const [statusFilter, setStatusFilter] = useState<ClassStatus | "all">("all");
  const [selectedMonth, setSelectedMonth] = useState<number | "all">(
    new Date().getMonth()
  );
  const [selectedYear, setSelectedYear] = useState<number | "all">(
    new Date().getFullYear()
  );
  const [selectedStudent, setSelectedStudent] = useState<string>("all");

  useEffect(() => {
    fetchMyClasses();
  }, [fetchMyClasses]);

  // Cria uma lista de alunos únicos para o filtro
  const studentOptions = useMemo(() => {
    if (!myClasses) return [];
    const students = myClasses.map((cls) => ({
      studentId: cls.studentId,
      studentName: cls.studentName,
    }));
    // Remove duplicados
    const uniqueStudents = Array.from(
      new Map(students.map((s) => [s.studentId, s])).values()
    );
    return uniqueStudents;
  }, [myClasses]); // Aplica todos os filtros na lista de aulas

  const filteredClasses = useMemo(() => {
    if (!myClasses) return [];
    return myClasses.filter((cls) => {
      const classDate = new Date(cls.scheduledAt);
      // Filtro de Status
      const statusMatch = statusFilter === "all" || cls.status === statusFilter;
      // Filtro de Ano
      const yearMatch =
        selectedYear === "all" || classDate.getFullYear() === selectedYear;
      // Filtro de Mês
      const monthMatch =
        selectedMonth === "all" || classDate.getMonth() === selectedMonth;
      // Filtro de Aluno
      const studentMatch =
        selectedStudent === "all" || cls.studentId === selectedStudent;

      return statusMatch && yearMatch && monthMatch && studentMatch;
    });
  }, [myClasses, statusFilter, selectedYear, selectedMonth, selectedStudent]);

  if (isLoading && myClasses.length === 0)
    return <p>Carregando suas aulas...</p>;
  if (error) return <p style={{ color: "red" }}>Erro: {error}</p>;

  return (
    <div className="p-6 space-y-6">
      {" "}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Minhas Aulas</h1>{" "}
      </div>
      {/* --- NOVA ÁREA DE FILTROS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded-lg">
        {/* Filtro de Status */}
        <div className="space-y-1">
          <Text size="sm" variant="subtitle">
            Status
          </Text>
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <Badge
                key={option.value}
                variant={
                  statusFilter === option.value ? "primary" : "secondary"
                }
                onClick={() => setStatusFilter(option.value)}
                className="cursor-pointer"
              >
                {option.label}
              </Badge>
            ))}
          </div>
        </div>
        {/* Filtro de Aluno */}
        <div className="space-y-1">
          <Text size="sm" variant="subtitle">
            Aluno
          </Text>
          <Select value={selectedStudent} onValueChange={setSelectedStudent}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectOption value="all">Todos os Alunos</SelectOption>
              {studentOptions.map((s) => (
                <SelectOption key={s.studentId} value={s.studentId}>
                  {s.studentName}
                </SelectOption>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Filtro de Mês */}
        <div className="space-y-1">
          <Text size="sm" variant="subtitle">
            Mês
          </Text>
          <Select
            value={String(selectedMonth)}
            onValueChange={(val) =>
              setSelectedMonth(val === "all" ? "all" : Number(val))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectOption value="all">Todos os Meses</SelectOption>
              {monthOptions.map((m) => (
                <SelectOption key={m.value} value={String(m.value)}>
                  {m.label}
                </SelectOption>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Filtro de Ano */}
        <div className="space-y-1">
          <Text size="sm" variant="subtitle">
            Ano
          </Text>
          <Select
            value={String(selectedYear)}
            onValueChange={(val) =>
              setSelectedYear(val === "all" ? "all" : Number(val))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectOption value="all">Todos os Anos</SelectOption>
              {yearOptions.map((y) => (
                <SelectOption key={y} value={String(y)}>
                  {y}
                </SelectOption>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {filteredClasses.length === 0 ? (
        <div className="text-center py-10">
          <Text variant="subtitle">
            Nenhuma aula encontrada para os filtros selecionados.
          </Text>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredClasses.map((cls) => (
            <ClassCard
              key={cls.id}
              cls={cls}
              onUpdateStatus={updateClassStatus}
              isUpdating={isLoading}
            />
          ))}
        </div>
      )}
    </div>
  );
}
