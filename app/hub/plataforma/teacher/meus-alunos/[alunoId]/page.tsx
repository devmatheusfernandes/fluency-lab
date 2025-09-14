"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useStudentPanel } from "@/hooks/useStudentPanel";
import { ClassStatus } from "@/types/classes/class";
import TasksCard from "@/components/teacher/student-panel/TasksCard";
import NotebooksCard from "@/components/teacher/student-panel/NotebooksCard";
import ClassesCard from "@/components/teacher/student-panel/ClassesCard";
import { Container } from "@/components/ui/Container";
import { SubContainer } from "@/components/ui/SubContainer";
import { Card, CardContent } from "@/components/ui/Card";
import {
  Bookmark,
  Document,
  TestTubeMinimalistic,
} from "@solar-icons/react/ssr";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { useIsMobile } from "@/hooks/useIsMobile";
import SkeletonLoader from "@/components/shared/Skeleton/SkeletonLoader";
import ErrorAlert from "@/components/ui/ErrorAlert";
import { ContainerCard } from "@/components/ui/ContainerCard/ContainerCard";
import StudentInfoCard from "@/components/teacher/student-panel/StudentInfoCard";

// Skeleton component for the student panel
const StudentPanelSkeleton = () => (
  <Container className="flex flex-col sm:flex-row gap-2">
    <div className="w-full sm:w-fit h-full flex flex-col gap-2">
      <SubContainer className="skeleton-base flex flex-row items-center justify-start !py-6 gap-2">
        {/* Avatar skeleton */}
        <SkeletonLoader
          variant="avatar"
          size="lg"
          className="skeleton-sub w-16 h-16 rounded-xl"
        />

        {/* Action cards skeletons */}
        <div className="flex gap-2">
          {[...Array(3)].map((_, index) => (
            <SkeletonLoader
              key={index}
              variant="rect"
              className="skeleton-sub w-16 h-16 rounded-lg"
            />
          ))}
        </div>
      </SubContainer>

      {/* Notebooks card skeleton */}
      <SkeletonLoader
        variant="rect"
        className="skeleton-base rounded-xl p-4 min-h-[300px]"
      >
        <div className="flex flex-col gap-3">
          {/* Search bar skeleton */}
          <SkeletonLoader
            variant="rect"
            className="skeleton-sub h-10 rounded-lg mb-4"
          />

          {/* Notebook items skeletons */}
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="skeleton-sub p-2 flex flex-row items-start justify-between rounded-lg overflow-hidden"
            >
              <div className="flex-1 space-y-2">
                <SkeletonLoader
                  variant="text"
                  lines={1}
                  className="skeleton-base h-5 rounded w-3/4"
                />
                <SkeletonLoader
                  variant="text"
                  lines={1}
                  className="skeleton-base h-3 rounded w-1/2"
                />
              </div>
              <SkeletonLoader
                variant="circle"
                className="skeleton-base h-5 w-5 rounded"
              />
            </div>
          ))}
        </div>
      </SkeletonLoader>
    </div>

    {/* Tasks card skeleton */}
    <SkeletonLoader
      variant="rect"
      className="skeleton-base rounded-xl p-4 flex-1"
    >
      <div className="flex flex-col gap-3">
        {/* Header with progress bar skeleton */}
        <div className="flex justify-between items-center mb-2">
          <SkeletonLoader
            variant="text"
            lines={1}
            className="skeleton-sub h-6 rounded w-1/4"
          />
          <SkeletonLoader
            variant="text"
            lines={1}
            className="skeleton-sub h-6 rounded w-10"
          />
        </div>
        <SkeletonLoader
          variant="text"
          lines={1}
          className="skeleton-sub h-4 rounded w-full mb-4"
        />

        {/* Task input skeleton */}
        <SkeletonLoader
          variant="rect"
          className="skeleton-sub h-12 rounded-lg mb-4"
        />

        {/* Task items skeletons */}
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className="skeleton-sub flex items-center justify-between p-3 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <SkeletonLoader
                variant="circle"
                className="skeleton-base h-5 w-5 rounded"
              />
              <SkeletonLoader
                variant="text"
                lines={1}
                className="h-5 rounded w-32"
              />
            </div>
            <div className="flex space-x-2">
              <SkeletonLoader
                variant="circle"
                className="skeleton-sub h-5 w-5 rounded"
              />
              <SkeletonLoader
                variant="circle"
                className="skeleton-sub h-5 w-5 rounded"
              />
            </div>
          </div>
        ))}
      </div>
    </SkeletonLoader>

    {/* Classes card skeleton */}
    <SkeletonLoader
      variant="rect"
      className="skeleton-base rounded-xl p-4 flex-1"
    >
      <div className="flex flex-col gap-3">
        {/* Month/year selector skeleton */}
        <div className="flex gap-2 mb-4">
          <SkeletonLoader
            variant="rect"
            className="skeleton-sub h-10 rounded-lg flex-1"
          />
          <SkeletonLoader
            variant="rect"
            className="skeleton-sub h-10 rounded-lg flex-1"
          />
        </div>

        {/* Class items skeletons */}
        {[...Array(5)].map((_, index) => (
          <div key={index} className="skeleton-sub rounded-lg p-3 sm:p-4 ">
            <div className="flex flex-col gap-3">
              <div className="flex flex-row w-full justify-between gap-2">
                <div className="flex flex-col space-y-2">
                  <SkeletonLoader
                    variant="text"
                    lines={1}
                    className="skeleton-base h-5 rounded w-24"
                  />
                  <SkeletonLoader
                    variant="text"
                    lines={1}
                    className="skeleton-base h-4 rounded w-16"
                  />
                </div>
                <SkeletonLoader
                  variant="rect"
                  className="skeleton-base h-8 w-full xs:w-32 sm:w-40 rounded"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </SkeletonLoader>
  </Container>
);

export default function Aluno() {
  const { alunoId } = useParams();
  const { data: session } = useSession();
  const isMobile = useIsMobile();
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
    updateClassFeedback,
    updateTask: updateTaskAction,
    deleteTask: deleteTaskAction,
    deleteAllTasks: deleteAllTasksAction,
  } = useStudentPanel(alunoId as string);

  // Handle updating class status
  const handleUpdateClassStatus = async (
    classId: string,
    newStatus: ClassStatus
  ) => {
    const success = await updateClassStatus(classId, newStatus);
    if (success) {
      // Refresh classes to ensure UI is up to date
      fetchClasses(new Date().getMonth(), new Date().getFullYear());
    }
  };

  // Handle updating class feedback
  const handleUpdateClassFeedback = async (
    classId: string,
    feedback: string
  ) => {
    const success = await updateClassFeedback(classId, feedback);
    if (success) {
      // Refresh classes to ensure UI is up to date
      fetchClasses(new Date().getMonth(), new Date().getFullYear());
    }
  };

  if (loading) {
    return <StudentPanelSkeleton />;
  }

  if (error) {
    return <ErrorAlert message={error} />;
  }

  return (
    <ContainerCard className="flex flex-col sm:flex-row gap-4">
      <div className="w-full flex flex-col gap-2">
        <StudentInfoCard isMobile={isMobile} student={student} />

        <NotebooksCard
          student={student}
          notebooks={notebooks}
          onCreateNotebook={createNotebookAction}
          userRole={session?.user?.role}
          onAddTask={addTaskAction}
          loading={loading}
        />
      </div>

      <TasksCard
        tasks={tasks}
        onAddTask={addTaskAction}
        onUpdateTask={updateTaskAction}
        onDeleteTask={deleteTaskAction}
        onDeleteAllTasks={deleteAllTasksAction}
        userRole={session?.user?.role}
      />

      <ClassesCard
        classes={classes}
        onUpdateClassStatus={handleUpdateClassStatus}
        onUpdateClassFeedback={handleUpdateClassFeedback}
        onFetchClasses={fetchClasses}
        loading={loading}
      />
    </ContainerCard>
  );
}
