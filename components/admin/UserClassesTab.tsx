"use client";

import { StudentClass, ClassStatus } from "@/types/classes/class";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { Text } from "@/components/ui/Text";
import { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectOption,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";

interface UserClassesTabProps {
  classes: StudentClass[];
}

// Helper para gerar uma lista de anos para o filtro
const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear - 1; i <= currentYear + 2; i++) {
    years.push(i);
  }
  return years;
};

const monthOptions = [
  { value: 0, label: "Janeiro" },
  { value: 1, label: "Fevereiro" },
  { value: 2, label: "Março" },
  { value: 3, label: "Abril" },
  { value: 4, label: "Maio" },
  { value: 5, label: "Junho" },
  { value: 6, label: "Julho" },
  { value: 7, label: "Agosto" },
  { value: 8, label: "Setembro" },
  { value: 9, label: "Outubro" },
  { value: 10, label: "Novembro" },
  { value: 11, label: "Dezembro" },
];

// Group classes by year and month
const groupClassesByMonth = (classes: StudentClass[]) => {
  const grouped: Record<string, StudentClass[]> = {};

  classes.forEach((cls) => {
    const date = new Date(cls.scheduledAt);
    const year = date.getFullYear();
    const month = date.getMonth();
    const key = `${year}-${month}`;

    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(cls);
  });

  // Sort by date descending
  Object.keys(grouped).forEach((key) => {
    grouped[key].sort(
      (a, b) =>
        new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
    );
  });

  return grouped;
};

// Get status badge with appropriate styling
const getStatusVariant = (status: ClassStatus) => {
  switch (status) {
    case ClassStatus.SCHEDULED:
      return "primary";
    case ClassStatus.COMPLETED:
      return "success";
    case ClassStatus.CANCELED_TEACHER_MAKEUP:
      return "warning";
    default:
      return "danger";
  }
};

const getStatusBadge = (cls: StudentClass) => {
  return (
    <>
      <Badge variant={getStatusVariant(cls.status)} className="capitalize">
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

export default function UserClassesTab({ classes }: UserClassesTabProps) {
  const router = useRouter();
  const yearOptions = useMemo(() => generateYearOptions(), []);

  // Estados para controlar os filtros selecionados
  const [selectedMonth, setSelectedMonth] = useState<number | "all">("all");
  const [selectedYear, setSelectedYear] = useState<number | "all">("all");

  // Group classes by month/year
  const groupedClasses = useMemo(
    () => groupClassesByMonth(classes || []),
    [classes]
  );

  // Filter classes based on selected month and year
  const filteredClasses = useMemo(() => {
    if (!classes) return [];

    return classes.filter((cls) => {
      const classDate = new Date(cls.scheduledAt);

      const monthMatch =
        selectedMonth === "all" || classDate.getMonth() === selectedMonth;
      const yearMatch =
        selectedYear === "all" || classDate.getFullYear() === selectedYear;

      return monthMatch && yearMatch;
    });
  }, [classes, selectedMonth, selectedYear]);

  // Get sorted group keys (year-month combinations)
  const sortedGroupKeys = useMemo(() => {
    return Object.keys(groupedClasses).sort((a, b) => {
      const [yearA, monthA] = a.split("-").map(Number);
      const [yearB, monthB] = b.split("-").map(Number);

      if (yearA !== yearB) {
        return yearB - yearA; // Sort by year descending
      }
      return monthB - monthA; // Sort by month descending
    });
  }, [groupedClasses]);

  if (!classes || classes.length === 0) {
    return <Text>Este utilizador não tem nenhuma aula agendada.</Text>;
  }

  return (
    <div className="space-y-6">
      {/* --- Barra de Filtros --- */}
      <div className="flex flex-col md:flex-row gap-4">
        <Select
          value={String(selectedMonth)}
          onValueChange={(val) =>
            setSelectedMonth(val === "all" ? "all" : Number(val))
          }
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filtrar por Mês" />
          </SelectTrigger>
          <SelectContent>
            <SelectOption value="all">Todos os Meses</SelectOption>
            {monthOptions.map((month) => (
              <SelectOption key={month.value} value={String(month.value)}>
                {month.label}
              </SelectOption>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={String(selectedYear)}
          onValueChange={(val) =>
            setSelectedYear(val === "all" ? "all" : Number(val))
          }
        >
          <SelectTrigger className="w-full md:w-[120px]">
            <SelectValue placeholder="Filtrar por Ano" />
          </SelectTrigger>
          <SelectContent>
            <SelectOption value="all">Todos os Anos</SelectOption>
            {yearOptions.map((year) => (
              <SelectOption key={year} value={String(year)}>
                {year}
              </SelectOption>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* --- Classes organized by month --- */}
      {selectedMonth === "all" && selectedYear === "all" ? (
        sortedGroupKeys.length > 0 ? (
          sortedGroupKeys.map((key) => {
            const [year, month] = key.split("-").map(Number);
            const monthClasses = groupedClasses[key];
            const monthLabel = monthOptions[month]?.label;

            return (
              <div key={key} className="space-y-3">
                <Text size="lg" weight="bold" className="border-b pb-2">
                  {monthLabel} {year}
                </Text>
                <div className="space-y-4">
                  {monthClasses.map((cls, index) => {
                    const classDate = new Date(cls.scheduledAt);
                    const formattedDate = classDate.toLocaleDateString(
                      "pt-BR",
                      {
                        weekday: "long",
                        day: "2-digit",
                        month: "long",
                      }
                    );
                    const formattedTime = classDate.toLocaleTimeString(
                      "pt-BR",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    );

                    return (
                      <Card
                        key={`${cls.id}-${cls.scheduledAt}-${index}`}
                        className="p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start space-x-4">
                            <div>
                              <p className="font-bold text-lg">
                                {formattedDate}
                              </p>
                              <p className="text-sm text-subtitle">
                                {formattedTime}
                              </p>
                              {cls.notes && (
                                <p className="text-sm mt-2 italic text-subtitle">
                                  {cls.notes}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(cls)}
                          </div>
                        </div>
                        <div className="flex justify-end mt-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              router.push(`/hub/plataforma/class/${cls.id}`)
                            }
                          >
                            Ver Aula
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })
        ) : (
          <Text>Nenhuma aula encontrada.</Text>
        )
      ) : (
        /* --- Filtered view --- */
        <div className="space-y-4">
          {filteredClasses.length > 0 ? (
            filteredClasses.map((cls, index) => {
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

              return (
                <Card
                  key={`${cls.id}-${cls.scheduledAt}-${index}`}
                  className="p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start space-x-4">
                      <div>
                        <p className="font-bold text-lg">{formattedDate}</p>
                        <p className="text-sm text-subtitle">{formattedTime}</p>
                        {cls.notes && (
                          <p className="text-sm mt-2 italic text-subtitle">
                            {cls.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(cls)}
                    </div>
                  </div>
                  <div className="flex justify-end mt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        router.push(`/hub/plataforma/class/${cls.id}`)
                      }
                    >
                      Ver Aula
                    </Button>
                  </div>
                </Card>
              );
            })
          ) : (
            <Text>Nenhuma aula encontrada para o período selecionado.</Text>
          )}
        </div>
      )}
    </div>
  );
}
