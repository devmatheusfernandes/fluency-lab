'use server';

import { cookies } from 'next/headers';
import { encrypt, decrypt } from '@/lib/crypto/encryption';

/**
 * Serviço seguro para armazenamento temporário de dados do 2FA
 * Substitui o uso inseguro de sessionStorage por cookies criptografados
 */

const TWO_FA_COOKIE_NAME = '__Secure-2fa-temp';
const TWO_FA_EXPIRY = 10 * 60 * 1000; // 10 minutos

interface TwoFactorData {
  email: string;
  password: string;
  timestamp: number;
}

/**
 * Armazena dados temporários do 2FA de forma segura
 */
export async function storeTwoFactorData(email: string, password: string): Promise<void> {
  const data: TwoFactorData = {
    email,
    password,
    timestamp: Date.now()
  };

  // Criptografa os dados sensíveis
  const encryptedData = await encrypt(JSON.stringify(data));

  // Armazena em cookie seguro
  (await cookies()).set(TWO_FA_COOKIE_NAME, encryptedData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: TWO_FA_EXPIRY / 1000 // 10 minutos
  });
}

/**
 * Recupera dados temporários do 2FA
 */
export async function getTwoFactorData(): Promise<TwoFactorData | null> {
  try {
    const cookieStore = await cookies();
    const encryptedData = cookieStore.get(TWO_FA_COOKIE_NAME)?.value;

    if (!encryptedData) {
      return null;
    }

    // Descriptografa os dados
    const decryptedData = await decrypt(encryptedData);
    const data: TwoFactorData = JSON.parse(decryptedData);

    // Verifica se não expirou
    if (Date.now() - data.timestamp > TWO_FA_EXPIRY) {
      await clearTwoFactorData();
      return null;
    }

    return data;
  } catch (error) {
    console.error('Erro ao recuperar dados do 2FA:', error);
    await clearTwoFactorData();
    return null;
  }
}

/**
 * Remove dados temporários do 2FA
 */
export async function clearTwoFactorData(): Promise<void> {
  (await cookies()).delete(TWO_FA_COOKIE_NAME);
}

/**
 * Valida se existem dados válidos do 2FA
 */
export async function hasTwoFactorData(): Promise<boolean> {
  const data = await getTwoFactorData();
  return data !== null;
}