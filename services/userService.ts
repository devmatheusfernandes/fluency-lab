// services/userService.ts

import { UserAdminRepository } from "@/repositories/user.admin.repository";
import { User } from "@/types/users/users";

const userAdminRepo = new UserAdminRepository();

export class UserService {
  /**
   * Obtém uma lista de usuários com base nos filtros fornecidos.
   */
  async getUsers(filters?: { role?: string; isActive?: boolean }): Promise<User[]> {
    return await userAdminRepo.listUsers(filters);
  }

  /**
   * Desativa um usuário, marcando-o como inativo.
   * @param userId - O ID do usuário a ser desativado.
   */
  async deactivateUser(userId: string): Promise<void> {
    return await userAdminRepo.updateUserStatus(userId, false);
  }

  /**
   * Reativa um usuário, marcando-o como ativo.
   * @param userId - O ID do usuário a ser reativado.
   */
  async reactivateUser(userId: string): Promise<void> {
    return await userAdminRepo.updateUserStatus(userId, true);
  }

  /**
   * Atualiza os dados de um usuário.
   * (Esta função pode ser expandida para atualizar outros campos no futuro).
   */
  async updateUser(userId: string, data: Partial<User>): Promise<void> {
    // A lógica de atualização de outros campos viria aqui.
    // Por enquanto, focamos no status.
    console.log(`Atualizando usuário ${userId} com dados:`, data);
  }
}