'use client';

import { UserRoles } from "@/types/users/userRoles";
import { User } from "@/types/users/users";
import { useState } from "react";
import { toast } from "sonner";

interface CreateUserPayload {
  name: string;
  email: string;
  role: UserRoles;
}

export const useAdmin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const createUser = async (payload: CreateUserPayload): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Falha ao criar utilizador.');
      
      setSuccessMessage(`Utilizador para '${data.user.email}' criado com sucesso! Um e-mail de boas-vindas foi enviado.`);
      return true; // Retorna sucesso
    } catch (err: any) {
      setError(err.message);
      return false; // Retorna falha
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userId: string, userData: Partial<User>): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Falha ao atualizar utilizador.");

      setSuccessMessage("Utilizador atualizado com sucesso!");
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Atualiza a lista de professores associados a um aluno.
   * @param studentId - O ID do aluno a ser atualizado.
   * @param teacherIds - O array completo com os novos IDs de professores.
   */
  const updateStudentTeachers = async (studentId: string, teacherIds: string[]): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await fetch(`/api/admin/users/${studentId}/teachers`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherIds }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Falha ao atualizar professores.");

      setSuccessMessage("Professores associados atualizados com sucesso!");
      return true;
    } catch (err: any) {
      setError(err.message);
      // Usamos toast aqui para feedback imediato de erro
      toast.error(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { createUser, updateUser, updateStudentTeachers, isLoading, error, successMessage };
};
