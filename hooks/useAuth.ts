'use client';

import { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { data: session } = useSession();

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    // This function calls the API of NextAuth securely
    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });
    
    setIsLoading(false);

    if (result?.error) {
      setError("Email ou senha inválidos.");
    } else if (result?.ok) {
      // Redirect to hub after successful login
      router.push('/hub'); 
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // This function calls the signup API via fetch
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Falha no cadastro.');
      }
      
      console.log('Conta criada com sucesso. Fazendo login automático...');
      const loginResult = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (loginResult?.ok) {
        // Redirect new students to hub where onboarding will be triggered automatically
        router.push('/hub/plataforma');
      } else {
        throw new Error('Conta criada, mas o login automático falhou. Por favor, faça login.');
      }

    } catch (err: any) {
      setError(err.message);
      if (err.message.includes('faça login')) {
        router.push('/signin');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user is authenticated
  const isAuthenticated = !!session?.user;

  return { login, signup, isLoading, error, isAuthenticated };
};