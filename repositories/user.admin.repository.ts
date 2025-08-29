// repositories/user.admin.repository.ts

import { adminDb } from '@/lib/firebase/admin';
import { User } from '@/types/users/users'; // Verifique se o caminho para User está correto
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import admin from 'firebase-admin'; // 👈 ADICIONE ESTA IMPORTAÇÃO

/**
 * Busca um usuário pelo ID usando o Firebase Admin SDK.
 * Esta função SÓ DEVE ser usada em ambientes de servidor (API Routes, Server Components).
 * @param userId - O ID do usuário a ser buscado.
 * @returns O objeto do usuário ou null se não for encontrado.
 */
export async function getUserById_Admin(userId: string): Promise<User | null> {
  try {
    const userDoc = await adminDb.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return null;
    }

    // O 'as User' garante que o tipo retornado corresponda à nossa interface
    return { id: userDoc.id, ...userDoc.data() } as User;
  } catch (error) {
    console.error("Erro ao buscar usuário com Admin SDK:", error);
    return null;
  }
}

export class UserAdminRepository {
  private usersCollection = adminDb.collection('users');

  async findUsersByRole(role: string): Promise<User[]> {
    const snapshot = await this.usersCollection.where('role', '==', role).get();
    if (snapshot.empty) return [];
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id,
        ...data,
        createdAt: (data.createdAt as Timestamp).toDate(),
        birthDate: data.birthDate ? (data.birthDate as Timestamp).toDate() : undefined,
      } as User;
    });
  }

  async findUserById(userId: string): Promise<User | null> {
    const docRef = this.usersCollection.doc(userId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return null;
    }
    
    const data = docSnap.data()!;
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate() : new Date(), // Fallback para data atual
      birthDate: data.birthDate ? (data.birthDate as Timestamp).toDate() : undefined,
    } as User;
  }

  async findUsersByIds(userIds: string[]): Promise<User[]> {
    if (userIds.length === 0) return [];
    
    // Agora o 'admin' está definido e o código funcionará
    const snapshot = await this.usersCollection.where(admin.firestore.FieldPath.documentId(), 'in', userIds).get();
    
    if (snapshot.empty) return [];

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id,
        ...data,
        createdAt: (data.createdAt as Timestamp).toDate(),
        birthDate: data.birthDate ? (data.birthDate as Timestamp).toDate() : undefined,
      } as User;
    });
  }

  /**
   * Lista todos os usuários com opções de filtro.
   * @param filters - Objeto opcional para filtrar por role ou status de atividade.
   * @returns Uma lista de usuários.
   */
  async listUsers(filters?: { role?: string; isActive?: boolean }): Promise<User[]> {
    let query: admin.firestore.Query = this.usersCollection;

    if (filters?.role) {
      query = query.where('role', '==', filters.role);
    }
    if (filters?.isActive !== undefined) {
      query = query.where('isActive', '==', filters.isActive);
    }

    const snapshot = await query.orderBy('createdAt', 'desc').get();
    if (snapshot.empty) return [];

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id,
        ...data,
        createdAt: (data.createdAt as Timestamp).toDate(),
        birthDate: data.birthDate ? (data.birthDate as Timestamp).toDate() : undefined,
      } as User;
    });
  }

  /**
   * Atualiza o status de um usuário (ativo/inativo).
   * @param userId - O ID do usuário a ser atualizado.
   * @param isActive - O novo status de atividade.
   */
  async updateUserStatus(userId: string, isActive: boolean): Promise<void> {
    const userRef = this.usersCollection.doc(userId);
    await userRef.update({
      isActive,
      deactivatedAt: isActive ? FieldValue.delete() : FieldValue.serverTimestamp(),
    });
  }

    /**
   * Atualiza um documento de utilizador com novos dados.
   * @param userId - O ID do utilizador a ser atualizado.
   * @param data - Um objeto com os campos a serem atualizados.
   */
    async update(userId: string, data: Partial<User>): Promise<void> {
      const userRef = this.usersCollection.doc(userId);
      await userRef.update(data);
    }

    async countNewUsersThisMonth(): Promise<number> {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const snapshot = await this.usersCollection
        .where('createdAt', '>=', Timestamp.fromDate(startOfMonth))
        .count()
        .get();
      return snapshot.data().count;
    }
  
    async countActiveTeachers(): Promise<number> {
      const snapshot = await this.usersCollection
        .where('role', '==', 'teacher')
        .where('isActive', '==', true)
        .count()
        .get();
      return snapshot.data().count;
    }
}