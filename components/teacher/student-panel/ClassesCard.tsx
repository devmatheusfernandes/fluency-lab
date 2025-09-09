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
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
  ModalPrimaryButton,
  ModalClose,
  ModalSecondaryButton,
} from "@/components/ui/Modal";
import { TextArea } from "@/components/ui/TextArea";
import { ClockCircle, Document } from "@solar-icons/react/ssr";
import SkeletonLoader from "@/components/shared/Skeleton/SkeletonLoader";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { cloudcontrolspartner } from "googleapis/build/src/apis/cloudcontrolspartner";
import { ClassCancellationModal } from "@/components/student/ClassCancellationModal";

// Enhanced skeleton with modern shimmer effect
const ClassSkeleton = () => (
  <div className="group relative overflow-hidden rounded-xl p-4 lg:p-6 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-gray-200/20 dark:via-gray-400/10 to-transparent"></div>
    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-3">
          <SkeletonLoader
            variant="text"
            lines={1}
            className="h-3 rounded-full w-24"
          />
          <SkeletonLoader
            variant="text"
            lines={1}
            className="h-2 rounded-full w-16"
          />
        </div>
        <SkeletonLoader
          variant="text"
          lines={1}
          className="h-6 rounded-lg w-28"
        />
      </div>
      <div className="flex items-center gap-3">
        <SkeletonLoader variant="rect" className="h-9 w-36 rounded-lg" />
        <SkeletonLoader variant="circle" className="h-9 w-9" />
      </div>
    </div>
  </div>
);

interface ClassesCardProps {
  classes: StudentClass[]; // This should match the type from the hook
  onUpdateClassStatus: (
    classId: string,
    newStatus: ClassStatus
  ) => Promise<void>;
  onUpdateClassFeedback?: (classId: string, feedback: string) => Promise<void>;
  onFetchClasses: (month: number, year: number) => Promise<void>;
  loading?: boolean;
  userRole?: "teacher" | "student";
}

export default function ClassesCard({
  classes,
  onUpdateClassStatus,
  onUpdateClassFeedback,
  onFetchClasses,
  loading = false,
  userRole = "teacher",
}: ClassesCardProps) {
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth()
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [feedbackModal, setFeedbackModal] = useState<{
    open: boolean;
    classId: string | null;
    currentFeedback: string;
  }>({ open: false, classId: null, currentFeedback: "" });
  const [cancelModal, setCancelModal] = useState<{
    open: boolean;
    classId: string | null;
  }>({ open: false, classId: null });

  // New confirmation modals for teacher actions
  const [teacherCancelModal, setTeacherCancelModal] = useState<{
    open: boolean;
    classId: string | null;
  }>({ open: false, classId: null });

  const [noShowModal, setNoShowModal] = useState<{
    open: boolean;
    classId: string | null;
  }>({ open: false, classId: null });

  // Enhanced month names for better UX
  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  // Filter classes by selected month and year
  const filteredClasses = classes.filter((cls) => {
    const classDate = new Date(cls.scheduledAt);
    return (
      classDate.getMonth() === selectedMonth &&
      classDate.getFullYear() === selectedYear
    );
  });

  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const [classToCancel, setClassToCancel] = useState<StudentClass | null>(null);

  // When month/year changes, fetch classes for that period
  useEffect(() => {
    onFetchClasses(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear, onFetchClasses]);

  // Handle updating class status with optimistic updates
  const handleUpdateClassStatus = async (
    classId: string,
    newStatus: ClassStatus
  ) => {
    try {
      await onUpdateClassStatus(classId, newStatus);
      onFetchClasses(selectedMonth, selectedYear);
      console.log("Class status updated successfully.");
      toast.success("Aula atualizada");
    } catch (error) {
      console.error("Failed to update class status:", error);
      // Could add toast notification here
    }
  };

  // Handle updating class feedback
  const handleUpdateClassFeedback = async (
    classId: string,
    feedback: string
  ) => {
    try {
      // Check if onUpdateClassFeedback is defined before calling it
      if (onUpdateClassFeedback) {
        await onUpdateClassFeedback(classId, feedback);
      }
      onFetchClasses(selectedMonth, selectedYear);
      setFeedbackModal({ open: false, classId: null, currentFeedback: "" });
    } catch (err: any) {
      console.error("Failed to update feedback:", err);
    }
  };

  // Enhanced status configuration with modern styling
  const getStatusConfig = (status: ClassStatus) => {
    const statusMap: Record<
      ClassStatus,
      {
        label: string;
        className: string;
        icon: string;
        selectClassName: string;
      }
    > = {
      [ClassStatus.SCHEDULED]: {
        label: "Agendada",
        className:
          "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800",
        icon: "📅",
        selectClassName:
          "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800",
      },
      [ClassStatus.COMPLETED]: {
        label: "Concluída",
        className:
          "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-300 dark:border-green-800",
        icon: "✅",
        selectClassName:
          "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-300 dark:border-green-800",
      },
      [ClassStatus.CANCELED_STUDENT]: {
        label: "Aluno cancelou",
        className:
          "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800",
        icon: "❌",
        selectClassName:
          "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800",
      },
      [ClassStatus.CANCELED_TEACHER]: {
        label: "Cancelada (Professor)",
        className:
          "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800",
        icon: "❌",
        selectClassName:
          "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800",
      },
      [ClassStatus.CANCELED_TEACHER_MAKEUP]: {
        label: "Cancelada (Prof. + Reposição)",
        className:
          "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800",
        icon: "🔄",
        selectClassName:
          "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800",
      },
      [ClassStatus.CANCELED_CREDIT]: {
        label: "Cancelada (Crédito)",
        className:
          "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800",
        icon: "💳",
        selectClassName:
          "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800",
      },
      [ClassStatus.NO_SHOW]: {
        label: "Falta",
        className:
          "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800",
        icon: "👤",
        selectClassName:
          "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800",
      },
      [ClassStatus.RESCHEDULED]: {
        label: "Reagendada",
        className:
          "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-800",
        icon: "📅",
        selectClassName:
          "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-800",
      },
      [ClassStatus.TEACHER_VACATION]: {
        label: "Minhas férias",
        className:
          "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800",
        icon: "🏖️",
        selectClassName:
          "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800",
      },
      [ClassStatus.OVERDUE]: {
        label: "Atrasada",
        className:
          "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
        icon: "⏰",
        selectClassName:
          "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
      },
    };

    return (
      statusMap[status] || {
        label: "Outro",
        className:
          "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/50 dark:text-gray-300 dark:border-gray-800",
        icon: "❓",
        selectClassName:
          "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/50 dark:text-gray-300 dark:border-gray-800",
      }
    );
  };

  // Teacher-specific status options (only the 3 main ones + current status if different)
  const getTeacherStatusOptions = (
    currentStatus: ClassStatus
  ): { value: ClassStatus; label: string }[] => {
    const mainOptions = [
      { value: ClassStatus.COMPLETED, label: "Concluída" },
      {
        value: ClassStatus.CANCELED_TEACHER_MAKEUP,
        label: "Eu cancelei",
      },
      { value: ClassStatus.NO_SHOW, label: "Aluno faltou" },
    ];

    // If current status is not one of the main options, add it to the list
    const isMainOption = mainOptions.some(
      (option) => option.value === currentStatus
    );
    if (!isMainOption) {
      const currentStatusConfig = getStatusConfig(currentStatus);
      return [
        { value: currentStatus, label: currentStatusConfig.label },
        ...mainOptions,
      ];
    }

    return mainOptions;
  };

  // Student-specific status options (only allow canceling by student)
  const studentStatusOptions: { value: ClassStatus; label: string }[] = [
    { value: ClassStatus.SCHEDULED, label: "Agendada" },
    { value: ClassStatus.CANCELED_STUDENT, label: "Cancelada (Aluno)" },
  ];

  // Handle status change with confirmation modals for teacher
  const handleStatusChange = (classId: string, newStatus: ClassStatus) => {
    if (userRole === "teacher") {
      if (newStatus === ClassStatus.CANCELED_TEACHER_MAKEUP) {
        setTeacherCancelModal({ open: true, classId });
        return;
      }
      if (newStatus === ClassStatus.NO_SHOW) {
        setNoShowModal({ open: true, classId });
        return;
      }
    }

    // For completed status or student actions, update directly
    handleUpdateClassStatus(classId, newStatus);
  };

  return (
    <SubContainer className="min-h-[60vh] lg:h-full">
      {classToCancel && (
        <ClassCancellationModal
          classData={classToCancel}
          isOpen={showCancellationModal}
          onClose={() => setShowCancellationModal(false)}
          onConfirm={() => {
            // Refresh classes to ensure UI is up to date
            if (onFetchClasses) {
              onFetchClasses(new Date().getMonth(), new Date().getFullYear());
            }
          }}
        />
      )}

      {/* Enhanced Feedback Modal - only for teachers */}
      {onUpdateClassFeedback && userRole === "teacher" && (
        <Modal
          open={feedbackModal.open}
          onOpenChange={(open) => {
            setFeedbackModal({ ...feedbackModal, open });
            if (!open) {
              setFeedbackModal({
                open: false,
                classId: null,
                currentFeedback: "",
              });
            }
          }}
        >
          <ModalContent className="max-w-2xl">
            <ModalHeader>
              <ModalTitle className="flex items-center gap-2">
                📝 Relatório da Aula
              </ModalTitle>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Adicione observações detalhadas sobre esta aula para registro
                  e acompanhamento do progresso do aluno.
                </p>
                <TextArea
                  value={feedbackModal.currentFeedback}
                  onChange={(e) =>
                    setFeedbackModal({
                      ...feedbackModal,
                      currentFeedback: e.target.value,
                    })
                  }
                  placeholder="Descreva o conteúdo abordado, desempenho do aluno, pontos de atenção, exercícios realizados..."
                />
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {feedbackModal.currentFeedback.length}/1000 caracteres
                </div>
              </div>
            </ModalBody>
            <ModalFooter className="flex gap-3">
              <ModalSecondaryButton
                onClick={() =>
                  setFeedbackModal({ ...feedbackModal, open: false })
                }
              >
                Cancelar
              </ModalSecondaryButton>
              <ModalPrimaryButton
                onClick={() => {
                  if (feedbackModal.classId) {
                    handleUpdateClassFeedback(
                      feedbackModal.classId,
                      feedbackModal.currentFeedback
                    );
                  }
                }}
              >
                Salvar Relatório
              </ModalPrimaryButton>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* Teacher Cancel Confirmation Modal */}
      {userRole === "teacher" && (
        <Modal
          open={teacherCancelModal.open}
          onOpenChange={(open) => {
            setTeacherCancelModal({ ...teacherCancelModal, open });
            if (!open) {
              setTeacherCancelModal({ open: false, classId: null });
            }
          }}
        >
          <ModalContent className="max-w-md">
            <ModalHeader>
              <ModalTitle className="flex items-center gap-2">
                🔄 Cancelar com Reposição
              </ModalTitle>
            </ModalHeader>
            <ModalBody>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Tem certeza que deseja cancelar esta aula? Esta ação irá marcar
                a aula como "Cancelada (Professor + Reposição)" e uma nova aula
                deverá ser agendada para repor esta.
              </p>
            </ModalBody>
            <ModalFooter className="flex gap-3">
              <ModalSecondaryButton
                onClick={() =>
                  setTeacherCancelModal({ ...teacherCancelModal, open: false })
                }
              >
                Voltar
              </ModalSecondaryButton>
              <ModalPrimaryButton
                onClick={async () => {
                  if (teacherCancelModal.classId) {
                    await handleUpdateClassStatus(
                      teacherCancelModal.classId,
                      ClassStatus.CANCELED_TEACHER_MAKEUP
                    );
                    setTeacherCancelModal({ open: false, classId: null });
                  }
                }}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Confirmar Cancelamento
              </ModalPrimaryButton>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* Teacher No Show Confirmation Modal */}
      {userRole === "teacher" && (
        <Modal
          open={noShowModal.open}
          onOpenChange={(open) => {
            setNoShowModal({ ...noShowModal, open });
            if (!open) {
              setNoShowModal({ open: false, classId: null });
            }
          }}
        >
          <ModalContent className="max-w-md">
            <ModalHeader>
              <ModalTitle className="flex items-center gap-2">
                👤 Marcar como Falta
              </ModalTitle>
            </ModalHeader>
            <ModalBody>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Tem certeza que deseja marcar esta aula como "Falta"? Esta ação
                indica que o aluno não compareceu à aula agendada.
              </p>
            </ModalBody>
            <ModalFooter className="flex gap-3">
              <ModalSecondaryButton
                onClick={() => setNoShowModal({ ...noShowModal, open: false })}
              >
                Voltar
              </ModalSecondaryButton>
              <ModalPrimaryButton
                onClick={async () => {
                  if (noShowModal.classId) {
                    await handleUpdateClassStatus(
                      noShowModal.classId,
                      ClassStatus.NO_SHOW
                    );
                    setNoShowModal({ open: false, classId: null });
                  }
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                Confirmar Falta
              </ModalPrimaryButton>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* Modern Header with Glass Effect */}
      <div className="border-b border-gray-200/50 dark:border-gray-700/50 py-4 mb-6">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 lg:flex gap-3">
            <Select
              value={selectedMonth.toString()}
              onValueChange={(value) => setSelectedMonth(parseInt(value))}
            >
              <SelectTrigger className="h-10 lg:w-44 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
                <SelectValue>{monthNames[selectedMonth]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {monthNames.map((month, index) => (
                  <SelectOption key={index} value={index.toString()}>
                    {month}
                  </SelectOption>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedYear.toString()}
              onValueChange={(value) => setSelectedYear(parseInt(value))}
            >
              <SelectTrigger>
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
      </div>

      {/* Enhanced Classes Grid */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <ClassSkeleton key={index} />
            ))}
          </div>
        ) : filteredClasses.length > 0 ? (
          <div className="space-y-2">
            {filteredClasses.map((cls) => {
              const statusConfig = getStatusConfig(cls.status);
              // Ensure we have a proper Date object
              const classDate = new Date(cls.scheduledAt);
              const today = new Date();

              // Compare dates by setting time to 00:00:00 for accurate day comparison
              const classDateWithoutTime = new Date(classDate);
              classDateWithoutTime.setHours(0, 0, 0, 0);

              const todayWithoutTime = new Date(today);
              todayWithoutTime.setHours(0, 0, 0, 0);

              const isToday =
                classDateWithoutTime.getTime() === todayWithoutTime.getTime();
              const isPast = classDateWithoutTime < todayWithoutTime;
              const isFuture = classDateWithoutTime > todayWithoutTime;

              return (
                <div
                  key={cls.id}
                  className={`group relative overflow-hidden rounded-xl p-3 border transition-all duration-200 card-base ${
                    isToday
                      ? "border-blue-300 dark:border-blue-600 bg-blue-50/30 dark:bg-blue-950/20"
                      : isPast
                        ? "border-gray-300 dark:border-gray-600 bg-gray-100/50 dark:bg-gray-800/50 opacity-80"
                        : "card-base"
                  } backdrop-blur-sm`}
                >
                  {isToday && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                  )}
                  {isPast && !isToday && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-primary"></div>
                  )}

                  <div className="flex flex-col lg:flex-row lg:items-center">
                    {/* Date Section */}
                    <div className="flex-1">
                      <div className="flex gap-1">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {classDate.toLocaleDateString("pt-BR", {
                            weekday: "short",
                            day: "2-digit",
                          })}
                          {isToday && (
                            <span className="text-sm text-indigo-500 dark:text-indigo-400 ml-1">
                              • Hoje
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          <span className="mr-1">às</span>
                          {classDate.toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Actions Section */}
                    <div className="flex flex-row gap-2">
                      {/* For teachers, show the status select and feedback button */}
                      {userRole === "teacher" && (
                        <>
                          <Select
                            value={cls.status}
                            onValueChange={(value) =>
                              handleStatusChange(cls.id, value as ClassStatus)
                            }
                            disabled={isPast}
                          >
                            <SelectTrigger
                              className={`w-full lg:w-48 h-10 text-sm bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors ${isPast ? "opacity-50 cursor-not-allowed" : ""} ${getStatusConfig(cls.status).selectClassName}`}
                            >
                              <div className="flex items-center gap-2">
                                <span>{statusConfig.icon}</span>
                                <SelectValue />
                              </div>
                            </SelectTrigger>
                            <SelectContent>
                              {getTeacherStatusOptions(cls.status).map(
                                (option) => (
                                  <SelectOption
                                    key={option.value}
                                    value={option.value}
                                    className={
                                      getStatusConfig(option.value)
                                        .selectClassName
                                    }
                                  >
                                    <div className="flex items-center gap-2">
                                      <span>{option.label}</span>
                                    </div>
                                  </SelectOption>
                                )
                              )}
                            </SelectContent>
                          </Select>

                          <button
                            onClick={() => {
                              setFeedbackModal({
                                open: true,
                                classId: cls.id,
                                currentFeedback: cls.feedback || "",
                              });
                            }}
                            className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 ${
                              cls.feedback
                                ? "bg-green-100 hover:bg-green-200 text-green-600 dark:bg-green-950/50 dark:hover:bg-green-900/50 dark:text-green-400"
                                : "bg-gray-100 hover:bg-gray-200 text-gray-500 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-400"
                            } ${isPast ? "opacity-50 cursor-not-allowed" : ""}`}
                            title={
                              cls.feedback
                                ? "Editar relatório"
                                : "Adicionar relatório"
                            }
                            disabled={isPast}
                          >
                            <Document
                              weight="BoldDuotone"
                              className="w-6 h-6"
                            />
                          </button>
                        </>
                      )}

                      {/* For students, show reschedule and cancel buttons for future classes */}
                      {userRole === "student" && (
                        <>
                          <button
                            className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-400 transition-all duration-200"
                            title="Reagendar aula"
                            disabled={true} // Disabled for now, will be implemented later
                          >
                            <span className="text-lg">🔄</span>
                          </button>

                          {userRole === "student" &&
                            cls.status === ClassStatus.SCHEDULED && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                onClick={() => {
                                  setClassToCancel(cls);
                                  setShowCancellationModal(true);
                                }}
                              >
                                <ClockCircle className="w-4 h-4 mr-2" />
                                Cancelar
                              </Button>
                            )}
                        </>
                      )}

                      {/* For students, show status badge for non-future classes (past and today) */}
                      {userRole === "student" && !isFuture && (
                        <div
                          className={`flex items-center justify-center w-32 h-10 rounded-xl text-sm font-medium ${statusConfig.className}`}
                        >
                          <span className="mr-2">{statusConfig.icon}</span>
                          <span>{statusConfig.label}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="text-6xl mb-4">📚</div>
            <NoResults
              customMessage={{
                withoutSearch: `Nenhuma aula encontrada em ${monthNames[selectedMonth]} de ${selectedYear}`,
              }}
              className="text-center"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Tente selecionar outro mês ou ano
            </p>
          </div>
        )}
      </div>
    </SubContainer>
  );
}
