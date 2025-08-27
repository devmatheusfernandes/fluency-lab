// services/emailService.ts

import { Resend } from 'resend';
import { WelcomeEmail } from '@/emails/templates/WelcomeEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export class EmailService {
  async sendWelcomeAndSetPasswordEmail(email: string, name: string, actionLink: string) {
    try {
      await resend.emails.send({
        from: 'Acme <onboarding@resend.dev>',
      to: ['delivered@resend.dev'],
        subject: 'Bem-vindo(a) à Fluency Lab! Defina sua senha.',
        react: await WelcomeEmail({ name, actionLink }),
      });

      console.log(`E-mail de boas-vindas enviado para ${email}`);
    } catch (error) {
      console.error("Falha ao enviar e-mail de boas-vindas:", error);
      throw new Error("Usuário criado, mas falha ao enviar o e-mail de boas-vindas.");
    }
  }
}