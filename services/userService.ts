// services/userService.ts

import { adminAuth } from "@/lib/firebase/admin";
import { ClassRepository } from "@/repositories/classRepository";
import { PaymentRepository } from "@/repositories/paymentRepository";
import { UserAdminRepository } from "@/repositories/user.admin.repository";
import { StudentClass } from "@/types/classes/class";
import { Payment } from "@/types/financial/payments";
import { FullUserDetails } from "@/types/users/user-details";
import { User } from "@/types/users/users";

const userAdminRepo = new UserAdminRepository();
const classRepo = new ClassRepository();
const paymentRepo = new PaymentRepository();

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

  /**
   * Atualiza o perfil de um utilizador com dados seguros.
   * @param userId - O ID do utilizador que está a ser atualizado.
   * @param profileData - Os dados recebidos do formulário.
   */
  async updateUserProfile(userId: string, profileData: Partial<User>): Promise<void> {
    // 1. Define uma "lista segura" de campos que o utilizador pode editar
    const allowedUpdates: Partial<User> = {
      name: profileData.name,
      nickname: profileData.nickname,
      phoneNumber: profileData.phoneNumber,
      address: profileData.address,
      // avatarUrl será tratado separadamente (upload de imagem)
      // birthDate também pode ser adicionado aqui
    };

    // 2. Remove quaisquer campos 'undefined' para evitar erros no Firestore
    Object.keys(allowedUpdates).forEach(key => 
      (allowedUpdates as any)[key] === undefined && delete (allowedUpdates as any)[key]
    );

    if (Object.keys(allowedUpdates).length === 0) {
      throw new Error("Nenhum dado válido para atualizar foi fornecido.");
    }

    // 3. Chama o repositório para salvar apenas os dados permitidos
    await userAdminRepo.update(userId, allowedUpdates);
  }

    /**
   * Atualiza as configurações de interface de um utilizador.
   * @param userId - O ID do utilizador a ser atualizado.
   * @param settingsData - Os dados de configuração (idioma, tema).
   */
    async updateUserSettings(userId: string, settingsData: { interfaceLanguage?: string; theme?: 'light' | 'dark' }): Promise<void> {
      // Define uma lista segura de campos que podem ser atualizados
      const allowedUpdates: Partial<User> = {};
  
      if (settingsData.interfaceLanguage) {
        allowedUpdates.interfaceLanguage = settingsData.interfaceLanguage;
      }
      if (settingsData.theme) {
        allowedUpdates.theme = settingsData.theme;
      }
  
      if (Object.keys(allowedUpdates).length === 0) {
        throw new Error("Nenhuma configuração válida para atualizar.");
      }
  
      await userAdminRepo.update(userId, allowedUpdates);
    }

    async getFullUserDetails(userId: string): Promise<FullUserDetails | null> {
      // 1. Busca o perfil base do utilizador
      const userProfile = await userAdminRepo.findUserById(userId);
      if (!userProfile) {
        return null;
      }
  
      // 2. Busca dados agregados adicionais em paralelo
      // CORREÇÃO: Adiciona o tipo explícito para a variável
      let scheduledClasses: StudentClass[] = [];
      if (userProfile.role === 'student' || userProfile.role === 'occasional_student') {
        scheduledClasses = await classRepo.findClassesByStudentId(userId);
      } else if (userProfile.role === 'teacher') {
        scheduledClasses = await classRepo.findClassesByTeacherId(userId);
      }
      // Adicione outras buscas aqui (contratos, pagamentos, etc.)
  
      // 3. Combina tudo num único objeto
      const fullDetails: FullUserDetails = {
        ...userProfile,
        scheduledClasses,
      };
  
      return fullDetails;
    }

    async updateUserDetails(userId: string, data: Partial<User>): Promise<void> {
      // Define uma lista segura de campos que um admin pode editar
      const allowedUpdates: Partial<User> = {
        name: data.name,
        role: data.role,
        // Adicione outros campos que o admin pode editar aqui
      };
  
      // Remove quaisquer campos 'undefined'
      Object.keys(allowedUpdates).forEach(key => 
        (allowedUpdates as any)[key] === undefined && delete (allowedUpdates as any)[key]
      );
  
      if (Object.keys(allowedUpdates).length === 0) {
        throw new Error("Nenhum dado válido para atualizar.");
      }
  
      await userAdminRepo.update(userId, allowedUpdates);
      
      // Se o role foi alterado, atualiza também os Custom Claims no Firebase Auth
      if (data.role) {
          await adminAuth.setCustomUserClaims(userId, { role: data.role });
      }
    }

  /**
   * Busca o histórico financeiro de um utilizador.
   * @param userId - O ID do utilizador.
   */
  async getUserFinancialHistory(userId: string): Promise<Payment[]> {
    // No futuro, podemos adicionar mais lógicas aqui, como calcular o total gasto.
    return await paymentRepo.findByUserId(userId);
  }

  /**
   * Atualiza a lista de professores associados a um aluno.
   * @param studentId - O ID do aluno a ser atualizado.
   * @param teacherIds - O array completo com os novos IDs de professores.
   */
    async manageStudentTeachers(studentId: string, teacherIds: string[]): Promise<void> {
      // A validação de permissão (se o utilizador é Admin/Manager) é feita na API Route.
      // O serviço foca-se na lógica de negócio.
      
      // Garante que o input é um array para segurança
      if (!Array.isArray(teacherIds)) {
        throw new Error("A lista de professores deve ser um array.");
      }
  
      await userAdminRepo.update(studentId, { teachersIds: teacherIds });
    }
}