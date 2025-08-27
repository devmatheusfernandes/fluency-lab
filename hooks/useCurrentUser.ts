'use client';

import { useSession } from "next-auth/react";
import { UserPermission } from "@/types/users/userPermissions"; // Verifique se o caminho do tipo está correto

/**
 * Hook customizado para obter os dados do usuário logado.
 * É um wrapper conveniente em torno do 'useSession' do NextAuth.
 */
export const useCurrentUser = () => {
  const { data: session, status } = useSession();

  return {
    user: session?.user,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
  };
};

/**
 * Hook customizado para verificar se o usuário logado possui uma permissão específica.
 * @param permission - A permissão a ser verificada (ex: "user.create").
 * @returns {boolean} - Retorna true se o usuário tiver a permissão, caso contrário false.
 */
export const useCan = (permission: UserPermission): boolean => {
  const { user, isAuthenticated } = useCurrentUser();

  if (!isAuthenticated || !user?.permissions) {
    return false;
  }
  
  // Verifica se a permissão necessária está no array de permissões do usuário
  return user.permissions.includes(permission);
};