// hooks/useStudentPanel.ts
'use client';

import { useState, useCallback, useEffect } from 'react';
import { User } from '@/types/users/users';
import { StudentClass } from '@/types/classes/class';
import { ClassStatus } from '@/types/classes/class';

// Define local types for notebook and task since we don't have them in the global types yet
interface Notebook {
  id: string;
  title: string;
  description: string;
  content: any;
  student: string;
  studentName?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export const useStudentPanel = (studentId: string) => {
  const [student, setStudent] = useState<Partial<User> | null>(null);
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [classes, setClasses] = useState<StudentClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudentInfo = useCallback(async () => {
    if (!studentId) return;
    
    try {
      const response = await fetch(`/api/admin/users/${studentId}/details`);
      if (!response.ok) {
        // If admin endpoint fails, try to get basic info from notebooks endpoint
        const notebooksResponse = await fetch(`/api/teacher/students/${studentId}/notebooks`);
        if (notebooksResponse.ok) {
          const notebooksData = await notebooksResponse.json();
          if (notebooksData.length > 0 && notebooksData[0].studentName) {
            setStudent({
              id: studentId,
              name: notebooksData[0].studentName,
              email: "Email não disponível",
            });
          } else {
            setStudent({
              id: studentId,
              name: "Aluno",
              email: "Email não disponível",
            });
          }
        }
        return;
      }
      
      const studentData = await response.json();
      setStudent({
        id: studentData.id,
        name: studentData.name,
        email: studentData.email,
        avatarUrl: studentData.avatarUrl,
        isActive: studentData.isActive,
      });
    } catch (err: any) {
      setError(err.message);
    }
  }, [studentId]);

  const fetchNotebooks = useCallback(async () => {
    if (!studentId) return;
    
    try {
      const response = await fetch(`/api/teacher/students/${studentId}/notebooks`);
      if (!response.ok) throw new Error('Failed to fetch notebooks');
      
      const data = await response.json();
      setNotebooks(data);
    } catch (err: any) {
      setError(err.message);
    }
  }, [studentId]);

  const fetchTasks = useCallback(async () => {
    if (!studentId) return;
    
    try {
      const response = await fetch(`/api/teacher/students/${studentId}/tasks`);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      
      const data = await response.json();
      setTasks(data);
    } catch (err: any) {
      setError(err.message);
    }
  }, [studentId]);

  const fetchClasses = useCallback(async (month: number, year: number) => {
    if (!studentId) return;
    
    try {
      const response = await fetch(`/api/teacher/students/${studentId}/classes`);
      if (!response.ok) throw new Error('Failed to fetch classes');
      
      const data = await response.json();
      
      // Filter classes by month and year
      const filteredClasses = data.filter((cls: any) => {
        const classDate = new Date(cls.scheduledAt);
        return classDate.getMonth() === month && classDate.getFullYear() === year;
      });
      
      setClasses(filteredClasses);
    } catch (err: any) {
      setError(err.message);
    }
  }, [studentId]);

  const addTask = useCallback(async (taskText: string) => {
    if (!studentId || !taskText.trim()) return false;
    
    try {
      const response = await fetch(`/api/teacher/students/${studentId}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: taskText,
          completed: false,
          createdAt: new Date(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add task');
      }

      const newTask = await response.json();
      setTasks(prev => [newTask, ...prev]);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, [studentId]);

  const createNotebook = useCallback(async (title: string) => {
    if (!studentId || !title.trim()) return false;
    
    try {
      const response = await fetch(`/api/teacher/students/${studentId}/notebooks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description: '',
          content: '',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create notebook');
      }

      const newNotebook = await response.json();
      setNotebooks(prev => [newNotebook, ...prev]);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, [studentId]);

  const updateClassStatus = useCallback(async (classId: string, newStatus: ClassStatus) => {
    try {
      const response = await fetch(`/api/classes/${classId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update class status');
      }

      // Update the class status in the local state
      setClasses(prev => 
        prev.map(cls => 
          cls.id === classId ? { ...cls, status: newStatus } : cls
        )
      );
      
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, []);

  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    if (!studentId) return false;
    
    try {
      const response = await fetch(`/api/teacher/students/${studentId}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      // Update the task in the local state
      setTasks(prev => 
        prev.map(task => 
          task.id === taskId ? { ...task, ...updates } : task
        )
      );
      
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, [studentId]);

  const deleteTask = useCallback(async (taskId: string) => {
    if (!studentId) return false;
    
    try {
      const response = await fetch(`/api/teacher/students/${studentId}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      // Remove the task from the local state
      setTasks(prev => prev.filter(task => task.id !== taskId));
      
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, [studentId]);

  const deleteAllTasks = useCallback(async () => {
    if (!studentId) return false;
    
    try {
      const response = await fetch(`/api/teacher/students/${studentId}/tasks`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete all tasks');
      }

      // Clear all tasks from the local state
      setTasks([]);
      
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, [studentId]);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchStudentInfo(),
          fetchNotebooks(),
          fetchTasks(),
          fetchClasses(new Date().getMonth(), new Date().getFullYear())
        ]);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      loadData();
    }
  }, [studentId, fetchStudentInfo, fetchNotebooks, fetchTasks, fetchClasses]);

  return {
    // Data
    student,
    notebooks,
    tasks,
    classes,
    
    // Loading and error states
    loading,
    error,
    
    // Actions
    fetchStudentInfo,
    fetchNotebooks,
    fetchTasks,
    fetchClasses,
    addTask,
    createNotebook,
    updateClassStatus,
    updateTask,
    deleteTask,
    deleteAllTasks,
    
    // Setters for local state management
    setNotebooks,
    setTasks,
    setClasses,
  };
};