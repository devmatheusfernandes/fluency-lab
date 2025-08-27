// app/hub/plataforma/teacher/my-classes/page.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { PopulatedStudentClass, ClassStatus } from "@/types/classes/class";
import ClassCard from "@/components/teacher/ClassCard";
import { Badge } from "@/components/ui/Badge"; // Usaremos o Badge para os botões de filtro
import { useTeacher } from "@/hooks/useTeacher";

// Opções de filtro que aparecerão na tela
const filterOptions: { label: string; value: ClassStatus | "all" }[] = [
  { label: "Todas", value: "all" },
  { label: "Agendadas", value: ClassStatus.SCHEDULED },
  { label: "Concluídas", value: ClassStatus.COMPLETED },
  { label: "Canceladas", value: ClassStatus.CANCELED_STUDENT }, // Podemos unificar os cancelamentos na UI se quisermos
];

export default function MyTeacherClassesPage() {
  const [classes, setClasses] = useState<PopulatedStudentClass[]>([]);
  const { myClasses, fetchMyClasses, isLoading, error } = useTeacher();

  // NOVO: Estado para controlar o filtro ativo
  const [activeFilter, setActiveFilter] = useState<ClassStatus | "all">("all");

  // O useEffect agora só precisa chamar a função do hook uma vez.
  useEffect(() => {
    fetchMyClasses();
  }, [fetchMyClasses]);

  // NOVO: Memoiza a lista de aulas filtradas para performance
  const filteredClasses = useMemo(() => {
    if (activeFilter === "all") {
      return myClasses;
    }
    // Para 'Canceladas', mostramos ambos os tipos de cancelamento
    if (activeFilter === ClassStatus.CANCELED_STUDENT) {
      return myClasses.filter(
        (cls) =>
          cls.status === ClassStatus.CANCELED_STUDENT ||
          cls.status === ClassStatus.CANCELED_TEACHER
      );
    }
    return classes.filter((cls) => cls.status === activeFilter);
  }, [classes, activeFilter]);

  if (isLoading)
    return (
      <div style={{ padding: "20px" }}>Carregando suas próximas aulas...</div>
    );
  if (error)
    return <div style={{ padding: "20px", color: "red" }}>Erro: {error}</div>;

  return (
    <div style={{ padding: "20px" }}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Minhas Aulas</h1>

        {/* NOVA UI de Filtro */}
        <div className="flex items-center space-x-2">
          {filterOptions.map((option) => (
            <Badge
              key={option.value}
              variant={activeFilter === option.value ? "primary" : "secondary"}
              onClick={() => setActiveFilter(option.value)}
              className="cursor-pointer"
            >
              {option.label}
            </Badge>
          ))}
        </div>
      </div>

      {filteredClasses.length === 0 ? (
        <p>Você não tem nenhuma aula agendada no momento.</p>
      ) : (
        <div className="space-y-4">
          {filteredClasses.map((cls) => (
            <ClassCard key={cls.id} cls={cls} />
          ))}
        </div>
      )}
    </div>
  );
}
