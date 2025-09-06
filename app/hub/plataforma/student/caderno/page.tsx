"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useStudentPanel } from "@/hooks/useStudentPanel";
import { ClassStatus, StudentClass } from "@/types/classes/class";
import NotebooksCard from "@/components/teacher/student-panel/NotebooksCard";
import TasksCard from "@/components/teacher/student-panel/TasksCard";
import ClassesCard from "@/components/teacher/student-panel/ClassesCard";
import { Container } from "@/components/ui/Container";
import { SubContainer } from "@/components/ui/SubContainer";
import SkeletonLoader from "@/components/shared/Skeleton/SkeletonLoader";

interface Notebook {
  studentName: string;
  id: string;
  title: string;
  description: string;
  createdAt: any;
  student: string;
  content: any;
}

// Skeleton component for the student panel
const StudentPanelSkeleton = () => (
  <Container className="flex flex-col sm:flex-row gap-4">
    <div className="w-full sm:w-fit h-[50vh] sm:h-full flex flex-col gap-2">
      {/* Notebooks card skeleton */}
      <SubContainer className="min-h-[300px]">
        <div className="flex flex-col gap-3">
          {/* Search bar skeleton */}
          <SkeletonLoader variant="rect" className="h-10 rounded-lg mb-4" />

          {/* Notebook items skeletons */}
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="flex flex-row items-start justify-between rounded-lg overflow-hidden border border-container/50 p-4 bg-container/80"
            >
              <div className="flex-1 space-y-2">
                <SkeletonLoader
                  variant="text"
                  lines={1}
                  className="h-5 rounded w-3/4"
                />
                <SkeletonLoader
                  variant="text"
                  lines={1}
                  className="h-3 rounded w-1/2"
                />
              </div>
              <SkeletonLoader variant="circle" className="h-5 w-5 rounded" />
            </div>
          ))}
        </div>
      </SubContainer>
    </div>

    {/* Tasks card skeleton */}
    <SubContainer className="min-h-[300px] sm:min-w-[300px] flex-1">
      <div className="flex flex-col gap-3">
        {/* Header with progress bar skeleton */}
        <div className="flex justify-between items-center mb-2">
          <SkeletonLoader
            variant="text"
            lines={1}
            className="h-6 rounded w-1/4"
          />
          <SkeletonLoader
            variant="text"
            lines={1}
            className="h-6 rounded w-10"
          />
        </div>
        <SkeletonLoader
          variant="text"
          lines={1}
          className="h-4 rounded w-full mb-4"
        />

        {/* Task input skeleton */}
        <SkeletonLoader variant="rect" className="h-12 rounded-lg mb-4" />

        {/* Task items skeletons */}
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 rounded-lg border border-container/50 bg-container/80"
          >
            <div className="flex items-center space-x-3">
              <SkeletonLoader variant="circle" className="h-5 w-5 rounded" />
              <SkeletonLoader
                variant="text"
                lines={1}
                className="h-5 rounded w-32"
              />
            </div>
            <div className="flex space-x-2">
              <SkeletonLoader variant="circle" className="h-5 w-5 rounded" />
              <SkeletonLoader variant="circle" className="h-5 w-5 rounded" />
            </div>
          </div>
        ))}
      </div>
    </SubContainer>

    {/* Classes card skeleton */}
    <SubContainer className="min-h-[300px] sm:min-w-[300px] flex-1">
      <div className="flex flex-col gap-3">
        {/* Month/year selector skeleton */}
        <div className="flex gap-2 mb-4">
          <SkeletonLoader variant="rect" className="h-10 rounded-lg flex-1" />
          <SkeletonLoader variant="rect" className="h-10 rounded-lg flex-1" />
        </div>

        {/* Class items skeletons */}
        {[...Array(2)].map((_, index) => (
          <div
            key={index}
            className="rounded-lg p-3 sm:p-4 border border-container/50 bg-container/80"
          >
            <div className="flex flex-col gap-3">
              <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2">
                <div className="flex-1 space-y-2">
                  <SkeletonLoader
                    variant="text"
                    lines={1}
                    className="h-5 rounded w-24 xs:w-32"
                  />
                  <SkeletonLoader
                    variant="text"
                    lines={1}
                    className="h-4 rounded w-16 xs:w-20"
                  />
                  <SkeletonLoader
                    variant="text"
                    lines={1}
                    className="h-5 w-20 xs:w-24 rounded"
                  />
                </div>
                <SkeletonLoader
                  variant="rect"
                  className="h-8 w-full xs:w-32 sm:w-40 rounded"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </SubContainer>
  </Container>
);

// Add the Google Calendar sync functionality
const useGoogleCalendarSync = (studentId: string) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const syncWithGoogleCalendar = async () => {
    if (!studentId || isSyncing) return;

    setIsSyncing(true);
    setError(null);

    try {
      // Call the Google Calendar sync API
      const response = await fetch(`/api/student/google-calendar/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to sync with Google Calendar"
        );
      }

      // Show success message
      alert("Tarefas sincronizadas com sucesso com o Google Calendar!");
    } catch (err: any) {
      console.error("Error syncing with Google Calendar:", err);
      setError(err.message || "Failed to sync with Google Calendar");
      alert(
        "Erro ao sincronizar com o Google Calendar: " +
          (err.message || "Erro desconhecido")
      );
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    isSyncing,
    error,
    syncWithGoogleCalendar,
  };
};

export default function Caderno() {
  const { data: session } = useSession();
  const studentId = session?.user?.id;

  const {
    student,
    notebooks,
    tasks,
    classes,
    loading,
    error,
    fetchClasses,
    updateClassStatus,
    updateTask,
  } = useStudentPanel(studentId as string);

  // Add Google Calendar sync hook
  const { isSyncing: isSyncingWithGoogleCalendar, syncWithGoogleCalendar } =
    useGoogleCalendarSync(studentId as string);

  // Debug: Log tasks to see if they're being fetched
  React.useEffect(() => {
    console.log("Tasks:", tasks);
  }, [tasks]);

  // Handle updating class status - simplified for students
  const handleUpdateClassStatus = async (
    classId: string,
    newStatus: ClassStatus
  ) => {
    // For students, only allow canceling classes
    if (newStatus === ClassStatus.CANCELED_STUDENT) {
      const success = await updateClassStatus(classId, newStatus);
      if (success) {
        // Refresh classes to ensure UI is up to date
        fetchClasses(new Date().getMonth(), new Date().getFullYear());
      }
    }
  };

  if (
    loading &&
    !student &&
    notebooks.length === 0 &&
    tasks.length === 0 &&
    classes.length === 0
  ) {
    return <StudentPanelSkeleton />;
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
      <Container className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-fit h-[50vh] sm:h-full flex flex-col gap-2">
          <NotebooksCard
            student={student}
            notebooks={notebooks}
            onCreateNotebook={async () => false} // Students cannot create notebooks
            userRole="student"
            onAddTask={undefined} // Students cannot add notebooks as tasks
            loading={loading}
          />
        </div>

        <TasksCard
          tasks={tasks}
          onAddTask={undefined} // Students cannot add tasks
          onUpdateTask={updateTask}
          onDeleteTask={undefined} // Students cannot delete tasks
          onDeleteAllTasks={undefined} // Students cannot delete all tasks
          onSyncWithGoogleCalendar={syncWithGoogleCalendar} // Add Google Calendar sync function
          isSyncingWithGoogleCalendar={isSyncingWithGoogleCalendar} // Add syncing state
        />

        <ClassesCard
          classes={classes}
          onUpdateClassStatus={handleUpdateClassStatus}
          onUpdateClassFeedback={undefined} // Students cannot update feedback
          onFetchClasses={fetchClasses}
          loading={loading}
          userRole="student" // Pass userRole prop
        />
      </Container>
    </div>
  );
}
