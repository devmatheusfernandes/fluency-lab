'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function switchLocale(locale: string, path: string) {
  // Define o cookie com o novo idioma usando configurações seguras
  (await cookies()).set('locale', locale, {
    httpOnly: false, // Precisa ser acessível pelo client para mudança de idioma
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 365 * 24 * 60 * 60 // 1 ano
  });
  // Redireciona para o mesmo caminho para que a página recarregue com o novo idioma
  redirect(path);
}