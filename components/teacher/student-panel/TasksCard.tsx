"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SubContainer } from "@/components/ui/SubContainer";
import { NoResults } from "@/components/ui/NoResults/NoResults";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  AddSquare,
  TrashBin2,
  TrashBinMinimalistic,
} from "@solar-icons/react/ssr";
import { Checkbox } from "@/components/ui/Checkbox";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
  ModalPrimaryButton,
  ModalSecondaryButton,
  ModalIcon,
} from "@/components/ui/Modal";

interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

interface TasksCardProps {
  tasks: Task[];
  onAddTask: (taskText: string) => Promise<boolean>;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => Promise<boolean>;
  onDeleteTask: (taskId: string) => Promise<boolean>;
  onDeleteAllTasks: () => Promise<boolean>;
}

export default function TasksCard({
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onDeleteAllTasks,
}: TasksCardProps) {
  const [newTask, setNewTask] = useState("");
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [pendingTasks, setPendingTasks] = useState<string[]>([]);

  // Update local tasks when prop changes
  React.useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  // Calculate completion percentage for progress bar
  const completedTasks = localTasks.filter((task) => task.completed).length;
  const completionPercentage =
    localTasks.length > 0
      ? Math.round((completedTasks / localTasks.length) * 100)
      : 0;

  // Handle adding a new task with skeleton feedback
  const handleAddTask = async () => {
    if (!newTask.trim()) return;

    // Create a pending ID for the skeleton
    const pendingId = `pending-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Add to pending tasks for skeleton display
    setPendingTasks((prev) => [...prev, pendingId]);

    // Clear the input immediately
    setNewTask("");

    // Add in the background
    try {
      const success = await onAddTask(newTask);
      // Remove from pending tasks after completion
      setPendingTasks((prev) => prev.filter((id) => id !== pendingId));

      if (!success) {
        console.error("Failed to add task");
      }
    } catch (error) {
      // Remove from pending tasks if there was an error
      setPendingTasks((prev) => prev.filter((id) => id !== pendingId));
      console.error("Failed to add task", error);
    }
  };

  // Handle updating a task with optimistic update
  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    // Optimistically update the UI
    setLocalTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, ...updates } : task
      )
    );

    // Update in the background
    try {
      const success = await onUpdateTask(taskId, updates);
      if (!success) {
        // Revert the change if the update failed
        setLocalTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === taskId
              ? { ...task, ...tasks.find((t) => t.id === taskId) }
              : task
          )
        );
      }
    } catch (error) {
      // Revert the change if there was an error
      setLocalTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId
            ? { ...task, ...tasks.find((t) => t.id === taskId) }
            : task
        )
      );
      console.error("Failed to update task", error);
    }
  };

  // Handle deleting a single task
  const handleDeleteTask = async (taskId: string) => {
    // Optimistically remove the task from the UI
    setLocalTasks((prevTasks) =>
      prevTasks.filter((task) => task.id !== taskId)
    );

    // Delete in the background
    try {
      const success = await onDeleteTask(taskId);
      if (!success) {
        // Revert the change if the delete failed
        const originalTask = tasks.find((task) => task.id === taskId);
        if (originalTask) {
          setLocalTasks((prevTasks) => {
            // Check if the task is already in the list to avoid duplicates
            if (!prevTasks.some((t) => t.id === taskId)) {
              return [...prevTasks, originalTask];
            }
            return prevTasks;
          });
        }
      }
    } catch (error) {
      // Revert the change if there was an error
      const originalTask = tasks.find((task) => task.id === taskId);
      if (originalTask) {
        setLocalTasks((prevTasks) => {
          // Check if the task is already in the list to avoid duplicates
          if (!prevTasks.some((t) => t.id === taskId)) {
            return [...prevTasks, originalTask];
          }
          return prevTasks;
        });
      }
      console.error("Failed to delete task", error);
    }
  };

  // Handle deleting all tasks - opens confirmation modal
  const handleDeleteAllTasks = () => {
    if (localTasks.length === 0) return;
    setIsDeleteModalOpen(true);
  };

  // Confirm deletion of all tasks
  const confirmDeleteAllTasks = async () => {
    // Optimistically clear all tasks from the UI
    setLocalTasks([]);

    // Delete all in the background
    try {
      const success = await onDeleteAllTasks();
      if (!success) {
        // Revert the change if the delete failed
        setLocalTasks(tasks);
      }
    } catch (error) {
      // Revert the change if there was an error
      setLocalTasks(tasks);
      console.error("Failed to delete all tasks", error);
    }

    setIsDeleteModalOpen(false);
  };

  // Render a skeleton task
  const renderSkeletonTask = (key: string) => (
    <motion.div
      key={key}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center p-3 bg-container rounded-lg border border-input/50"
    >
      <div className="mr-3 h-5 w-5 rounded bg-input/40 dark:bg-input/80 animate-pulse" />
      <div className="flex-1 h-4 bg-input/40 dark:bg-input/80 rounded animate-pulse" />
      <div className="ml-2 w-5 h-5 rounded bg-input/40 dark:bg-input/80 animate-pulse" />
    </motion.div>
  );

  return (
    <>
      <SubContainer className="h-full flex flex-col relative overflow-hidden">
        {/* Progress bar at the top */}
        <div className="absolute top-0 left-0 right-0 h-3 bg-input/60 dark:bg-slate-950 overflow-hidden rounded-t-xl">
          <motion.div
            className="h-full bg-success-light"
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pt-2">
          <h2 className="text-xl font-bold text-title">Tarefas</h2>
          <div className="text-sm text-paragraph/40">
            {localTasks.length} tarefa(s) • {completionPercentage}% concluído
          </div>
        </div>

        <div className="flex mb-4 gap-2 items-center">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Adicionar nova tarefa..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddTask()}
              className="pr-12" // Add padding to the right to make space for the button
            />
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
            >
              <AddSquare
                onClick={handleAddTask}
                weight="BoldDuotone"
                className="w-6 h-6 text-success-light hover:text-success duration-300 ease-in-out transition-all"
              />
            </motion.div>
          </div>
          {localTasks.length > 0 && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <TrashBinMinimalistic
                onClick={handleDeleteAllTasks}
                weight="BoldDuotone"
                className="w-6 h-6 text-danger hover:text-danger-light duration-300 ease-in-out transition-all cursor-pointer"
              />
            </motion.div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="space-y-2">
            <AnimatePresence>
              {/* Render skeleton tasks first */}
              {pendingTasks.map((id) => renderSkeletonTask(id))}

              {/* Render actual tasks */}
              {localTasks.map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center p-3 bg-container rounded-lg border border-input/50"
                >
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={(checked) =>
                      handleUpdateTask(task.id, {
                        completed: checked as boolean,
                      })
                    }
                    className="mr-3 h-5 w-5 text-primary rounded"
                  />
                  <motion.span
                    animate={{
                      textDecoration: task.completed ? "line-through" : "none",
                      opacity: task.completed ? 0.7 : 1,
                    }}
                    className="flex-1 text-paragraph"
                  >
                    {task.text}
                  </motion.span>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDeleteTask(task.id)}
                    className="ml-2 cursor-pointer text-danger hover:text-danger-light"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>

            {localTasks.length === 0 && pendingTasks.length === 0 && (
              <NoResults
                customMessage={{
                  withoutSearch: "Nenhuma tarefa adicionada",
                }}
                className="p-8"
              />
            )}
          </div>
        </div>
      </SubContainer>

      {/* Delete All Tasks Confirmation Modal */}
      <Modal open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <ModalContent>
          <ModalIcon type="delete" />
          <ModalHeader>
            <ModalTitle>Deletar todas as tarefas</ModalTitle>
            <ModalDescription>
              Tem certeza que deseja deletar todas as {localTasks.length}{" "}
              tarefas? Esta ação não pode ser desfeita.
            </ModalDescription>
          </ModalHeader>
          <ModalFooter>
            <ModalSecondaryButton onClick={() => setIsDeleteModalOpen(false)}>
              Cancelar
            </ModalSecondaryButton>
            <ModalPrimaryButton
              onClick={confirmDeleteAllTasks}
              className="bg-danger hover:bg-danger-light"
            >
              Deletar todas
            </ModalPrimaryButton>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
