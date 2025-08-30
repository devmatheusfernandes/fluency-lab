"use client";
import { useEffect, useState, useMemo } from "react";
import { useStudent } from "@/hooks/useStudent";
import { Text } from "@/components/ui/Text";
import { Card } from "@/components/ui/Card";
import {
  Select,
  SelectContent,
  SelectOption,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import StudentClassCard from "@/components/student/StudentClassCard";
import { toast } from "sonner";

// Helper functions for date filtering
const monthOptions = Array.from({ length: 12 }, (_, i) => ({
  value: i,
  label: new Date(0, i).toLocaleString("pt-BR", { month: "long" }),
}));

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

// A página principal
export default function StudentMyClassesPage() {
  const {
    myClasses,
    rescheduleInfo,
    isLoading,
    fetchMyClasses,
    checkRescheduleStatus,
    getUserMonthlyReschedules,
  } = useStudent();

  // Filter states
  const [selectedMonth, setSelectedMonth] = useState<number | "all">(
    new Date().getMonth()
  );
  const [selectedYear, setSelectedYear] = useState<number | "all">(
    new Date().getFullYear()
  );
  const [monthlyRescheduleData, setMonthlyRescheduleData] = useState<{
    month: string;
    count: number;
    limit: number;
  } | null>(null);

  useEffect(() => {
    fetchMyClasses();
    checkRescheduleStatus();
  }, [fetchMyClasses, checkRescheduleStatus]);

  // Update monthly reschedule data when month/year changes
  useEffect(() => {
    if (
      getUserMonthlyReschedules &&
      selectedMonth !== "all" &&
      selectedYear !== "all"
    ) {
      const monthStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}`;
      getUserMonthlyReschedules(monthStr).then((data) => {
        setMonthlyRescheduleData(data);
      });
    } else {
      setMonthlyRescheduleData(null);
    }
  }, [selectedMonth, selectedYear, getUserMonthlyReschedules]);

  // Filter classes based on selected month and year
  const filteredClasses = useMemo(() => {
    if (!myClasses) return [];

    return myClasses.filter((cls) => {
      const classDate = new Date(cls.scheduledAt);

      const monthMatch =
        selectedMonth === "all" || classDate.getMonth() === selectedMonth;
      const yearMatch =
        selectedYear === "all" || classDate.getFullYear() === selectedYear;

      return monthMatch && yearMatch;
    });
  }, [myClasses, selectedMonth, selectedYear]);

  // Get reschedule info to display
  const displayRescheduleInfo = monthlyRescheduleData || rescheduleInfo;
  const isCurrentMonth =
    selectedMonth === new Date().getMonth() &&
    selectedYear === new Date().getFullYear();

  // Handle class cancellation with reschedule suggestion
  const handleCancelClass = async (classId: string) => {
    try {
      const response = await fetch("/api/student/classes/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ classId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao cancelar aula");
      }

      if (result.success) {
        if (result.suggestReschedule) {
          // Show reschedule suggestion
          toast.info(
            `Você ainda tem ${result.rescheduleInfo.remaining} reagendamentos disponíveis este mês. Que tal reagendar esta aula ao invés de cancelar?`,
            {
              duration: 8000,
              action: {
                label: "OK",
                onClick: () => {},
              },
            }
          );
        } else {
          toast.success("Aula cancelada com sucesso!");
        }

        // Refresh the classes list and reschedule info
        await fetchMyClasses();
        await checkRescheduleStatus();
      }
    } catch (error: any) {
      throw error; // Re-throw to be handled by the component
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">As Minhas Aulas</h1>
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-surface-0/30">
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

        {/* Enhanced Reschedule Card */}
        <Card className="p-3">
          <Text size="sm" className="font-medium text-subtitle mb-1">
            {selectedMonth === "all" || selectedYear === "all"
              ? "Reagendamentos (mês atual)"
              : `Reagendamentos em ${monthOptions[selectedMonth as number]?.label} ${selectedYear}`}
          </Text>
          <Text className="font-bold text-lg">
            {displayRescheduleInfo.count} / {displayRescheduleInfo.limit}
          </Text>
          {!isCurrentMonth &&
            selectedMonth !== "all" &&
            selectedYear !== "all" && (
              <Text size="xs" className="text-subtitle mt-1">
                Histórico do mês selecionado
              </Text>
            )}
        </Card>
      </div>

      {isLoading && myClasses.length === 0 && (
        <Text>A carregar as suas aulas...</Text>
      )}

      {filteredClasses.length > 0 ? (
        <div className="space-y-4">
          <Text size="sm" className="text-subtitle">
            Exibindo {filteredClasses.length} aula
            {filteredClasses.length !== 1 ? "s" : ""}
            {selectedMonth !== "all" || selectedYear !== "all"
              ? ` filtrada${filteredClasses.length !== 1 ? "s" : ""} para ${
                  selectedMonth !== "all"
                    ? monthOptions[selectedMonth as number]?.label
                    : "todos os meses"
                } de ${selectedYear !== "all" ? selectedYear : "todos os anos"}`
              : " no total"}
          </Text>
          {filteredClasses.map((cls, index) => (
            <StudentClassCard
              key={`${cls.id}-${cls.scheduledAt}-${index}`}
              cls={cls}
              canReschedule={rescheduleInfo.allowed}
              onCancel={handleCancelClass}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          {!isLoading && (
            <Text>
              {selectedMonth === "all" && selectedYear === "all"
                ? "Você não tem nenhuma aula no seu cronograma."
                : `Nenhuma aula encontrada para ${
                    selectedMonth !== "all"
                      ? monthOptions[selectedMonth as number]?.label
                      : "todos os meses"
                  } de ${
                    selectedYear !== "all" ? selectedYear : "todos os anos"
                  }.`}
            </Text>
          )}
        </div>
      )}
    </div>
  );
}
