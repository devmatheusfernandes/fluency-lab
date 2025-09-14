"use client";
import React from "react";
import { useSession } from "next-auth/react";
import { useStudentPanel } from "@/hooks/useStudentPanel";
import { useGoogleCalendarSync } from "@/hooks/useGoogleCalendarSync";
import NotebooksCard from "@/components/teacher/student-panel/NotebooksCard";
import TasksCard from "@/components/teacher/student-panel/TasksCard";
import ErrorAlert from "@/components/ui/ErrorAlert";
import StudentPanelSkeleton from "@/components/shared/ProgressSkeletons/StudentPanelSkeleton";
import { MainContainer } from "@/components/ui/MainContainer";

export default function Caderno() {
  const { data: session } = useSession();
  const studentId = session?.user?.id;

  const { student, notebooks, tasks, loading, error, updateTask } =
    useStudentPanel(studentId as string);

  const { isSyncing: isSyncingWithGoogleCalendar, syncWithGoogleCalendar } =
    useGoogleCalendarSync(studentId as string);

  if (loading) {
    return <StudentPanelSkeleton />;
  }

  if (error) {
    return <ErrorAlert message={error} />;
  }

  return (
    <MainContainer className="flex flex-col sm:flex-row gap-4">
      <NotebooksCard
        student={student}
        notebooks={notebooks}
        onCreateNotebook={async () => false} // Students cannot create notebooks
        userRole="student"
        onAddTask={undefined} // Students cannot add notebooks as tasks
        loading={loading}
      />

      <TasksCard
        tasks={tasks}
        onAddTask={undefined} // Students cannot add tasks
        onUpdateTask={updateTask}
        onDeleteTask={undefined} // Students cannot delete tasks
        onDeleteAllTasks={undefined} // Students cannot delete all tasks
        onSyncWithGoogleCalendar={syncWithGoogleCalendar} // Add Google Calendar sync function
        isSyncingWithGoogleCalendar={isSyncingWithGoogleCalendar} // Add syncing state
      />
    </MainContainer>
  );
}
