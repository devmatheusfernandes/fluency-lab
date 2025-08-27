// types/next-auth.d.ts

import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";
import { UserRoles } from "./userRoles"; // 👈 Importe seus tipos
import { UserPermission } from "./userPermissions"; // 👈 Importe seus tipos

// Estende o token JWT
declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role?: UserRoles;
    permissions?: UserPermission[];
  }
}

// Estende a sessão e o usuário
declare module "next-auth" {
  interface User extends DefaultUser {
    id: string;
    role?: UserRoles;
    permissions?: UserPermission[];
  }

  interface Session extends DefaultSession {
    user: {
      id: string;
      role?: UserRoles;
      permissions?: UserPermission[];
    } & DefaultSession["user"]; // Mantém os campos padrão como name, email, image
  }
}