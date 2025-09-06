"use client";

import React, { useEffect, useState } from "react";
import TasksCard from "@/components/teacher/student-panel/TasksCard";

export default function TestTasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tasks from the student API
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        console.log("Fetching tasks from API...");
        const response = await fetch("/api/student/tasks");
        console.log("Response status:", response.status);
        if (response.ok) {
          const data = await response.json();
          console.log("Fetched tasks:", data);
          setTasks(data);
        } else {
          const errorData = await response.json();
          console.error("Error fetching tasks:", errorData);
          setError(errorData.error || "Failed to fetch tasks");
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
        setError("Failed to fetch tasks");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Mock functions
  const handleAddTask = async (taskText: string) => {
    console.log("Adding task:", taskText);
    return true;
  };

  const handleUpdateTask = async (taskId: string, updates: any) => {
    console.log("Updating task:", taskId, updates);
    // In a real implementation, you would update the task via API
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, ...updates } : task
      )
    );
    return true;
  };

  const handleDeleteTask = async (taskId: string) => {
    console.log("Deleting task:", taskId);
    return true;
  };

  const handleDeleteAllTasks = async () => {
    console.log("Deleting all tasks");
    return true;
  };

  if (loading) {
    return <div className="p-4">Loading tasks...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Test Tasks Card</h1>
      <p>Number of tasks: {tasks.length}</p>
      <div className="border p-4">
        <TasksCard
          tasks={tasks}
          onAddTask={handleAddTask}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          onDeleteAllTasks={handleDeleteAllTasks}
        />
      </div>
    </div>
  );
}
