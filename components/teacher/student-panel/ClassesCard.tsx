"use client";

import React, { useState, useEffect } from "react";
import { ClassStatus, StudentClass } from "@/types/classes/class";
import { SubContainer } from "@/components/ui/SubContainer";
import {
  Select,
  SelectContent,
  SelectOption,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { NoResults } from "@/components/ui/NoResults/NoResults";

// Skeleton component for class items
const ClassSkeleton = () => (
  <div className="rounded-lg p-4 border border-container/50 bg-container/80 animate-pulse">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
      <div>
        <div className="h-5 bg-input/40 dark:bg-input/80 rounded w-32 mb-2"></div>
        <div className="h-4 bg-input/40 dark:bg-input/80 rounded w-20 mb-2"></div>
        <div className="h-5 w-24 bg-input/40 dark:bg-input/80 rounded"></div>
      </div>
      <div className="h-8 w-40 bg-input/40 dark:bg-input/80 rounded"></div>
    </div>
  </div>
);

interface ClassesCardProps {
  classes: StudentClass[];
  onUpdateClassStatus: (
    classId: string,
    newStatus: ClassStatus
  ) => Promise<void>;
  onFetchClasses: (month: number, year: number) => Promise<void>;
  loading?: boolean; // Added loading prop
}

export default function ClassesCard({
  classes,
  onUpdateClassStatus,
  onFetchClasses,
  loading = false, // Default to false
}: ClassesCardProps) {
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth()
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );

  // Filter classes by selected month and year
  const filteredClasses = classes.filter((cls) => {
    const classDate = new Date(cls.scheduledAt);
    return (
      classDate.getMonth() === selectedMonth &&
      classDate.getFullYear() === selectedYear
    );
  });

  // When month/year changes, fetch classes for that period
  useEffect(() => {
    onFetchClasses(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear, onFetchClasses]);

  // Handle updating class status
  const handleUpdateClassStatus = async (
    classId: string,
    newStatus: ClassStatus
  ) => {
    await onUpdateClassStatus(classId, newStatus);
    // Refresh classes to ensure UI is up to date
    onFetchClasses(selectedMonth, selectedYear);
  };

  const getStatusDisplay = (status: ClassStatus) => {
    const statusMap: Record<ClassStatus, { label: string; className: string }> =
      {
        [ClassStatus.SCHEDULED]: {
          label: "Agendada",
          className:
            "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
        },
        [ClassStatus.COMPLETED]: {
          label: "Concluída",
          className:
            "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        },
        [ClassStatus.CANCELED_STUDENT]: {
          label: "Cancelada (Aluno)",
          className:
            "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        },
        [ClassStatus.CANCELED_TEACHER]: {
          label: "Cancelada (Professor)",
          className:
            "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        },
        [ClassStatus.CANCELED_TEACHER_MAKEUP]: {
          label: "Cancelada (Prof. + Reposição)",
          className:
            "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        },
        [ClassStatus.CANCELED_CREDIT]: {
          label: "Cancelada (Crédito)",
          className:
            "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        },
        [ClassStatus.NO_SHOW]: {
          label: "Falta",
          className:
            "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        },
        [ClassStatus.RESCHEDULED]: {
          label: "Reagendada",
          className:
            "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
        },
        [ClassStatus.TEACHER_VACATION]: {
          label: "Férias Professor",
          className:
            "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
        },
        [ClassStatus.OVERDUE]: {
          label: "Atrasada",
          className:
            "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
        },
      };

    return (
      statusMap[status] || {
        label: "Outro",
        className:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      }
    );
  };

  // Status options for the select dropdown
  const statusOptions: { value: ClassStatus; label: string }[] = [
    { value: ClassStatus.SCHEDULED, label: "Agendada" },
    { value: ClassStatus.COMPLETED, label: "Concluída" },
    { value: ClassStatus.CANCELED_STUDENT, label: "Cancelada (Aluno)" },
    { value: ClassStatus.CANCELED_TEACHER, label: "Cancelada (Professor)" },
    {
      value: ClassStatus.CANCELED_TEACHER_MAKEUP,
      label: "Cancelada (Prof. + Reposição)",
    },
    { value: ClassStatus.CANCELED_CREDIT, label: "Cancelada (Crédito)" },
    { value: ClassStatus.NO_SHOW, label: "Falta" },
    { value: ClassStatus.RESCHEDULED, label: "Reagendada" },
    { value: ClassStatus.TEACHER_VACATION, label: "Férias Professor" },
    { value: ClassStatus.OVERDUE, label: "Atrasada" },
  ];

  return (
    <SubContainer>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-bold text-title">Aulas</h2>

        <div className="flex flex-row gap-2 w-full sm:w-auto">
          <Select
            value={selectedMonth.toString()}
            onValueChange={(value) => setSelectedMonth(parseInt(value))}
          >
            <SelectTrigger className="w-full sm:w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => (
                <SelectOption key={i} value={i.toString()}>
                  {new Date(0, i).toLocaleString("pt-BR", { month: "short" })}
                </SelectOption>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedYear.toString()}
            onValueChange={(value) => setSelectedYear(parseInt(value))}
          >
            <SelectTrigger className="w-full sm:w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - 2 + i;
                return (
                  <SelectOption key={year} value={year.toString()}>
                    {year}
                  </SelectOption>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {loading ? (
          // Render skeleton loaders when loading
          Array.from({ length: 3 }).map((_, index) => (
            <ClassSkeleton key={index} />
          ))
        ) : filteredClasses.length > 0 ? (
          filteredClasses.map((cls) => {
            const statusDisplay = getStatusDisplay(cls.status);
            return (
              <div
                key={cls.id}
                className="rounded-lg p-4 border border-container/50 bg-container/80"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="font-medium text-title">
                      {new Date(cls.scheduledAt).toLocaleDateString("pt-BR", {
                        weekday: "short",
                        day: "2-digit",
                        month: "short",
                      })}
                    </div>
                    <div className="text-sm text-paragraph opacity-70 mb-1">
                      {new Date(cls.scheduledAt).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${statusDisplay.className}`}
                    >
                      {statusDisplay.label}
                    </span>
                  </div>

                  <div className="flex flex-row sm:flex-col gap-2 sm:gap-0 items-center sm:items-end">
                    <Select
                      value={cls.status}
                      onValueChange={(value) =>
                        handleUpdateClassStatus(cls.id, value as ClassStatus)
                      }
                    >
                      <SelectTrigger className="w-[160px] sm:w-[140px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectOption key={option.value} value={option.value}>
                            {option.label}
                          </SelectOption>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <NoResults
            customMessage={{
              withoutSearch: "Nenhuma aula encontrada",
            }}
            className="p-8"
          />
        )}
      </div>
    </SubContainer>
  );
}
