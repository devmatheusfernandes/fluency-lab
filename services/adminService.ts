// services/adminService.ts

import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { User } from "@/types/users/users";
import { UserRoles } from "@/types/users/userRoles";
import { EmailService } from "./emailService";
import { rolePermissionsMap } from "@/config/permissions";

const emailService = new EmailService();

export class AdminService {
  async createUser(userData: { name: string; email: string; role: UserRoles }) {
    const { name, email, role } = userData;

    // 1. Cria o usuário no Firebase Authentication SEM senha.
    // O usuário ficará em um estado onde só poderá logar após redefinir a senha.
    const userRecord = await adminAuth.createUser({
      email,
      displayName: name,
      emailVerified: true,
      // 🚫 Removemos a criação de senha temporária daqui
    });

    await adminAuth.setCustomUserClaims(userRecord.uid, { role });
    
    // 2. Cria o perfil do usuário no Firestore (como antes)
    const newUserProfile: Omit<User, 'id'> = {
      name,
      email,
      role,
      permissions: rolePermissionsMap[role] || [],
      createdAt: new Date(),
      isActive: true,
      avatarUrl: '',
      interfaceLanguage: 'pt-BR',
      tutorialCompleted: false,
    };
    
    await adminDb.collection('users').doc(userRecord.uid).set(newUserProfile);
    
    // 3. Gera o link para o usuário DEFINIR sua senha pela primeira vez
    const actionLink = await adminAuth.generatePasswordResetLink(email);

    // 4. Envia o e-mail de boas-vindas com o link
    await emailService.sendWelcomeAndSetPasswordEmail(email, name, actionLink);
    
    // 5. Retorna o usuário criado, mas sem nenhuma senha
    return { newUser: { id: userRecord.uid, ...newUserProfile } };
  }
}