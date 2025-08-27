// services/authService.ts

import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { adminDb } from "@/lib/firebase/admin";
import { User } from "@/types/users/users";
import { UserRoles } from "@/types/users/userRoles";

export class AuthService {

  /**
   * Valida as credenciais de um usuário para o fluxo de login.
   * Usado pelo CredentialsProvider do NextAuth.
   */
  async validateUser(email: string, password: string): Promise<any | null> {
    try {
      // 1. Valida as credenciais com o serviço de Autenticação do Firebase (isso usa o SDK de Cliente e está correto)
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      if (userCredential.user) {
        // 2. Busca o perfil do usuário no Firestore com o ADMIN SDK para garantir a permissão de leitura no servidor
        const userDoc = await adminDb.collection('users').doc(userCredential.user.uid).get();

        if (!userDoc.exists) {
          throw new Error("Usuário autenticado mas sem perfil no Firestore.");
        }
        const userProfile = userDoc.data() as User;

        // 3. Retorna um objeto combinado para ser usado no token do NextAuth
        return {
          id: userCredential.user.uid,
          email: userProfile.email,
          name: userProfile.name,
          role: userProfile.role,
          permissions: userProfile.permissions,
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
   * Registra um novo usuário no sistema.
   * Usado pelo endpoint de API /api/auth/signup.
   */
  async registerUser(userData: any): Promise<User> {
    const { name, email, password } = userData;

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    const newUserProfile: Omit<User, 'id'> = {
      name,
      email,
      role: UserRoles.OCCASIONAL_STUDENT,
      permissions: ["class.view", "class.cancel.self", "profile.update.self"],
      createdAt: new Date(),
      isActive: true,
      avatarUrl: '',
      interfaceLanguage: 'pt-BR',
      tutorialCompleted: false,
      classCredits: 0,
    };
    
    const userRef = adminDb.collection('users').doc(firebaseUser.uid);
    await userRef.set(newUserProfile);

    return {
      id: firebaseUser.uid,
      ...newUserProfile,
    };
  }
}