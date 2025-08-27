'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function switchLocale(locale: string, path: string) {
  // Define o cookie com o novo idioma
  (await
        // Define o cookie com o novo idioma
        cookies()).set('locale', locale);
  // Redireciona para o mesmo caminho para que a página recarregue com o novo idioma
  redirect(path);
}