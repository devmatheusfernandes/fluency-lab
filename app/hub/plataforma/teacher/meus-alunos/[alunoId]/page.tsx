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

// Skeleton component for the student panel
const StudentPanelSkeleton = () => (
  <Container className="flex flex-col sm:flex-row gap-2">
    <div className="w-full sm:w-fit h-full flex flex-col gap-2">
      <SubContainer className="flex flex-row items-center justify-start !py-6 gap-2">
        {/* Avatar skeleton */}
        <SkeletonLoader
          variant="avatar"
          size="lg"
          className="w-16 h-16 rounded-xl"
        />

        {/* Action cards skeletons */}
        <div className="flex gap-2">
          {[...Array(3)].map((_, index) => (
            <SkeletonLoader
              key={index}
              variant="rect"
              className="w-24 h-12 rounded-lg"
            />
          ))}
        </div>
      </SubContainer>

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
    <Container className="flex flex-col sm:flex-row gap-4">
      <div className="w-full sm:w-fit h-[50vh] sm:h-full flex flex-col gap-2">
        <SubContainer className="h-fit py-8 flex flex-row items-center justify-around gap-2">
          <Avatar size={isMobile ? "xl" : "md"}>
            <AvatarImage
              size={isMobile ? "xl" : "md"}
              src={student?.avatarUrl || ""}
              alt={student?.name}
            />
            <AvatarFallback size={isMobile ? "xl" : "md"}>
              {student?.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>

          <Card className="bg-primary transition-all duration-300 ease-in-out">
            <CardContent className="p-1 flex items-center group">
              <TestTubeMinimalistic
                weight="BoldDuotone"
                className="w-6 h-6 text-white flex-shrink-0"
              />
              <span className="font-bold overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out max-w-0 group-hover:max-w-[200px] opacity-0 group-hover:opacity-100">
                Nivelamento
              </span>
            </CardContent>
          </Card>

          <Card className="bg-secondary transition-all duration-300 ease-in-out">
            <CardContent className="p-1 flex items-center group">
              <Document
                weight="BoldDuotone"
                className="w-6 h-6 text-white flex-shrink-0"
              />
              <span className="font-bold overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out max-w-0 group-hover:max-w-[200px] opacity-0 group-hover:opacity-100">
                Relatorio
              </span>
            </CardContent>
          </Card>

          <Card className="bg-success transition-all duration-300 ease-in-out">
            <CardContent className="p-1 flex items-center group">
              <Bookmark
                weight="BoldDuotone"
                className="w-6 h-6 text-white flex-shrink-0"
              />
              <span className="font-bold overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out max-w-0 group-hover:max-w-[200px] opacity-0 group-hover:opacity-100">
                Badge
              </span>
            </CardContent>
          </Card>
        </SubContainer>
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
        loading={loading} // Pass the loading prop
      />
    </Container>
  );
}
