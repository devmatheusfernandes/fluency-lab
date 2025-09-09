// services/schedulingService.ts

import { adminDb } from "@/lib/firebase/admin";
import { AvailabilityRepository } from "@/repositories/availabilityRepository";
import { ClassRepository } from "@/repositories/classRepository";
import { UserAdminRepository } from "@/repositories/user.admin.repository";
import {
  ClassStatus,
  ClassTemplate,
  FullClassDetails,
  PopulatedStudentClass,
  StudentClass,
} from "@/types/classes/class";
import { AvailabilitySlot, AvailabilityType } from "@/types/time/availability";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { classTemplateRepository } from "@/repositories/ClassTemplateRepository";
import { daysOfWeek } from "@/types/time/times";
import { User } from "@/types/users/users";
import { Vacation } from "@/types/time/vacation";
import { vacationRepository } from "@/repositories/VacationRepository";
import { userRepository } from "@/repositories/userRepository";
import { EmailService } from "@/services/emailService";
import { CreditService } from "@/services/creditService";
import { RegularCreditType } from "@/types/credits/regularClassCredits";

const availabilityRepository = new AvailabilityRepository();
const classRepository = new ClassRepository();
const userAdminRepository = new UserAdminRepository(); // Instancie o repo de admin
const userAdminRepo = new UserAdminRepository();
const emailService = new EmailService();
const creditService = new CreditService();

export class SchedulingService {
  async addTeacherAvailability(
    slot: AvailabilitySlot
  ): Promise<AvailabilitySlot> {
    // Validação de término > início (já existe)
    if (slot.startTime >= slot.endTime) {
      throw new Error(
        "O horário de término deve ser após o horário de início."
      );
    }

    const existingSlots = await availabilityRepository.findByTeacherId(
      slot.teacherId
    );

    // Filtra para encontrar conflitos no mesmo dia da semana
    const hasConflict = existingSlots.some((existing) => {
      // Only check for conflicts if both slots are repeating with the same type
      if (slot.repeating && existing.repeating) {
        if (existing.repeating.type !== slot.repeating.type) return false;
        if (
          new Date(existing.startDate).getDay() !==
          new Date(slot.startDate).getDay()
        )
          return false;

        // Verifica se há sobreposição de horários (newStart < oldEnd AND newEnd > oldStart)
        return (
          slot.startTime < existing.endTime && slot.endTime > existing.startTime
        );
      } 
      // If one or both slots are not repeating, check for exact date conflicts
      else if (!slot.repeating && !existing.repeating) {
        // Check if they're on the same date
        const existingDate = new Date(existing.startDate);
        const newDate = new Date(slot.startDate);
        
        // Compare year, month, and day
        if (existingDate.getFullYear() !== newDate.getFullYear() ||
            existingDate.getMonth() !== newDate.getMonth() ||
            existingDate.getDate() !== newDate.getDate()) {
          return false;
        }
        
        // Verifica se há sobreposição de horários (newStart < oldEnd AND newEnd > oldStart)
        return (
          slot.startTime < existing.endTime && slot.endTime > existing.startTime
        );
      }
      // If one is repeating and the other is not, no conflict
      return false;
    });

    if (hasConflict) {
      throw new Error(
        "Conflito de horário. Você já tem um horário disponível que se sobrepõe a este."
      );
    }

    return await availabilityRepository.create(slot);
  }

  async getTeacherAvailability(teacherId: string) {
    const [slots, exceptions, bookedClasses] = await Promise.all([
      availabilityRepository.findByTeacherId(teacherId),
      availabilityRepository.findExceptionsByTeacherId(teacherId),
      classRepository.findClassesByTeacherId(teacherId),
    ]);

    // Populate student information for booked classes
    let populatedBookedClasses = bookedClasses;
    if (bookedClasses.length > 0) {
      // Get unique student IDs from booked classes
      const studentIds = [...new Set(bookedClasses.map(cls => cls.studentId))];
      
      // Fetch student information in batch
      const students = await userAdminRepository.findUsersByIds(studentIds);
      
      // Create a map for efficient lookup
      const studentMap = new Map(students.map(s => [s.id, s]));
      
      // Enhance booked classes with student information
      populatedBookedClasses = bookedClasses.map(cls => {
        const student = studentMap.get(cls.studentId);
        return {
          ...cls,
          studentName: student?.name,
          studentAvatarUrl: student?.avatarUrl,
        } as any; 
      });
    }

    // 👇 ADICIONE ESTE LOG
    console.log(`[SERVIÇO] Dados recebidos para o professor ${teacherId}:`, {
      slots: slots.length,
      exceptions: exceptions.length,
      bookedClasses: populatedBookedClasses.length,
    });

    return { slots, exceptions, bookedClasses: populatedBookedClasses };
  }

  async deleteTeacherAvailability(
    slotId: string,
    teacherId: string,
    deleteType: "single" | "future",
    occurrenceDate: Date
  ) {
    const slot = await availabilityRepository.findById(slotId);
    if (!slot || slot.teacherId !== teacherId) {
      throw new Error("Disponibilidade não encontrada ou não autorizada.");
    }

    if (!slot.repeating) {
      await availabilityRepository.deleteById(slotId);
      return;
    }

    if (deleteType === "future") {
      const previousDay = new Date(occurrenceDate);
      previousDay.setDate(occurrenceDate.getDate() - 1);

      if (previousDay < new Date(slot.startDate)) {
        await availabilityRepository.deleteById(slotId);
      } else {
        const updatedRepeating = { ...slot.repeating, endDate: previousDay };
        await availabilityRepository.update(slotId, {
          repeating: updatedRepeating,
        });
      }
    } else if (deleteType === "single") {
      // Combine the occurrence date with the slot's start time for proper exception creation
      const [hours, minutes] = slot.startTime.split(':').map(Number);
      const exceptionDate = new Date(occurrenceDate);
      exceptionDate.setHours(hours, minutes, 0, 0);
      
      await availabilityRepository.createException(
        slotId,
        teacherId,
        exceptionDate
      );
    }
  }

  async bookClass(
    studentId: string,
    teacherId: string,
    slotId: string,
    scheduledAt: Date,
    classTopic?: string
  ) {
    // === BUSCA DE CONFIGURAÇÕES (ANTES DA TRANSAÇÃO) ===
    const teacher = await userAdminRepository.findUserById(teacherId);
    const settings = teacher?.schedulingSettings || {};

    // === VALIDAÇÕES DAS REGRAS DE NEGÓCIO (ANTES DA TRANSAÇÃO) ===
    const now = new Date();

    // Regra 1: Antecedência Mínima para Agendamento
    const leadTimeHours = settings.bookingLeadTimeHours || 24; // Padrão: 24 horas
    const earliestBookingTime = new Date(
      now.getTime() + leadTimeHours * 60 * 60 * 1000
    );

    if (scheduledAt < earliestBookingTime) {
      throw new Error(
        `As aulas devem ser agendadas com pelo menos ${leadTimeHours} horas de antecedência.`
      );
    }

    // Regra 3: Horizonte de Agendamento
    const horizonDays = settings.bookingHorizonDays || 30; // Padrão: 30 dias
    const latestBookingDate = new Date(
      now.getTime() + horizonDays * 24 * 60 * 60 * 1000
    );

    if (scheduledAt > latestBookingDate) {
      throw new Error(
        `As aulas só podem ser agendadas para os próximos ${horizonDays} dias.`
      );
    }

    // === INÍCIO DA TRANSAÇÃO ===
    return adminDb.runTransaction(async (transaction) => {
      const studentRef = adminDb.collection("users").doc(studentId);

      const studentDoc = await transaction.get(studentRef);
      if (!studentDoc.exists || (studentDoc.data()?.classCredits || 0) < 1) {
        throw new Error("Créditos de aula insuficientes.");
      }

      const existingClassQuery =
        await classRepository.findClassByTeacherAndDateWithTransaction(
          transaction,
          teacherId,
          scheduledAt
        );
      if (!existingClassQuery.empty) {
        throw new Error("Desculpe, este horário já foi agendado.");
      }

      // Regra 5: Limite de Aulas Avulsas por Dia (DENTRO da transação)
      const maxClasses = settings.maxOccasionalClassesPerDay;
      if (maxClasses && maxClasses > 0) {
        const dailyClassCount =
          await classRepository.countClassesOnDateForTeacher(
            transaction,
            teacherId,
            scheduledAt
          );
        if (dailyClassCount >= maxClasses) {
          throw new Error(
            "Este professor atingiu o limite de aulas para este dia. Por favor, escolha outra data."
          );
        }
      }

      // Se todas as validações passaram, cria a aula
      const newClassData: Omit<StudentClass, "id"> = {
        studentId,
        teacherId,
        availabilitySlotId: slotId,
        scheduledAt,
        durationMinutes: 45,
        status: ClassStatus.SCHEDULED,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: studentId,
        language: "", //IMPLEMENTAR DEPOIS O OCCASIONAL PODER ESCOLHER UM IDIOMA
        classType: "occasional",
      };
      if (classTopic) newClassData.notes = classTopic;

      classRepository.createWithTransaction(transaction, newClassData);
      transaction.update(studentRef, {
        classCredits: FieldValue.increment(-1),
      });
      availabilityRepository.createExceptionWithTransaction(
        transaction,
        slotId,
        teacherId,
        scheduledAt
      );

      return { success: true, classData: newClassData };
    });
  }

  // 👇 MÉTODO APRIMORADO PARA CANCELAMENTO COM SUGESTÃO DE REAGENDAMENTO
  async cancelClassByStudent(studentId: string, classId: string) {
    const classRef = adminDb.collection("classes").doc(classId);
    const studentRef = adminDb.collection("users").doc(studentId);

    const classDoc = await classRef.get();
    if (!classDoc.exists || classDoc.data()?.studentId !== studentId) {
      throw new Error("Aula não encontrada ou não pertence a este aluno.");
    }

    const classData = classDoc.data() as StudentClass;
    const teacher = classData.teacherId 
      ? await userAdminRepository.findUserById(classData.teacherId) 
      : null;
    const settings = teacher?.schedulingSettings || {};

    const cancellationHours = settings.cancellationPolicyHours || 24;
    const now = new Date();
    const scheduledAt = (classData.scheduledAt as any).toDate();
    const hoursBeforeClass =
      (scheduledAt.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Verificar se o aluno tem reagendamentos disponíveis
    const rescheduleCheck = await this.canReschedule(studentId);
    const hasReschedulesLeft = rescheduleCheck.allowed;

    // Se cancelou com antecedência...
    if (hoursBeforeClass > cancellationHours) {
      // Atualiza o status da aula
      await classRef.update({ status: ClassStatus.CANCELED_STUDENT });
      // Devolve o crédito ao aluno
      await studentRef.update({ classCredits: FieldValue.increment(1) });

      // 👇 A PEÇA QUE FALTAVA: Remove a exceção para liberar o horário
      if (classData.availabilitySlotId) {
        await availabilityRepository.findAndDeleteException(
          classData.availabilitySlotId,
          scheduledAt
        );
      }

      // --- ENVIAR NOTIFICAÇÕES POR E-MAIL ---
      try {
        const promises = [
          userAdminRepository.findUserById(studentId)
        ];
        
        if (classData.teacherId) {
          promises.push(userAdminRepository.findUserById(classData.teacherId));
        }
        
        const results = await Promise.all(promises);
        const student = results[0];
        const teacher = classData.teacherId ? results[1] : null;

        if (student && teacher) {
          const formatDate = (date: Date) => date.toLocaleDateString('pt-BR');
          const formatTime = (date: Date) => date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
          const className = `${classData.language} - ${classData.classType === 'regular' ? 'Aula Regular' : 'Aula Avulsa'}`;
          const platformLink = process.env.NEXT_PUBLIC_APP_URL || 'https://app.fluencylab.com';

          // Enviar e-mail para o estudante
          await emailService.sendClassCanceledEmail({
            email: student.email,
            recipientName: student.name,
            recipientType: "student",
            className,
            scheduledDate: formatDate(scheduledAt),
            scheduledTime: formatTime(scheduledAt),
            canceledBy: student.name,
            creditRefunded: true,
            platformLink: `${platformLink}/hub/plataforma/student/my-class`
          });

          // Enviar e-mail para o professor
          await emailService.sendClassCanceledEmail({
            email: teacher.email,
            recipientName: teacher.name,
            recipientType: "teacher",
            className,
            scheduledDate: formatDate(scheduledAt),
            scheduledTime: formatTime(scheduledAt),
            canceledBy: student.name,
            platformLink: `${platformLink}/hub/plataforma/teacher/my-classes`
          });

          console.log(`E-mails de cancelamento enviados para estudante (${student.email}) e professor (${teacher.email})`);
        }
      } catch (emailError) {
        console.error('Erro ao enviar e-mails de cancelamento:', emailError);
        // Não falha a operação se o e-mail falhar, apenas loga o erro
      }

      return {
        success: true,
        message: "Aula cancelada com sucesso! Seu crédito foi devolvido e o horário está livre novamente.",
        suggestReschedule: hasReschedulesLeft,
        rescheduleInfo: hasReschedulesLeft ? {
          remainingReschedules: rescheduleCheck.limit - rescheduleCheck.count,
          message: `Você ainda tem ${rescheduleCheck.limit - rescheduleCheck.count} reagendamento(s) disponível(is) este mês. Deseja reagendar ao invés de cancelar?`
        } : null
      };
    } else {
      // Se cancelou em cima da hora, não devolve o crédito e não libera o horário
      await classRef.update({ status: ClassStatus.CANCELED_STUDENT });

      // --- ENVIAR NOTIFICAÇÕES POR E-MAIL (sem devolução de crédito) ---
      try {
        const promises = [
          userAdminRepository.findUserById(studentId)
        ];
        
        if (classData.teacherId) {
          promises.push(userAdminRepository.findUserById(classData.teacherId));
        }
        
        const results = await Promise.all(promises);
        const student = results[0];
        const teacher = classData.teacherId ? results[1] : null;

        if (student && teacher) {
          const formatDate = (date: Date) => date.toLocaleDateString('pt-BR');
          const formatTime = (date: Date) => date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
          const className = `${classData.language} - ${classData.classType === 'regular' ? 'Aula Regular' : 'Aula Avulsa'}`;
          const platformLink = process.env.NEXT_PUBLIC_APP_URL || 'https://app.fluencylab.com';

          // Enviar e-mail para o estudante
          await emailService.sendClassCanceledEmail({
            email: student.email,
            recipientName: student.name,
            recipientType: "student",
            className,
            scheduledDate: formatDate(scheduledAt),
            scheduledTime: formatTime(scheduledAt),
            canceledBy: student.name,
            reason: "Cancelamento fora do prazo permitido",
            creditRefunded: false,
            platformLink: `${platformLink}/hub/plataforma/student/my-class`
          });

          // Enviar e-mail para o professor
          await emailService.sendClassCanceledEmail({
            email: teacher.email,
            recipientName: teacher.name,
            recipientType: "teacher",
            className,
            scheduledDate: formatDate(scheduledAt),
            scheduledTime: formatTime(scheduledAt),
            canceledBy: student.name,
            reason: "Cancelamento fora do prazo permitido",
            platformLink: `${platformLink}/hub/plataforma/teacher/my-classes`
          });

          console.log(`E-mails de cancelamento (sem crédito) enviados para estudante (${student.email}) e professor (${teacher.email})`);
        }
      } catch (emailError) {
        console.error('Erro ao enviar e-mails de cancelamento:', emailError);
        // Não falha a operação se o e-mail falhar, apenas loga o erro
      }

      return {
        success: true,
        message: "Aula cancelada. O cancelamento fora do prazo não devolve o crédito.",
        suggestReschedule: false,
        rescheduleInfo: null
      };
    }
  }

    /**
   * Cancela uma aula pelo professor, marcando-a como makeup class se permitir reagendamento.
   * @param teacherId O ID do professor que está cancelando.
   * @param classId O ID da aula a ser cancelada.
   * @param reason (Opcional) Motivo do cancelamento.
   * @param allowMakeup Se deve permitir que o aluno reagende como makeup class.
   */
  async cancelClassByTeacher(
    teacherId: string, 
    classId: string, 
    reason?: string, 
    allowMakeup: boolean = true
  ) {
    console.log(`[cancelClassByTeacher] Starting cancellation process for class ${classId} by teacher ${teacherId}`);
    
    const classRef = adminDb.collection("classes").doc(classId);

    const classDoc = await classRef.get();
    if (!classDoc.exists || classDoc.data()?.teacherId !== teacherId) {
      throw new Error("Aula não encontrada ou não pertence a este professor.");
    }

    const classData = classDoc.data() as StudentClass;
    const scheduledAt = (classData.scheduledAt as any).toDate();
    
    console.log(`[cancelClassByTeacher] Class data retrieved:`, { 
      classId, 
      studentId: classData.studentId, 
      teacherId: classData.teacherId,
      scheduledAt 
    });

    // Determinar o status baseado na permissão de makeup
    const newStatus = allowMakeup ? ClassStatus.CANCELED_TEACHER_MAKEUP : ClassStatus.CANCELED_TEACHER;
    console.log(`[cancelClassByTeacher] New status will be: ${newStatus}`);
    
    // Atualizar a aula
    await classRef.update({ 
      status: newStatus,
      canceledAt: new Date(),
      canceledBy: "teacher",
      reason: reason
    });
    console.log(`[cancelClassByTeacher] Class status updated in database`);

    // Liberar o horário removendo a exceção
    if (classData.availabilitySlotId) {
      await availabilityRepository.findAndDeleteException(
        classData.availabilitySlotId,
        scheduledAt
      );
      console.log(`[cancelClassByTeacher] Availability exception deleted`);
    }

    // Se for cancelamento com reposição, conceder crédito automático ao aluno
    if (newStatus === ClassStatus.CANCELED_TEACHER_MAKEUP) {
      try {
        console.log(`[cancelClassByTeacher] Granting makeup credit to student ${classData.studentId}`);
        // Conceder crédito de reposição ao aluno
        const creditService = new CreditService();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 45); // 45 dias de expiração
        
        await creditService.grantCredits({
          studentId: classData.studentId,
          type: RegularCreditType.TEACHER_CANCELLATION, // Usar o novo tipo de crédito para cancelamentos do professor
          amount: 1,
          expiresAt: expiresAt,
          reason: `Crédito de reposição por cancelamento do professor em ${new Date().toLocaleDateString('pt-BR')}`
        }, teacherId); // teacherId como quem concedeu o crédito
        console.log(`[cancelClassByTeacher] Makeup credit granted successfully`);
      } catch (error) {
        console.error("Erro ao conceder crédito de reposição:", error);
        // Não falha a operação se o crédito falhar, apenas loga o erro
      }
    }

    // --- ENVIAR NOTIFICAÇÕES POR E-MAIL ---
    try {
      console.log(`[cancelClassByTeacher] Fetching user data for email notifications`);
      const [student, teacher] = await Promise.all([
        userAdminRepository.findUserById(classData.studentId),
        userAdminRepository.findUserById(teacherId)
      ]);
      
      console.log(`[cancelClassByTeacher] User data fetched:`, { 
        student: student ? `${student.name} (${student.email})` : 'not found',
        teacher: teacher ? `${teacher.name} (${teacher.email})` : 'not found'
      });

      if (student && teacher) {
        const formatDate = (date: Date) => date.toLocaleDateString('pt-BR');
        const formatTime = (date: Date) => date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const className = `${classData.language} - ${classData.classType === 'regular' ? 'Aula Regular' : 'Aula Avulsa'}`;
        const platformLink = process.env.NEXT_PUBLIC_APP_URL || 'https://app.fluencylab.com';

        const emailReason = reason || "Cancelamento pelo professor";
        const makeupMessage = allowMakeup 
          ? " Você pode reagendar esta aula como reposição sem usar seus reagendamentos mensais. Um crédito foi concedido para uso em até 45 dias."
          : "";

        console.log(`[cancelClassByTeacher] Sending emails to student and teacher`);
        // Enviar e-mail para o estudante
        await emailService.sendClassCanceledEmail({
          email: student.email,
          recipientName: student.name,
          recipientType: "student",
          className,
          scheduledDate: formatDate(scheduledAt),
          scheduledTime: formatTime(scheduledAt),
          canceledBy: teacher.name,
          reason: emailReason + makeupMessage,
          creditRefunded: true, // Professor cancellations always refund
          makeupCreditGranted: newStatus === ClassStatus.CANCELED_TEACHER_MAKEUP, // Add this parameter
          platformLink: `${platformLink}/hub/plataforma/student/my-class`
        });

        // Enviar e-mail para o professor (confirmação)
        await emailService.sendClassCanceledEmail({
          email: teacher.email,
          recipientName: teacher.name,
          recipientType: "teacher",
          className,
          scheduledDate: formatDate(scheduledAt),
          scheduledTime: formatTime(scheduledAt),
          canceledBy: teacher.name,
          reason: emailReason,
          makeupCreditGranted: newStatus === ClassStatus.CANCELED_TEACHER_MAKEUP, // Add this parameter
          platformLink: `${platformLink}/hub/plataforma/teacher/my-classes`
        });
        
        console.log(`[cancelClassByTeacher] E-mails de cancelamento enviados para estudante (${student.email}) e professor (${teacher.email})`);
      } else {
        console.log(`[cancelClassByTeacher] Could not send emails - missing user data`, { 
          studentExists: !!student, 
          teacherExists: !!teacher 
        });
      }
    } catch (error) {
      console.error("[cancelClassByTeacher] Erro ao enviar e-mails de cancelamento:", error);
      // Não falha a operação se o e-mail falhar, apenas loga o erro
    }

    return {
      success: true,
      message: "Aula cancelada. O cancelamento fora do prazo não devolve o crédito.",
      suggestReschedule: false,
      rescheduleInfo: null
    };
  }
  /**
   * Busca os detalhes completos de uma aula, incluindo os perfis do
   * aluno e do professor, e verifica a autorização.
   */
  async getClassDetails(
    classId: string,
    currentUserId: string
  ): Promise<FullClassDetails | null> {
    const classData = await classRepository.findClassById(classId);
    if (!classData) return null;

    const sessionUser = await userAdminRepository.findUserById(currentUserId);
    if (!sessionUser) throw new Error("Usuário da sessão não encontrado.");

    const isParticipant =
      classData.studentId === currentUserId ||
      classData.teacherId === currentUserId;
    const isAdminOrManager =
      sessionUser.role === "admin" || sessionUser.role === "manager";

    if (!isParticipant && !isAdminOrManager) {
      throw new Error("Acesso não autorizado a esta aula.");
    }

    // Otimização: Vamos reutilizar os dados que já buscamos
    let student = classData.studentId === currentUserId ? sessionUser : null;
    let teacher = classData.teacherId === currentUserId ? sessionUser : null;

    // Busca apenas os perfis que ainda não temos
    const promises = [];
    if (!student)
      promises.push(userAdminRepository.findUserById(classData.studentId));
    if (!teacher && classData.teacherId)
      promises.push(userAdminRepository.findUserById(classData.teacherId));

    const results = await Promise.all(promises);

    // Atribui os resultados
    if (!student) student = results.shift() || null;
    if (!teacher) teacher = results.shift() || null;

    if (!student || (classData.teacherId && !teacher)) {
      throw new Error(
        "Não foi possível encontrar os perfis do aluno ou do professor."
      );
    }

    // Create the result object with proper typing
    const result: FullClassDetails = {
      ...classData,
      student,
    };

    // Only add teacher if it exists
    if (teacher) {
      result.teacher = teacher;
    }

    return result;
  }

/**
   * Gera as aulas de um aluno para todo o período de contrato com base em seu template.
   * @param studentId - O ID do aluno.
   */
  async generateClassesFromTemplate(studentId: string): Promise<void> {
    // 1. Buscar os dados do aluno e do template
    const student = await userRepository.findById(studentId);
    const template = await classTemplateRepository.get(studentId);
    const hasExistingClasses = await classRepository.hasFutureScheduledClasses(studentId);
    if (hasExistingClasses) {
      throw new Error("Este aluno já possui aulas futuras geradas. Para alterar o cronograma, modifique o template e salve as alterações. As aulas serão ajustadas automaticamente.");
    }
    // 2. Validar se os dados necessários existem
    if (!student) {
      throw new Error(`Aluno com ID ${studentId} não encontrado.`);
    }
    if (!student.contractStartDate || !student.contractLengthMonths) {
      throw new Error(`O aluno ${studentId} não possui data de início ou duração de contrato definidas.`);
    }
    
    // Validar se contractStartDate é uma data válida
    const contractStartDate = new Date(student.contractStartDate);
    if (isNaN(contractStartDate.getTime())) {
      throw new Error(`A data de início do contrato para o aluno ${studentId} é inválida.`);
    }
    
    if (!template || !template.days || template.days.length === 0) {
      throw new Error(`Nenhum template de horário encontrado para o aluno ${studentId}.`);
    }

    // 3. Calcular o período de geração das aulas de forma segura
    const startDateString = contractStartDate.toISOString().split('T')[0];
    const [year, month, day] = startDateString.split('-').map(Number);
    const startDate = new Date(year, month - 1, day);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + student.contractLengthMonths);

    // 4. Gerar as instâncias de aula
    const classesToCreate: Omit<StudentClass, 'id'>[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayIndex = currentDate.getDay();
      const dayName = daysOfWeek[dayIndex];
      const templateDaysForCurrentDay = template.days.filter(d => d.day === dayName);

      for (const templateDay of templateDaysForCurrentDay) {
        const [hour, minute] = templateDay.hour.split(':').map(Number);
        
        const scheduledAt = new Date(currentDate);
        scheduledAt.setHours(hour, minute, 0, 0);

        // =================================================================
        // ▼▼▼ A CONDIÇÃO "if (scheduledAt >= new Date())" FOI REMOVIDA DAQUI ▼▼▼
        // =================================================================
        // O sistema agora irá gerar todas as aulas a partir da data de início do contrato,
        // independentemente de ser uma data no passado.

        const newClass: Omit<StudentClass, 'id'> = {
          studentId: student.id,
          teacherId: templateDay.teacherId,
          language: templateDay.language,
          scheduledAt,
          durationMinutes: 50,
          status: ClassStatus.SCHEDULED,
          createdBy: 'system',
          classType: 'regular',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        classesToCreate.push(newClass);
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // 5. Salvar todas as aulas geradas no banco de dados
    if (classesToCreate.length > 0) {
      await classRepository.batchCreate(classesToCreate);
    }
  }

  /**
   * Verifica se um aluno ainda pode reagendar aulas no mês corrente.
   * Inclui lógica especial para aulas canceladas pelo professor (makeup classes).
   * @param studentId O ID do aluno.
   * @param classId (Opcional) ID da aula específica sendo reagendada para verificar se é makeup.
   * @returns Um objeto indicando se o reagendamento é permitido, a contagem atual e o limite.
   */
  async canReschedule(
    studentId: string,
    classId?: string
  ): Promise<{ allowed: boolean; count: number; limit: number; isTeacherMakeup?: boolean }> {
    const student = await userAdminRepository.findUserById(studentId);
    if (!student) {
      throw new Error("Aluno não encontrado para verificar reagendamentos.");
    }

    // Se é uma aula específica, verificar se é makeup de cancelamento do professor
    if (classId) {
      const classData = await classRepository.findClassById(classId);
      if (classData) {
        // Check if it's a teacher makeup class
        if (classData.status === ClassStatus.CANCELED_TEACHER_MAKEUP) {
          const canceledDate = new Date(classData.scheduledAt);
          const canceledMonth = canceledDate.getMonth();
          const canceledYear = canceledDate.getFullYear();
          const now = new Date();
          const currentMonth = now.getMonth();
          const currentYear = now.getFullYear();
          
          // Verificar se pode reagendar no mês do cancelamento ou próximo mês
          // Se cancelado na última semana do mês, pode reagendar no próximo mês
          const lastWeekOfMonth = new Date(canceledYear, canceledMonth + 1, 0);
          const daysDifference = (lastWeekOfMonth.getTime() - canceledDate.getTime()) / (1000 * 60 * 60 * 24);
          const isLastWeek = daysDifference <= 7;
          
          const canRescheduleInCurrentMonth = (canceledYear === currentYear && canceledMonth === currentMonth);
          const canRescheduleInNextMonth = isLastWeek && 
            ((canceledYear === currentYear && currentMonth === canceledMonth + 1) ||
             (canceledYear === currentYear - 1 && canceledMonth === 11 && currentMonth === 0));
          
          if (canRescheduleInCurrentMonth || canRescheduleInNextMonth) {
            return {
              allowed: true,
              count: 0, // Makeup classes don't count against normal limit
              limit: 999, // Effectively unlimited for makeup
              isTeacherMakeup: true
            };
          } else {
            throw new Error("O prazo para reagendar esta aula de reposição expirou. Aulas canceladas pelo professor podem ser reagendadas apenas no mês do cancelamento (ou no mês seguinte se canceladas na última semana).");
          }
        }

        // Check if it's a credit-based class (bonus or late-students)
        if (classData.creditId && classData.creditType) {
          throw new Error(`Aulas criadas com créditos de ${classData.creditType === 'bonus' ? 'bônus' : 'estudantes tardios'} não podem ser reagendadas.`);
        }

        // Check if class is explicitly marked as non-reschedulable
        if (classData.isReschedulable === false) {
          throw new Error("Esta aula não pode ser reagendada.");
        }
      }
    }

    // Lógica normal para reagendamentos regulares
    const limit = 2; // Limite de 2 reagendamentos por mês
    const currentMonthStr = new Date().toISOString().slice(0, 7); // Formato "YYYY-MM"

    const monthlyData = student.monthlyReschedules?.find(
      (m) => m.month === currentMonthStr
    );
    const currentCount = monthlyData?.count || 0;

    return {
      allowed: currentCount < limit,
      count: currentCount,
      limit,
    };
  }

  /**
   * Executa a lógica de reagendamento de uma aula.
   * Altera o status da aula original e cria uma nova aula na data desejada.
   */
  async rescheduleClass(params: {
    classId: string;
    reschedulerId: string; // Quem está pedindo (aluno, professor, admin)
    newScheduledAt: Date;
    reason?: string;
    availabilitySlotId?: string; // Se o aluno escolheu um horário vago do professor
  }) {
    const {
      classId,
      reschedulerId,
      newScheduledAt,
      reason,
      availabilitySlotId,
    } = params;

    const originalClass = await classRepository.findClassById(classId);
    const rescheduler = await userAdminRepository.findUserById(reschedulerId);

    // --- Validações Iniciais ---
    if (!originalClass) throw new Error("Aula original não encontrada.");
    if (!rescheduler)
      throw new Error("Usuário que está reagendando não foi encontrado.");

    const isStudentRescheduling = rescheduler.id === originalClass.studentId;
    const isTeacherRescheduling = rescheduler.id === originalClass.teacherId;
    const isAdminRescheduling =
      rescheduler.role === "admin" || rescheduler.role === "manager";

    if (
      !isStudentRescheduling &&
      !isTeacherRescheduling &&
      !isAdminRescheduling
    ) {
      throw new Error("Usuário não autorizado para reagendar esta aula.");
    }

    if (
      originalClass.status !== ClassStatus.SCHEDULED &&
      originalClass.status !== ClassStatus.NO_SHOW &&
      originalClass.status !== ClassStatus.CANCELED_TEACHER_MAKEUP
    ) {
      throw new Error(
        "Apenas aulas agendadas, marcadas como falta ou aulas de reposição podem ser reagendadas."
      );
    }

    // Check if it's a credit-based class that cannot be rescheduled
    if (originalClass.creditId && originalClass.isReschedulable === false) {
      throw new Error(
        `Aulas criadas com créditos de ${originalClass.creditType === 'bonus' ? 'bônus' : 'estudantes tardios'} não podem ser reagendadas.`
      );
    }

    // --- Lógica Específica para Alunos ---
    if (isStudentRescheduling) {
      const check = await this.canReschedule(reschedulerId, classId);
      if (!check.allowed) {
        if (check.isTeacherMakeup) {
          // This error is already thrown in canReschedule for expired makeup classes
        } else {
          throw new Error(
            "Você atingiu o limite de 2 reagendamentos para este mês."
          );
        }
      }

      const teacher = originalClass.teacherId
        ? await userAdminRepository.findUserById(originalClass.teacherId)
        : null;
      const settings = teacher?.schedulingSettings || {};
      const now = new Date();

      // Regra 1: Antecedência Mínima para Agendamento
      const leadTimeHours = settings.bookingLeadTimeHours || 24; // Padrão: 24 horas
      const earliestBookingTime = new Date(
        now.getTime() + leadTimeHours * 60 * 60 * 1000
      );

      if (newScheduledAt < earliestBookingTime) {
        throw new Error(
          `As aulas devem ser reagendadas com pelo menos ${leadTimeHours} horas de antecedência.`
        );
      }

      // Regra 3: Horizonte de Agendamento
      const horizonDays = settings.bookingHorizonDays || 30; // Padrão: 30 dias
      const latestBookingDate = new Date(
        now.getTime() + horizonDays * 24 * 60 * 60 * 1000
      );

      if (newScheduledAt > latestBookingDate) {
        throw new Error(
          `As aulas só podem ser reagendadas para os próximos ${horizonDays} dias.`
        );
      }
    }

    // --- EXECUÇÃO ATÔMICA NO BANCO DE DADOS ---
    const result = await adminDb.runTransaction(async (transaction) => {
      const studentRef = adminDb
        .collection("users")
        .doc(originalClass.studentId);
      const originalClassRef = adminDb.collection("classes").doc(classId);

      // IMPORTANT: All reads must be done first in Firestore transactions
      let studentDoc = null;
      let studentData = null;
      if (isStudentRescheduling) {
        studentDoc = await transaction.get(studentRef);
        studentData = studentDoc.data() as User;
      }

      // Check if this is a makeup class (teacher cancellation) and find an available teacher cancellation credit
      const isTeacherMakeup = originalClass.status === ClassStatus.CANCELED_TEACHER_MAKEUP;
      let creditToUse: any = null;
      
      if (isTeacherMakeup && isStudentRescheduling) {
        // Find an available teacher cancellation credit for this student
        const creditService = new CreditService();
        creditToUse = await creditService.findAvailableCredit(
          originalClass.studentId, 
          RegularCreditType.TEACHER_CANCELLATION
        );
        
        if (!creditToUse) {
          throw new Error(
            "Você não possui créditos de reposição disponíveis para reagendar esta aula. Verifique se seus créditos ainda estão válidos."
          );
        }
      }

      // Now perform all writes
      // 1. Marcar a aula original como reagendada
      transaction.update(originalClassRef, { status: ClassStatus.RESCHEDULED });

      // 2. Criar a nova aula
      const newClassData: Omit<StudentClass, "id"> = {
        ...originalClass, // Copia a maioria dos dados
        scheduledAt: newScheduledAt,
        status: ClassStatus.SCHEDULED,
        createdAt: new Date(), // A nova aula tem sua própria data de criação
        updatedAt: new Date(),
        rescheduledFrom: {
          originalClassId: originalClass.id,
          originalScheduledAt: originalClass.scheduledAt,
        },
        rescheduleReason: reason,
        availabilitySlotId: availabilitySlotId, // Associa ao slot de disponibilidade, se aplicável
        // If using a teacher cancellation credit, mark the new class with credit info
        ...(isTeacherMakeup && creditToUse ? {
          creditId: creditToUse.id,
          creditType: "teacher-cancellation" as any,
          isReschedulable: false // Teacher cancellation credits can only be used once
        } : {})
      };
      classRepository.createWithTransaction(transaction, newClassData);

      // 3. Incrementar o contador de reagendamento do aluno (se aplicável)
      if (isStudentRescheduling && studentData) {
        if (!isTeacherMakeup) {
          // Only count regular reschedules against the monthly limit
          const currentMonthStr = new Date().toISOString().slice(0, 7);

          const existingReschedules = studentData.monthlyReschedules || [];
          const monthIndex = existingReschedules.findIndex(
            (m) => m.month === currentMonthStr
          );

          if (monthIndex > -1) {
            existingReschedules[monthIndex].count += 1;
          } else {
            existingReschedules.push({ month: currentMonthStr, count: 1 });
          }
          transaction.update(studentRef, {
            monthlyReschedules: existingReschedules,
          });
        }
      }

      // 4. (Opcional) Criar uma exceção de disponibilidade se um slot foi usado
      if (availabilitySlotId && originalClass.teacherId) {
        availabilityRepository.createExceptionWithTransaction(
          transaction,
          availabilitySlotId,
          originalClass.teacherId,
          newScheduledAt
        );
      }

      return { success: true, newClassData, creditToUse };
    });

    // After the transaction, if we used a teacher cancellation credit, mark it as used
    if (result.creditToUse) {
      try {
        const creditService = new CreditService();
        // We need to find the newly created class by its scheduledAt time and other properties
        const newClassSnapshot = await adminDb.collection('classes')
          .where('studentId', '==', originalClass.studentId)
          .where('scheduledAt', '==', result.newClassData.scheduledAt)
          .where('teacherId', '==', originalClass.teacherId)
          .limit(1)
          .get();
        
        if (!newClassSnapshot.empty) {
          const newClassDoc = newClassSnapshot.docs[0];
          const newClassId = newClassDoc.id;
          
          // Update the newly created class with the correct ID in the credit
          await creditService.useCredit({
            studentId: originalClass.studentId,
            creditId: result.creditToUse.id,
            classId: newClassId
          }, originalClass.studentId);
        }
      } catch (error) {
        console.error('Error using teacher cancellation credit:', error);
        // Don't fail the entire operation if credit usage fails, but log it
      }
    }

    // --- ENVIAR NOTIFICAÇÕES POR E-MAIL APÓS SUCESSO ---
    try {
      const promises = [
        userAdminRepository.findUserById(originalClass.studentId)
      ];
      
      if (originalClass.teacherId) {
        promises.push(userAdminRepository.findUserById(originalClass.teacherId));
      }
      
      const results = await Promise.all(promises);
      const student = results[0];
      const teacher = originalClass.teacherId ? results[1] : null;

      if (student && teacher) {
        const formatDate = (date: Date) => date.toLocaleDateString('pt-BR');
        const formatTime = (date: Date) => date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const getReschedulerName = () => {
          if (isStudentRescheduling) return student.name;
          if (isTeacherRescheduling) return teacher.name;
          return 'Administração';
        };

        const originalScheduledAt = new Date(originalClass.scheduledAt);
        const className = `${originalClass.language} - ${originalClass.classType === 'regular' ? 'Aula Regular' : 'Aula Avulsa'}`;
        const platformLink = process.env.NEXT_PUBLIC_APP_URL || 'https://app.fluencylab.com';

        // Enviar e-mail para o estudante
        await emailService.sendClassRescheduledEmail({
          email: student.email,
          recipientName: student.name,
          recipientType: "student",
          className,
          originalDate: formatDate(originalScheduledAt),
          originalTime: formatTime(originalScheduledAt),
          newDate: formatDate(newScheduledAt),
          newTime: formatTime(newScheduledAt),
          reason,
          rescheduleBy: getReschedulerName(),
          platformLink: `${platformLink}/hub/plataforma/student/my-class`
        });

        // Enviar e-mail para o professor
        await emailService.sendClassRescheduledEmail({
          email: teacher.email,
          recipientName: teacher.name,
          recipientType: "teacher",
          className,
          originalDate: formatDate(originalScheduledAt),
          originalTime: formatTime(originalScheduledAt),
          newDate: formatDate(newScheduledAt),
          newTime: formatTime(newScheduledAt),
          reason,
          rescheduleBy: getReschedulerName(),
          platformLink: `${platformLink}/hub/plataforma/teacher/my-classes`
        });

        console.log(`E-mails de reagendamento enviados para estudante (${student.email}) e professor (${teacher.email})`);
      }
    } catch (emailError) {
      console.error('Erro ao enviar e-mails de reagendamento:', emailError);
      // Não falha a operação se o e-mail falhar, apenas loga o erro
    }

    return result;
  }


  /**
   * Cria um período de férias para um professor, validando as regras de negócio
   * de forma consistente e atualizando o saldo de dias.
   */
  async createTeacherVacation(vacationData: Omit<Vacation, 'id' | 'createdAt'>): Promise<Vacation> {
    const { teacherId, startDate, endDate } = vacationData;
    const teacher = await userRepository.findById(teacherId);

    if (!teacher) {
      throw new Error("Professor não encontrado.");
    }

    // --- VALIDAÇÕES UNIFICADAS ---

    // Regra 1: Pedido com 40 dias de antecedência
    const now = new Date();
    const earliestStartDate = new Date();
    earliestStartDate.setDate(now.getDate() + 40);
    if (startDate < earliestStartDate) {
      throw new Error("As férias devem ser solicitadas com pelo menos 40 dias de antecedência.");
    }

    // Regra 2: Duração máxima de 14 dias
    const oneDay = 1000 * 60 * 60 * 24;
    const durationInDays = Math.round((endDate.getTime() - startDate.getTime()) / oneDay) + 1;
    if (durationInDays > 14) {
      throw new Error("O período de férias não pode exceder 14 dias consecutivos.");
    }

    // Regra 3 (Corrigida): Validar contra o saldo guardado no perfil
    const currentRemainingDays = teacher.vacationDaysRemaining ?? 30;
    if (durationInDays > currentRemainingDays) {
      throw new Error(`Este pedido de ${durationInDays} dias excede o seu saldo de ${currentRemainingDays} dias de férias restantes.`);
    }
    
    // A verificação redundante baseada em 'findByTeacherAndYear' foi removida.

    // --- BUSCAR AULAS AFETADAS ANTES DA TRANSAÇÃO ---
    const affectedClasses = await classRepository.findClassesByTeacherInRange(teacherId, startDate, endDate);
    const affectedStudentIds = [...new Set(affectedClasses.map(cls => cls.studentId))];
    const affectedStudents = affectedStudentIds.length > 0 
      ? await userAdminRepository.findUsersByIds(affectedStudentIds)
      : [];

    await adminDb.runTransaction(async (transaction) => {
      // 1. Atualiza aulas e cria registo de férias
      await classRepository.updateClassesStatusInRange(transaction, teacherId, startDate, endDate, ClassStatus.TEACHER_VACATION);
      vacationRepository.createWithTransaction(transaction, { ...vacationData, createdAt: new Date() });

      // 2. Atualiza o saldo de férias do professor
      const newRemainingDays = currentRemainingDays - durationInDays;
      const teacherRef = adminDb.collection('users').doc(teacherId);
      transaction.update(teacherRef, { vacationDaysRemaining: newRemainingDays });
    });

    // --- ENVIAR NOTIFICAÇÕES POR E-MAIL APÓS SUCESSO ---
    if (affectedStudents.length > 0) {
      try {
        const formatDate = (date: Date) => date.toLocaleDateString('pt-BR');
        const formatTime = (date: Date) => date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const platformLink = process.env.NEXT_PUBLIC_APP_URL || 'https://app.fluencylab.com';

        // Agrupar aulas por estudante
        const classesByStudent = new Map<string, StudentClass[]>();
        affectedClasses.forEach(cls => {
          const existing = classesByStudent.get(cls.studentId) || [];
          existing.push(cls);
          classesByStudent.set(cls.studentId, existing);
        });

        // Enviar e-mail para cada estudante afetado
        for (const student of affectedStudents) {
          const studentClasses = classesByStudent.get(student.id) || [];
          const affectedClassesForEmail = studentClasses.map(cls => ({
            date: formatDate(new Date(cls.scheduledAt)),
            time: formatTime(new Date(cls.scheduledAt)),
            language: cls.language
          }));

          await emailService.sendTeacherVacationEmail({
            email: student.email,
            studentName: student.name,
            teacherName: teacher.name,
            vacationStartDate: formatDate(startDate),
            vacationEndDate: formatDate(endDate),
            affectedClasses: affectedClassesForEmail,
            platformLink: `${platformLink}/hub/plataforma/student/my-class`
          });

          console.log(`E-mail de férias do professor enviado para estudante ${student.name} (${student.email})`);
        }

        console.log(`Total de ${affectedStudents.length} estudantes notificados sobre as férias do professor ${teacher.name}`);
      } catch (emailError) {
        console.error('Erro ao enviar e-mails de férias do professor:', emailError);
        // Não falha a operação se o e-mail falhar, apenas loga o erro
      }
    }

    return { ...vacationData, createdAt: new Date() } as Vacation;
  }


   /**
   * Cancela um período de férias de um professor, restaurando o status das aulas afetadas
   * e reembolsando os dias de férias ao saldo do professor.
   */
  async deleteTeacherVacation(vacationId: string, teacherId: string): Promise<void> {
    // Buscar o período de férias
    const vacation = await vacationRepository.findAllByTeacherId(teacherId);
    const vacationData = vacation.find(v => v.id === vacationId);
    
    if (!vacationData) {
      throw new Error("Período de férias não encontrado.");
    }

    // Verificar regras de cancelamento (40 dias de antecedência)
    const now = new Date();
    const earliestCancelDate = new Date(vacationData.startDate);
    earliestCancelDate.setDate(earliestCancelDate.getDate() - 40);
    
    if (now > earliestCancelDate) {
      throw new Error("Período de férias não pode ser cancelado com menos de 40 dias de antecedência.");
    }

    const teacher = await userRepository.findById(teacherId);
    if (!teacher) {
      throw new Error("Professor não encontrado.");
    }

    // Buscar aulas afetadas pelo período de férias
    const affectedClasses = await classRepository.findClassesByTeacherInRange(
      teacherId, 
      vacationData.startDate, 
      vacationData.endDate
    );

    // Calcular dias de férias a serem reembolsados
    const oneDay = 1000 * 60 * 60 * 24;
    const durationInDays = Math.round(
      (vacationData.endDate.getTime() - vacationData.startDate.getTime()) / oneDay
    ) + 1;

    const currentRemainingDays = teacher.vacationDaysRemaining ?? 30;
    const newRemainingDays = currentRemainingDays + durationInDays;

    await adminDb.runTransaction(async (transaction) => {
      // 1. Restaurar o status das aulas afetadas para SCHEDULED
      await classRepository.updateClassesStatusInRange(
        transaction, 
        teacherId, 
        vacationData.startDate, 
        vacationData.endDate, 
        ClassStatus.SCHEDULED
      );
      
      // 2. Excluir o registro de férias
      await vacationRepository.delete(vacationId);
      
      // 3. Atualizar o saldo de férias do professor
      const teacherRef = adminDb.collection('users').doc(teacherId);
      transaction.update(teacherRef, { vacationDaysRemaining: newRemainingDays });
    });

    // --- ENVIAR NOTIFICAÇÕES POR E-MAIL APÓS SUCESSO ---
    const affectedStudentIds = [...new Set(affectedClasses.map(cls => cls.studentId))];
    const affectedStudents = affectedStudentIds.length > 0 
      ? await userAdminRepository.findUsersByIds(affectedStudentIds)
      : [];

    if (affectedStudents.length > 0) {
      try {
        const formatDate = (date: Date) => date.toLocaleDateString('pt-BR');
        const formatTime = (date: Date) => date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const platformLink = process.env.NEXT_PUBLIC_APP_URL || 'https://app.fluencylab.com';

        // Agrupar aulas por estudante
        const classesByStudent = new Map<string, StudentClass[]>();
        affectedClasses.forEach(cls => {
          const existing = classesByStudent.get(cls.studentId) || [];
          existing.push(cls);
          classesByStudent.set(cls.studentId, existing);
        });

        // Enviar e-mail para cada estudante afetado
        for (const student of affectedStudents) {
          const studentClasses = classesByStudent.get(student.id) || [];
          const affectedClassesForEmail = studentClasses.map(cls => ({
            date: formatDate(new Date(cls.scheduledAt)),
            time: formatTime(new Date(cls.scheduledAt)),
            language: cls.language
          }));

          // Enviar e-mail de cancelamento de férias
          await emailService.sendTeacherVacationCancellationEmail({
            email: student.email,
            studentName: student.name,
            teacherName: teacher.name,
            vacationStartDate: formatDate(vacationData.startDate),
            vacationEndDate: formatDate(vacationData.endDate),
            affectedClasses: affectedClassesForEmail,
            platformLink: `${platformLink}/hub/plataforma/student/my-class`
          });

          console.log(`E-mail de cancelamento de férias do professor enviado para estudante ${student.name} (${student.email})`);
        }

        console.log(`Total de ${affectedStudents.length} estudantes notificados sobre o cancelamento das férias do professor ${teacher.name}`);
      } catch (emailError) {
        console.error('Erro ao enviar e-mails de cancelamento de férias do professor:', emailError);
        // Não falha a operação se o e-mail falhar, apenas loga o erro
      }
    }

    console.log(`Período de férias cancelado com sucesso. ${durationInDays} dias reembolsados ao professor ${teacher.name}.`);
  }

  
  /**
   * Updates the teachersIds field for a student based on their class template
   * @param studentId The ID of the student
   * @param oldTemplate The old class template (before changes)
   * @param newTemplate The new class template (after changes)
   */
  async updateStudentTeachersIds(studentId: string, oldTemplate: ClassTemplate | null, newTemplate: ClassTemplate): Promise<void> {
    try {
      // Get unique teacher IDs from the old template
      const oldTeacherIds = oldTemplate?.days?.map(entry => entry.teacherId) || [];
      const uniqueOldTeacherIds = [...new Set(oldTeacherIds)];
      
      // Get unique teacher IDs from the new template
      const newTeacherIds = newTemplate.days?.map(entry => entry.teacherId) || [];
      const uniqueNewTeacherIds = [...new Set(newTeacherIds)];
      
      // Find teachers that were removed (in old but not in new)
      const removedTeacherIds = uniqueOldTeacherIds.filter(id => !uniqueNewTeacherIds.includes(id));
      
      // Find teachers that were added (in new but not in old)
      const addedTeacherIds = uniqueNewTeacherIds.filter(id => !uniqueOldTeacherIds.includes(id));
      
      // Update the student's teachersIds field
      const student = await userAdminRepository.findUserById(studentId);
      if (!student) {
        throw new Error(`Student with ID ${studentId} not found`);
      }
      
      // Get current teachersIds from student
      let currentTeachersIds = student.teachersIds || [];
      
      // Remove teachers that are no longer in the schedule (only if they don't appear in any remaining entries)
      for (const removedTeacherId of removedTeacherIds) {
        // Check if this teacher still appears in the new template
        const teacherStillInSchedule = newTemplate.days?.some(entry => entry.teacherId === removedTeacherId);
        if (!teacherStillInSchedule) {
          // Remove this teacher from teachersIds
          currentTeachersIds = currentTeachersIds.filter(id => id !== removedTeacherId);
        }
      }
      
      // Add new teachers to teachersIds
      for (const addedTeacherId of addedTeacherIds) {
        // Only add if not already in the list
        if (!currentTeachersIds.includes(addedTeacherId)) {
          currentTeachersIds.push(addedTeacherId);
        }
      }
      
      // Update the student document with the new teachersIds array
      await userAdminRepository.update(studentId, { teachersIds: currentTeachersIds });
      
      console.log(`Successfully updated teachersIds for student ${studentId}`);
    } catch (error) {
      console.error(`Error updating teachersIds for student ${studentId}:`, error);
      throw error;
    }
  }

  /**
   * Atualiza o template de horário de um aluno e remove as aulas futuras que
   * não fazem mais parte do novo template.
   * @param studentId O ID do aluno.
   * @param newTemplateData O novo objeto de template.
   */
  async updateScheduleAndPruneClasses(studentId: string, newTemplateData: ClassTemplate): Promise<void> {
    // 1. Buscar o template antigo para comparação
    const oldTemplate = await classTemplateRepository.get(studentId);
    const oldEntries = oldTemplate?.days || [];
    const newEntries = newTemplateData.days || [];

    // 2. Identificar quais entradas foram removidas
    const removedEntries = oldEntries.filter(oldEntry => 
      !newEntries.some(newEntry => 
        oldEntry.day === newEntry.day &&
        oldEntry.hour === newEntry.hour &&
        oldEntry.teacherId === newEntry.teacherId
      )
    );

    // 3. Executar a exclusão em cascata das aulas correspondentes
    if (removedEntries.length > 0) {
      await classRepository.deleteFutureClassesByTemplate(studentId, removedEntries);
    }
    
    // 4. Update student's teachersIds field
    await this.updateStudentTeachersIds(studentId, oldTemplate, newTemplateData);
    
    // 5. Update classes in Firestore with new teacher information
    await this.updateClassesWithNewTeacherInfo(studentId, oldTemplate, newTemplateData);
    
    // 6. Salvar o novo template
    await classTemplateRepository.upsert(studentId, newTemplateData);
  }

  /**
   * Updates classes in Firestore when teacher information changes in the schedule
   * @param studentId The ID of the student
   * @param oldTemplate The old class template
   * @param newTemplate The new class template
   */
  async updateClassesWithNewTeacherInfo(studentId: string, oldTemplate: ClassTemplate | null, newTemplate: ClassTemplate): Promise<void> {
    try {
      // Create a map of schedule changes: (day,hour) -> oldTeacherId,newTeacherId
      const scheduleChanges = new Map<string, { oldTeacherId: string | null, newTeacherId: string | null }>();
      
      // Process old template entries
      oldTemplate?.days?.forEach(entry => {
        const key = `${entry.day}-${entry.hour}`;
        if (!scheduleChanges.has(key)) {
          scheduleChanges.set(key, { oldTeacherId: entry.teacherId, newTeacherId: null });
        }
      });
      
      // Process new template entries
      newTemplate.days?.forEach(entry => {
        const key = `${entry.day}-${entry.hour}`;
        if (scheduleChanges.has(key)) {
          const change = scheduleChanges.get(key)!;
          change.newTeacherId = entry.teacherId;
        } else {
          scheduleChanges.set(key, { oldTeacherId: null, newTeacherId: entry.teacherId });
        }
      });
      
      // Find entries where teacher changed
      const changedEntries = Array.from(scheduleChanges.entries()).filter(([key, change]) => 
        change.oldTeacherId !== change.newTeacherId
      );
      
      if (changedEntries.length === 0) {
        return; // No changes to process
      }
      
      // For each changed entry, update the corresponding classes
      for (const [key, change] of changedEntries) {
        const [day, hour] = key.split('-');
        
        // Only process if teacher actually changed
        if (change.oldTeacherId !== change.newTeacherId && change.newTeacherId) {
          // Find classes that match this schedule entry
          const now = new Date();
          const classesQuery = adminDb.collection('classes')
            .where('studentId', '==', studentId)
            .where('status', '==', ClassStatus.SCHEDULED)
            .where('scheduledAt', '>=', now);
          
          const snapshot = await classesQuery.get();
          
          // Update classes that match the day and hour
          const batch = adminDb.batch();
          let updateCount = 0;
          
          snapshot.docs.forEach(doc => {
            const classData = doc.data() as StudentClass;
            const classDate = (classData.scheduledAt as unknown as Timestamp).toDate();
            const classDay = daysOfWeek[classDate.getDay()];
            const classHour = `${String(classDate.getHours()).padStart(2, '0')}:${String(classDate.getMinutes()).padStart(2, '0')}`;
            
            // If this class matches the schedule entry that changed
            if (classDay === day && classHour === hour) {
              batch.update(doc.ref, {
                teacherId: change.newTeacherId,
                updatedAt: Timestamp.now()
              });
              updateCount++;
            }
          });
          
          if (updateCount > 0) {
            await batch.commit();
            console.log(`Updated ${updateCount} classes for student ${studentId} with new teacher ${change.newTeacherId} for ${day} at ${hour}`);
          }
        }
      }
    } catch (error) {
      console.error(`Error updating classes with new teacher info for student ${studentId}:`, error);
      throw error;
    }
  }

    /**
   * Deleta completamente o template de um aluno e todas as suas aulas futuras agendadas.
   * @param studentId O ID do aluno.
   */
  async deleteScheduleAndClasses(studentId: string): Promise<void> {
    const templateToDelete = await classTemplateRepository.get(studentId);
    const entriesToDelete = templateToDelete?.days || [];

    // 1. Se houver entradas no template, deleta as aulas futuras correspondentes
    if (entriesToDelete.length > 0) {
      await classRepository.deleteFutureClassesByTemplate(studentId, entriesToDelete);
    }
    
    // 2. Remove all teacher IDs from the student's teachersIds field
    if (templateToDelete && entriesToDelete.length > 0) {
      const teacherIdsToRemove = [...new Set(entriesToDelete.map(entry => entry.teacherId))];
      const student = await userAdminRepository.findUserById(studentId);
      if (student && student.teachersIds) {
        const updatedTeachersIds = student.teachersIds.filter(id => !teacherIdsToRemove.includes(id));
        await userAdminRepository.update(studentId, { teachersIds: updatedTeachersIds });
      }
    }
    
    // 3. Deleta o próprio documento do template
    await classTemplateRepository.delete(studentId);
  }

  /**
   * Atualiza o status e/ou feedback de uma aula.
   * Garante que apenas o professor da aula ou um admin possa fazer a alteração.
   * @param classId O ID da aula.
   * @param newStatus O novo status da aula.
   * @param feedback Um feedback ou relatório opcional sobre a aula.
   * @param currentUserId O ID do usuário que está fazendo a requisição.
   */
  async updateClassStatus(
    classId: string,
    newStatus: ClassStatus,
    feedback: string | undefined,
    currentUserId: string
  ): Promise<StudentClass> {
    const classToUpdate = await classRepository.findClassById(classId);
    if (!classToUpdate) {
      throw new Error("Aula não encontrada.");
    }

    const isTeacherOfClass = classToUpdate.teacherId === currentUserId;
    const sessionUser = await userRepository.findById(currentUserId);
    const isAdmin = sessionUser?.role === 'admin' || sessionUser?.role === 'manager';

    if (!isTeacherOfClass && !isAdmin) {
      throw new Error("Acesso não autorizado para modificar esta aula.");
    }
    
    const updateData: Partial<StudentClass> = { status: newStatus };
    if (feedback) {
      updateData.feedback = feedback;
    }
    if (newStatus === ClassStatus.COMPLETED) {
      updateData.completedAt = new Date();
    }

    await classRepository.update(classId, updateData);
    return { ...classToUpdate, ...updateData };
  }

  /**
   * Busca todas as aulas de um professor (passadas e futuras) e as enriquece
   * com os dados dos alunos correspondentes para exibição na UI.
   * @param teacherId O ID do professor.
   * @returns Uma lista de PopulatedStudentClass.
   */
  async getPopulatedClassesForTeacher(teacherId: string): Promise<PopulatedStudentClass[]> {
    // Confirme que esta linha chama o método correto: findAllClassesByTeacherId
    const classes = await classRepository.findAllClassesByTeacherId(teacherId);
    
    if (classes.length === 0) return [];

    // 2. Coleta todos os IDs de alunos únicos da lista de aulas
    const studentIds = [...new Set(classes.map(cls => cls.studentId))];

    // 3. Busca os dados de todos esses alunos de uma só vez
    const students = await userAdminRepo.findUsersByIds(studentIds);
    
    // 4. Cria um "mapa" para facilitar a busca: studentId -> studentData
    const studentMap = new Map(students.map(s => [s.id, s]));

    // 5. "Popula" cada aula com os dados do aluno correspondente
    const populatedClasses = classes.map(cls => {
      const student = studentMap.get(cls.studentId);
      return {
        ...cls,
        studentName: student?.name || 'Aluno não encontrado',
        studentAvatarUrl: student?.avatarUrl,
      };
    });

    return populatedClasses;
  }

    /**
   * Busca todas as aulas de um aluno (passadas e futuras) e as enriquece
   * com os dados do professor correspondente.
   * @param studentId O ID do aluno.
   * @returns Uma lista de PopulatedStudentClass.
   */
  async getPopulatedClassesForStudent(studentId: string): Promise<PopulatedStudentClass[]> {
    const classes = await classRepository.findAllClassesByStudentId(studentId);
    if (classes.length === 0) return [];

    // Filter out undefined teacherIds before creating the set
    const teacherIds = [...new Set(classes.map(cls => cls.teacherId).filter(id => id !== undefined))];
    const teachers = await userAdminRepo.findUsersByIds(teacherIds);
    const teacherMap = new Map(teachers.map(t => [t.id, t]));

    const populatedClasses: PopulatedStudentClass[] = classes.map(cls => {
      // Handle case where teacherId might be undefined
      if (!cls.teacherId) {
        return {
          ...cls,
          teacherName: 'Professor não atribuído',
          teacherAvatarUrl: undefined,
        };
      }
      
      const teacher = teacherMap.get(cls.teacherId);
      return {
        ...cls,
        teacherName: teacher?.name || 'Professor não encontrado',
        teacherAvatarUrl: teacher?.avatarUrl,
      };
    });

    return populatedClasses;
  }

  /**
   * Busca os horários de disponibilidade de um professor, as suas aulas já agendadas
   * e as suas configurações de agendamento para que o aluno possa reagendar.
   * @param teacherId O ID do professor.
   * @returns Um objeto com os horários, exceções, aulas já agendadas e configurações.
   */
  async getTeacherAvailabilityForStudent(teacherId: string) {
    const [slots, exceptions, teacher, bookedClasses] = await Promise.all([
      availabilityRepository.findByTeacherId(teacherId),
      availabilityRepository.findExceptionsByTeacherId(teacherId),
      userAdminRepo.findUserById(teacherId),
      classRepository.findAllClassesByTeacherId(teacherId) // Busca todas as aulas para verificar conflitos
    ]);

    if (!teacher) {
      throw new Error("Professor não encontrado.");
    }

    // Filtra para retornar apenas os horários que um aluno pode usar para reagendar
    const availableSlots = slots.filter(
      slot => slot.type === AvailabilityType.MAKEUP || slot.type === AvailabilityType.OCCASIONAL
    );
    
    console.log('[getTeacherAvailabilityForStudent] Debug:', {
      totalSlots: slots.length,
      availableSlotsAfterFilter: availableSlots.length,
      slotTypes: slots.map(s => ({ id: s.id, type: s.type, title: s.title })),
      filteredSlots: availableSlots.map(s => ({ id: s.id, type: s.type, title: s.title }))
    });
    
    return { 
      slots: availableSlots, 
      exceptions,
      bookedClasses,
      settings: teacher.schedulingSettings 
    };
  }

  /**
   * Busca os horários de disponibilidade de um professor específicos para reagendamento,
   * incluindo apenas slots do tipo MAKEUP e OCCASIONAL com debugging melhorado.
   * @param teacherId O ID do professor.
   * @returns Um objeto com os horários, exceções, aulas já agendadas e configurações.
   */
  async getTeacherAvailabilityForReschedule(teacherId: string) {
    console.log(`[getTeacherAvailabilityForReschedule] Starting for teacher: ${teacherId}`);
    
    const [slots, exceptions, teacher, bookedClasses] = await Promise.all([
      availabilityRepository.findByTeacherId(teacherId),
      availabilityRepository.findExceptionsByTeacherId(teacherId),
      userAdminRepo.findUserById(teacherId),
      classRepository.findAllClassesByTeacherId(teacherId)
    ]);

    console.log(`[getTeacherAvailabilityForReschedule] Raw data fetched:`, {
      totalSlots: slots.length,
      exceptions: exceptions.length,
      bookedClasses: bookedClasses.length,
      teacherFound: !!teacher,
      allSlotTypes: slots.map(s => ({ id: s.id, type: s.type, title: s.title }))
    });

    if (!teacher) {
      throw new Error("Professor não encontrado.");
    }

    // Filter for reschedule-appropriate slots (temporarily showing all types for debugging)
    const availableSlots = slots.filter(slot => {
      // For now, include MAKEUP, OCCASIONAL, and REGULAR to see what we have
      return slot.type === AvailabilityType.MAKEUP || 
             slot.type === AvailabilityType.OCCASIONAL ||
             slot.type === AvailabilityType.REGULAR ||
             (slot.type as any) === 'makeup' || 
             (slot.type as any) === 'occasional' ||
             (slot.type as any) === 'regular';
    });
    
    console.log(`[getTeacherAvailabilityForReschedule] Filtering results:`, {
      totalSlots: slots.length,
      availableSlotsAfterFilter: availableSlots.length,
      allSlotTypes: slots.map(s => s.type),
      filteredSlots: availableSlots.map(s => ({ id: s.id, type: s.type, title: s.title })),
      filterCriteria: 'Temporarily including ALL types for debugging'
    });
    
    return { 
      slots: availableSlots, 
      exceptions,
      bookedClasses,
      settings: teacher.schedulingSettings 
    };
  }
}

export const schedulingService = new SchedulingService();