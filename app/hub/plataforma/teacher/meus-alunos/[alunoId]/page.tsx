"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useStudentPanel } from "@/hooks/useStudentPanel";
import { ClassStatus } from "@/types/classes/class";
import TasksCard from "@/components/teacher/student-panel/TasksCard";
import NotebooksCard from "@/components/teacher/student-panel/NotebooksCard";

export default function AlunoPainel() {
  const { alunoId } = useParams();
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth()
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );

  const {
    student,
    notebooks,
    tasks,
    classes,
    loading,
    error,
    fetchClasses,
    addTask: addTaskAction,
    createNotebook: createNotebookAction,
    updateClassStatus,
    updateTask: updateTaskAction,
    deleteTask: deleteTaskAction,
    deleteAllTasks: deleteAllTasksAction,
  } = useStudentPanel(alunoId as string);

  // Filter classes by selected month and year
  const filteredClasses = classes.filter((cls) => {
    const classDate = new Date(cls.scheduledAt);
    return (
      classDate.getMonth() === selectedMonth &&
      classDate.getFullYear() === selectedYear
    );
  });

  // Handle updating class status
  const handleUpdateClassStatus = async (
    classId: string,
    newStatus: ClassStatus
  ) => {
    const success = await updateClassStatus(classId, newStatus);
    if (success) {
      // Refresh classes to ensure UI is up to date
      fetchClasses(selectedMonth, selectedYear);
    }
  };

  // When month/year changes, fetch classes for that period
  React.useEffect(() => {
    if (alunoId) {
      fetchClasses(selectedMonth, selectedYear);
    }
  }, [selectedMonth, selectedYear, alunoId, fetchClasses]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fluency-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Erro! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in fade-out p-2 h-max md:h-max lg:h-[92vh] min-w-screen overflow-hidden">
      <div className="grid grid-cols-12 gap-4 h-full">
        {/* Card 1: Notebooks (full height, left) */}
        <div className="col-span-12 md:col-span-6 lg:col-span-6 h-full flex flex-col">
          <NotebooksCard
            student={student}
            notebooks={notebooks}
            onCreateNotebook={createNotebookAction}
          />
        </div>

        {/* Card 2: Tasks (80% height, middle) */}
        <div className="col-span-12 md:col-span-6 lg:col-span-3 h-[80%]">
          <TasksCard
            tasks={tasks}
            onAddTask={addTaskAction}
            onUpdateTask={updateTaskAction}
            onDeleteTask={deleteTaskAction}
            onDeleteAllTasks={deleteAllTasksAction}
          />
        </div>

        {/* Card 3: Sub-cards (20% height, bottom middle) */}
        <div className="col-span-12 md:col-span-6 lg:col-span-3 h-[20%]">
          <div className="grid grid-cols-3 gap-2 h-full">
            {/* Achievements Card */}
            <div className="bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-lg p-2 flex flex-col items-center justify-center">
              <div className="text-2xl mb-1">🏆</div>
              <div className="text-xs font-medium text-center">Conquistas</div>
            </div>

            {/* Placement Card */}
            <div className="bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-lg p-2 flex flex-col items-center justify-center">
              <div className="text-2xl mb-1">📊</div>
              <div className="text-xs font-medium text-center">Nivelamento</div>
            </div>

            {/* Report Card */}
            <div className="bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-lg p-2 flex flex-col items-center justify-center">
              <div className="text-2xl mb-1">📈</div>
              <div className="text-xs font-medium text-center">Relatório</div>
            </div>
          </div>
        </div>

        {/* Card 4: Classes (full height, right) */}
        <div className="col-span-12 md:col-span-12 lg:col-span-3 h-full">
          <div className="bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-lg p-4 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Aulas</h2>

              <div className="flex space-x-2">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="bg-fluency-gray-100 dark:bg-fluency-gray-800 border border-fluency-gray-200 dark:border-fluency-gray-700 rounded px-2 py-1 text-sm"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i} value={i}>
                      {new Date(0, i).toLocaleString("pt-BR", {
                        month: "short",
                      })}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="bg-fluency-gray-100 dark:bg-fluency-gray-800 border border-fluency-gray-200 dark:border-fluency-gray-700 rounded px-2 py-1 text-sm"
                >
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - 2 + i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="space-y-3">
                {filteredClasses.length > 0 ? (
                  filteredClasses.map((cls) => (
                    <div
                      key={cls.id}
                      className="bg-fluency-gray-100 dark:bg-fluency-gray-800 rounded-lg p-3 border border-fluency-gray-200 dark:border-fluency-gray-700"
                    >
                      <div className="font-medium">
                        {new Date(cls.scheduledAt).toLocaleDateString("pt-BR", {
                          weekday: "short",
                          day: "2-digit",
                          month: "short",
                        })}
                      </div>
                      <div className="text-sm text-fluency-gray-600 dark:text-fluency-gray-300">
                        {new Date(cls.scheduledAt).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <div className="text-sm mt-1">
                        {/* Use teacherId to fetch teacher name if needed, or display a default */}
                        Professor - {cls.language}
                      </div>
                      <div className="text-xs mt-1 flex justify-between items-center">
                        <span
                          className={`px-2 py-1 rounded-full ${
                            cls.status === "scheduled"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                              : cls.status === "completed"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : cls.status.includes("canceled") ||
                                    cls.status === "no-show"
                                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                  : cls.status === "rescheduled"
                                    ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                                    : cls.status === "teacher-vacation"
                                      ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                                      : cls.status === "overdue"
                                        ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                          }`}
                        >
                          {cls.status === "scheduled"
                            ? "Agendada"
                            : cls.status === "completed"
                              ? "Concluída"
                              : cls.status === "canceled-student"
                                ? "Cancelada (Aluno)"
                                : cls.status === "canceled-teacher"
                                  ? "Cancelada (Professor)"
                                  : cls.status === "canceled-teacher-makeup"
                                    ? "Cancelada (Prof. + Reposição)"
                                    : cls.status === "canceled-credit"
                                      ? "Cancelada (Crédito)"
                                      : cls.status === "no-show"
                                        ? "Falta"
                                        : cls.status === "rescheduled"
                                          ? "Reagendada"
                                          : cls.status === "teacher-vacation"
                                            ? "Férias Professor"
                                            : cls.status === "overdue"
                                              ? "Atrasada"
                                              : "Outro"}
                        </span>

                        {/* Status update dropdown for teachers */}
                        <select
                          value={cls.status}
                          onChange={(e) =>
                            handleUpdateClassStatus(
                              cls.id,
                              e.target.value as ClassStatus
                            )
                          }
                          className="bg-fluency-gray-200 dark:bg-fluency-gray-700 border border-fluency-gray-300 dark:border-fluency-gray-600 rounded px-2 py-1 text-xs"
                        >
                          <option value="scheduled">Agendada</option>
                          <option value="completed">Concluída</option>
                          <option value="canceled-student">
                            Cancelada (Aluno)
                          </option>
                          <option value="canceled-teacher">
                            Cancelada (Professor)
                          </option>
                          <option value="canceled-teacher-makeup">
                            Cancelada (Prof. + Reposição)
                          </option>
                          <option value="canceled-credit">
                            Cancelada (Crédito)
                          </option>
                          <option value="no-show">Falta</option>
                          <option value="rescheduled">Reagendada</option>
                          <option value="teacher-vacation">
                            Férias Professor
                          </option>
                          <option value="overdue">Atrasada</option>
                        </select>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-fluency-gray-500">
                    Nenhuma aula encontrada
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
