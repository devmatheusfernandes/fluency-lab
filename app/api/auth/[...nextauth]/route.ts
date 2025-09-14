import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { AuthService } from '@/services/authService';

const authService = new AuthService();

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        twoFactorCode: { label: "2FA Code", type: "text", placeholder: "000000" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        // First step: validate email and password
        const user = await authService.validateUser(credentials.email, credentials.password);
        if (!user) return null;
        
        // If 2FA is enabled, we need to verify the 2FA code
        if (user.twoFactorEnabled) {
          // Check if 2FA code is provided
          if (!credentials.twoFactorCode) {
            // Return a special response indicating 2FA is required
            throw new Error('2FA_REQUIRED');
          }
          
          // Verify the 2FA token
          const isValid = await authService.verifyTwoFactorToken(user.id, credentials.twoFactorCode);
          if (!isValid) {
            // Try to verify as backup code
            const isBackupValid = await authService.verifyBackupCode(user.id, credentials.twoFactorCode);
            if (isBackupValid) {
              // Invalidate the used backup code
              await authService.invalidateBackupCode(user.id, credentials.twoFactorCode);
            } else {
              throw new Error('Invalid 2FA code');
            }
          }
        }
        
        return user;
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60, // 1 hour
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? process.env.NEXTAUTH_URL?.replace(/https?:\/\//, '') : undefined
      }
    },
    callbackUrl: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.callback-url' : 'next-auth.callback-url',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    },
    csrfToken: {
      name: process.env.NODE_ENV === 'production' ? '__Host-next-auth.csrf-token' : 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.permissions = user.permissions;
        token.tutorialCompleted = user.tutorialCompleted;
        token.twoFactorEnabled = user.twoFactorEnabled;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.permissions = token.permissions as string[];
        session.user.tutorialCompleted = token.tutorialCompleted as boolean;
        session.user.twoFactorEnabled = token.twoFactorEnabled as boolean;
      }
      return session;
    }
  },
  pages: {
    signIn: '/signin',
    error: '/signin', // Redirect to signin page on error
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };