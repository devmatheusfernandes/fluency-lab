'use client';

import { useState } from "react";
import { UserRoles } from "@/types/users/userRoles";

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

  // Futuramente, outras ações como 'deleteUser', 'updateUser' podem ser adicionadas aqui.
  return { createUser, isLoading, error, successMessage };
};