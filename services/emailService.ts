// services/emailService.ts

import { Resend } from 'resend';
import { WelcomeEmail } from '@/emails/templates/WelcomeEmail';
import { ClassRescheduledEmail } from '@/emails/templates/ClassRescheduledEmail';
import { ClassCanceledEmail } from '@/emails/templates/ClassCanceledEmail';
import { TeacherVacationEmail } from '@/emails/templates/TeacherVacationEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

interface AffectedClass {
  date: string;
  time: string;
  language: string;
}

export class EmailService {
  async sendWelcomeAndSetPasswordEmail(email: string, name: string, actionLink: string) {
    try {
      await resend.emails.send({
        from: 'Matheus Fernandes <contato@matheusfernandes.me>',
        to: email,
        subject: 'Bem-vindo(a) à Fluency Lab! Defina sua senha.',
        react: await WelcomeEmail({ name, actionLink }),
      });

      console.log(`E-mail de boas-vindas enviado para ${email}`);
    } catch (error) {
      console.error("Falha ao enviar e-mail de boas-vindas:", error);
      throw new Error("Usuário criado, mas falha ao enviar o e-mail de boas-vindas.");
    }
  }

  async sendClassRescheduledEmail({
    email,
    recipientName,
    recipientType,
    className,
    originalDate,
    originalTime,
    newDate,
    newTime,
    reason,
    rescheduleBy,
    platformLink
  }: {
    email: string;
    recipientName: string;
    recipientType: "student" | "teacher";
    className: string;
    originalDate: string;
    originalTime: string;
    newDate: string;
    newTime: string;
    reason?: string;
    rescheduleBy: string;
    platformLink: string;
  }) {
    try {
      const subject = recipientType === "student" 
        ? "Sua aula foi reagendada - Fluency Lab"
        : "Aula reagendada - Fluency Lab";

      await resend.emails.send({
        from: 'Reagendamento <contato@matheusfernandes.me>',
        to: [email],
        subject,
        react: await ClassRescheduledEmail({
          recipientName,
          recipientType,
          className,
          originalDate,
          originalTime,
          newDate,
          newTime,
          reason,
          rescheduleBy,
          platformLink
        }),
      });

      console.log(`E-mail de reagendamento enviado para ${email}`);
    } catch (error) {
      console.error("Falha ao enviar e-mail de reagendamento:", error);
      throw new Error("Falha ao enviar o e-mail de reagendamento.");
    }
  }

  async sendClassCanceledEmail({
    email,
    recipientName,
    recipientType,
    className,
    scheduledDate,
    scheduledTime,
    canceledBy,
    reason,
    creditRefunded,
    platformLink
  }: {
    email: string;
    recipientName: string;
    recipientType: "student" | "teacher";
    className: string;
    scheduledDate: string;
    scheduledTime: string;
    canceledBy: string;
    reason?: string;
    creditRefunded?: boolean;
    platformLink: string;
  }) {
    try {
      const subject = recipientType === "student" 
        ? "Sua aula foi cancelada - Fluency Lab"
        : "Aula cancelada - Fluency Lab";

      await resend.emails.send({
        from: 'Cancelamento <contato@matheusfernandes.me>',
        to: [email],
        subject,
        react: await ClassCanceledEmail({
          recipientName,
          recipientType,
          className,
          scheduledDate,
          scheduledTime,
          canceledBy,
          reason,
          creditRefunded,
          platformLink
        }),
      });

      console.log(`E-mail de cancelamento enviado para ${email}`);
    } catch (error) {
      console.error("Falha ao enviar e-mail de cancelamento:", error);
      throw new Error("Falha ao enviar o e-mail de cancelamento.");
    }
  }

  async sendTeacherVacationEmail({
    email,
    studentName,
    teacherName,
    vacationStartDate,
    vacationEndDate,
    affectedClasses,
    platformLink
  }: {
    email: string;
    studentName: string;
    teacherName: string;
    vacationStartDate: string;
    vacationEndDate: string;
    affectedClasses: AffectedClass[];
    platformLink: string;
  }) {
    try {
      await resend.emails.send({
        from: 'Férias <contato@matheusfernandes.me>',
        to: [email],
        subject: 'Suas aulas foram afetadas por férias do professor - Fluency Lab',
        react: await TeacherVacationEmail({
          studentName,
          teacherName,
          vacationStartDate,
          vacationEndDate,
          affectedClasses,
          platformLink
        }),
      });

      console.log(`E-mail de férias do professor enviado para ${email}`);
    } catch (error) {
      console.error("Falha ao enviar e-mail de férias do professor:", error);
      throw new Error("Falha ao enviar o e-mail de férias do professor.");
    }
  }
}