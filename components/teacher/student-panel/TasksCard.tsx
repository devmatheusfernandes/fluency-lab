"use client";

import React, { useState } from "react";

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

  // Handle adding a new task
  const handleAddTask = async () => {
    if (!newTask.trim()) return;

    const success = await onAddTask(newTask);
    if (success) {
      setNewTask("");
    }
  };

  // Handle deleting a single task
  const handleDeleteTask = async (taskId: string) => {
    const success = await onDeleteTask(taskId);
    if (!success) {
      console.error("Failed to delete task");
    }
  };

  // Handle deleting all tasks
  const handleDeleteAllTasks = async () => {
    if (tasks.length === 0) return;

    // Confirm with user before deleting all tasks
    const confirmed = window.confirm(
      `Tem certeza que deseja deletar todas as ${tasks.length} tarefas?`
    );
    if (!confirmed) return;

    const success = await onDeleteAllTasks();
    if (!success) {
      console.error("Failed to delete all tasks");
    }
  };

  return (
    <div className="bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-lg p-4 h-full flex flex-col">
      <h2 className="text-xl font-bold mb-4">Tarefas</h2>

      <div className="flex mb-4">
        <input
          type="text"
          placeholder="Adicionar nova tarefa..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          className="flex-1 pl-4 pr-2 py-2 rounded-l-lg bg-fluency-gray-100 dark:bg-fluency-gray-800 border border-fluency-gray-200 dark:border-fluency-gray-700 focus:outline-none"
          onKeyPress={(e) => e.key === "Enter" && handleAddTask()}
        />
        <button
          onClick={handleAddTask}
          className="bg-fluency-blue-500 hover:bg-fluency-blue-600 text-white px-4 py-2 rounded-r-lg transition-colors"
        >
          +
        </button>
      </div>

      <div className="flex justify-between items-center mb-2">
        <div className="text-sm text-fluency-gray-600 dark:text-fluency-gray-300">
          {tasks.length} tarefa(s)
        </div>
        {tasks.length > 0 && (
          <button
            onClick={handleDeleteAllTasks}
            className="text-xs text-fluency-red-500 hover:text-fluency-red-700 dark:hover:text-fluency-red-400"
          >
            Deletar todas
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center p-3 bg-fluency-gray-100 dark:bg-fluency-gray-800 rounded-lg"
            >
              <input
                type="checkbox"
                checked={task.completed}
                onChange={(e) =>
                  onUpdateTask(task.id, {
                    completed: e.target.checked,
                  })
                }
                className="mr-3 h-5 w-5 text-fluency-blue-500 rounded"
              />
              <span
                className={
                  task.completed
                    ? "line-through text-fluency-gray-500 flex-1"
                    : "flex-1"
                }
              >
                {task.text}
              </span>
              <button
                onClick={() => handleDeleteTask(task.id)}
                className="ml-2 text-fluency-red-500 hover:text-fluency-red-700 dark:hover:text-fluency-red-400"
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
              </button>
            </div>
          ))}

          {tasks.length === 0 && (
            <div className="text-center py-8 text-fluency-gray-500">
              Nenhuma tarefa adicionada
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
