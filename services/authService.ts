// services/authService.ts

import {
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { adminDb } from "@/lib/firebase/admin";
import { User } from "@/types/users/users";
import { UserRoles } from "@/types/users/userRoles";
import { TwoFactorService } from "./twoFactorService";

const twoFactorService = new TwoFactorService();

export class AuthService {
  /**
   * Valida as credenciais de um usuário para o fluxo de login.
   * Usado pelo CredentialsProvider do NextAuth.
   */
  async validateUser(email: string, password: string): Promise<any | null> {
    try {
      // 1. Valida as credenciais com o serviço de Autenticação do Firebase (isso usa o SDK de Cliente e está correto)
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      if (userCredential.user) {
        // 2. Busca o perfil do usuário no Firestore com o ADMIN SDK para garantir a permissão de leitura no servidor
        const userDoc = await adminDb
          .collection("users")
          .doc(userCredential.user.uid)
          .get();

        if (!userDoc.exists) {
          throw new Error("Usuário autenticado mas sem perfil no Firestore.");
        }
        const userProfile = userDoc.data() as User;

        // 3. Verifica se 2FA está habilitado para o usuário
        const is2FAEnabled = await twoFactorService.isTwoFactorEnabled(
          userCredential.user.uid
        );

        // 4. Retorna um objeto combinado para ser usado no token do NextAuth
        return {
          id: userCredential.user.uid,
          email: userProfile.email,
          name: userProfile.name,
          role: userProfile.role,
          permissions: userProfile.permissions,
          tutorialCompleted: userProfile.tutorialCompleted,
          twoFactorEnabled: is2FAEnabled,
          // Note: We don't verify the 2FA token here, that happens in a separate step
        };
      }
      return null;
    } catch (error) {
      // O console.error no seu terminal mostrará este erro de permissão
      console.error("Erro de validação:", error);
      return null; // Retorna null para o NextAuth, que resulta em um erro 401
    }
  }

  /**
   * Verifica o token 2FA do usuário
   */
  async verifyTwoFactorToken(userId: string, token: string): Promise<boolean> {
    const secret = await twoFactorService.getTwoFactorSecret(userId);
    if (!secret) return false;

    return twoFactorService.verifyToken(secret, token);
  }

  /**
   * Verifica um código de backup 2FA
   */
  async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    return twoFactorService.verifyBackupCode(userId, code);
  }

  /**
   * Invalida um código de backup usado
   */
  async invalidateBackupCode(userId: string, code: string): Promise<void> {
    await twoFactorService.invalidateBackupCode(userId, code);
  }



  /**
   * Habilita 2FA para um usuário
   */
  async enableTwoFactor(userId: string, secret: string): Promise<void> {
    await twoFactorService.enableTwoFactor(userId, secret);
  }

  /**
   * Desabilita 2FA para um usuário
   */
  async disableTwoFactor(userId: string): Promise<void> {
    await twoFactorService.disableTwoFactor(userId);
  }

  /**
   * Busca um usuário pelo ID para atualizar dados da sessão
   */
  async getUserById(userId: string): Promise<User | null> {
    try {
      const userDoc = await adminDb.collection("users").doc(userId).get();
      
      if (!userDoc.exists) {
        return null;
      }
      
      const userProfile = userDoc.data() as User;
      
      // Return the complete user object with all required fields
      return {
        ...userProfile,
        id: userDoc.id, // Ensure the document ID takes precedence
      };
    } catch (error) {
      console.error("Erro ao buscar usuário por ID:", error);
      return null;
    }
  }
}
