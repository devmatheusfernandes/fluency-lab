"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useStudentPanel } from "@/hooks/useStudentPanel";
import { ClassStatus } from "@/types/classes/class";
import TasksCard from "@/components/teacher/student-panel/TasksCard";
import NotebooksCard from "@/components/teacher/student-panel/NotebooksCard";
import ClassesCard from "@/components/teacher/student-panel/ClassesCard";
import { Container } from "@/components/ui/Container";
import { SubContainer } from "@/components/ui/SubContainer";
import { Card, CardContent } from "@/components/ui/Card";
import { TestTubeMinimalistic } from "@solar-icons/react/ssr";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";

export default function AlunoPainel() {
  const { alunoId } = useParams();
  const { data: session } = useSession();
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

  if (
    loading &&
    !student &&
    notebooks.length === 0 &&
    tasks.length === 0 &&
    classes.length === 0
  ) {
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
    <Container className="flex flex-row h-full">
      <div className="w-full h-full flex flex-col gap-2">
        <SubContainer className="flex flex-row gap-2 ">
          <Card>
            <CardContent>
              <Avatar size="xl">
                {/* <AvatarImage
                  size="xl"
                  src={user?.avatarUrl || ""}
                  alt={user?.name}
                />
                <AvatarFallback size="lg">
                  {user?.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback> */}
              </Avatar>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <TestTubeMinimalistic
                weight="BoldDuotone"
                className="w-6 h-6 text-secondary"
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <TestTubeMinimalistic
                weight="BoldDuotone"
                className="w-6 h-6 text-secondary"
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <TestTubeMinimalistic
                weight="BoldDuotone"
                className="w-6 h-6 text-secondary"
              />
            </CardContent>
          </Card>
        </SubContainer>
        <NotebooksCard
          student={student}
          notebooks={notebooks}
          onCreateNotebook={createNotebookAction}
          userRole={session?.user?.role}
          onAddTask={addTaskAction}
          loading={loading} // Pass the loading prop
        />
      </div>

      <TasksCard
        tasks={tasks}
        onAddTask={addTaskAction}
        onUpdateTask={updateTaskAction}
        onDeleteTask={deleteTaskAction}
        onDeleteAllTasks={deleteAllTasksAction}
      />

      <ClassesCard
        classes={classes}
        onUpdateClassStatus={handleUpdateClassStatus}
        onFetchClasses={fetchClasses}
        loading={loading} // Pass the loading prop
      />
    </Container>
  );
}
