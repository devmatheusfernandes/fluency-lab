// services/schedulingService.ts

import { adminDb } from "@/lib/firebase/admin";
import { AvailabilityRepository } from "@/repositories/availabilityRepository";
import { ClassRepository } from "@/repositories/classRepository";
import { UserAdminRepository } from "@/repositories/user.admin.repository";
import { ClassStatus, FullClassDetails, StudentClass } from "@/types/classes/class";
import { AvailabilitySlot } from "@/types/time/availability";
import { FieldValue } from "firebase-admin/firestore";

const availabilityRepository = new AvailabilityRepository();
const classRepository = new ClassRepository();
const userAdminRepository = new UserAdminRepository(); // Instancie o repo de admin

export class SchedulingService {
  async addTeacherAvailability(slot: AvailabilitySlot): Promise<AvailabilitySlot> {
    // Validação de término > início (já existe)
    if (slot.startTime >= slot.endTime) {
      throw new Error("O horário de término deve ser após o horário de início.");
    }

    // 👇 LÓGICA DE PREVENÇÃO DE CONFLITOS
    const existingSlots = await availabilityRepository.findByTeacherId(slot.teacherId);
    
    // Filtra para encontrar conflitos no mesmo dia da semana
    const hasConflict = existingSlots.some(existing => {
      if (existing.repeating?.type !== slot.repeating?.type) return false;
      if (new Date(existing.startDate).getDay() !== new Date(slot.startDate).getDay()) return false;

      // Verifica se há sobreposição de horários (newStart < oldEnd AND newEnd > oldStart)
      return slot.startTime < existing.endTime && slot.endTime > existing.startTime;
    });

    if (hasConflict) {
      throw new Error("Conflito de horário. Você já tem um horário disponível que se sobrepõe a este.");
    }
    
    return await availabilityRepository.create(slot);
  }

  async getTeacherAvailability(teacherId: string) {
    const [slots, exceptions, bookedClasses] = await Promise.all([
      availabilityRepository.findByTeacherId(teacherId),
      availabilityRepository.findExceptionsByTeacherId(teacherId),
      classRepository.findClassesByTeacherId(teacherId),
    ]);
    
    // 👇 ADICIONE ESTE LOG
    console.log(`[SERVIÇO] Dados recebidos para o professor ${teacherId}:`, {
      slots: slots.length,
      exceptions: exceptions.length,
      bookedClasses: bookedClasses.length
    });
    
    return { slots, exceptions, bookedClasses };
  }
  
  async deleteTeacherAvailability(
    slotId: string,
    teacherId: string,
    deleteType: 'single' | 'future',
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

    if (deleteType === 'future') {
      const previousDay = new Date(occurrenceDate);
      previousDay.setDate(occurrenceDate.getDate() - 1);
      
      if (previousDay < new Date(slot.startDate)) {
        await availabilityRepository.deleteById(slotId);
      } else {
        const updatedRepeating = { ...slot.repeating, endDate: previousDay };
        await availabilityRepository.update(slotId, { repeating: updatedRepeating });
      }
    } 
    else if (deleteType === 'single') {
      await availabilityRepository.createException(slotId, teacherId, occurrenceDate);
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
    const earliestBookingTime = new Date(now.getTime() + leadTimeHours * 60 * 60 * 1000);

    if (scheduledAt < earliestBookingTime) {
      throw new Error(`As aulas devem ser agendadas com pelo menos ${leadTimeHours} horas de antecedência.`);
    }

    // Regra 3: Horizonte de Agendamento
    const horizonDays = settings.bookingHorizonDays || 30; // Padrão: 30 dias
    const latestBookingDate = new Date(now.getTime() + horizonDays * 24 * 60 * 60 * 1000);

    if (scheduledAt > latestBookingDate) {
      throw new Error(`As aulas só podem ser agendadas para os próximos ${horizonDays} dias.`);
    }

    // === INÍCIO DA TRANSAÇÃO ===
    return adminDb.runTransaction(async (transaction) => {
      const studentRef = adminDb.collection('users').doc(studentId);
      
      const studentDoc = await transaction.get(studentRef);
      if (!studentDoc.exists || (studentDoc.data()?.classCredits || 0) < 1) {
        throw new Error("Créditos de aula insuficientes.");
      }

      const existingClassQuery = await classRepository.findClassByTeacherAndDateWithTransaction(transaction, teacherId, scheduledAt);
      if (!existingClassQuery.empty) {
        throw new Error("Desculpe, este horário já foi agendado.");
      }
      
      // Regra 5: Limite de Aulas Avulsas por Dia (DENTRO da transação)
      const maxClasses = settings.maxOccasionalClassesPerDay;
      if (maxClasses && maxClasses > 0) {
        const dailyClassCount = await classRepository.countClassesOnDateForTeacher(transaction, teacherId, scheduledAt);
        if (dailyClassCount >= maxClasses) {
          throw new Error("Este professor atingiu o limite de aulas para este dia. Por favor, escolha outra data.");
        }
      }

      // Se todas as validações passaram, cria a aula
      const newClassData: Omit<StudentClass, 'id'> = {
        studentId, teacherId, availabilitySlotId: slotId, scheduledAt,
        durationMinutes: 50, status: ClassStatus.SCHEDULED,
        createdAt: new Date(), updatedAt: new Date(), createdBy: studentId,
      };
      if (classTopic) newClassData.notes = classTopic;

      classRepository.createWithTransaction(transaction, newClassData);
      transaction.update(studentRef, { classCredits: FieldValue.increment(-1) });
      availabilityRepository.createExceptionWithTransaction(transaction, slotId, teacherId, scheduledAt);

      return { success: true, classData: newClassData };
    });
  }
  
  // 👇 NOVO MÉTODO PARA CANCELAMENTO
  async cancelClassByStudent(studentId: string, classId: string) {
    const classRef = adminDb.collection('classes').doc(classId);
    const studentRef = adminDb.collection('users').doc(studentId);
    
    const classDoc = await classRef.get();
    if (!classDoc.exists || classDoc.data()?.studentId !== studentId) {
      throw new Error("Aula não encontrada ou não pertence a este aluno.");
    }
    
    const classData = classDoc.data() as StudentClass;
    const teacher = await userAdminRepository.findUserById(classData.teacherId);
    const settings = teacher?.schedulingSettings || {};
    
    const cancellationHours = settings.cancellationPolicyHours || 24;
    const now = new Date();
    const scheduledAt = (classData.scheduledAt as any).toDate();
    const hoursBeforeClass = (scheduledAt.getTime() - now.getTime()) / (1000 * 60 * 60);

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
      
      return { message: "Aula cancelada com sucesso! Seu crédito foi devolvido e o horário está livre novamente." };
    } else {
      // Se cancelou em cima da hora, não devolve o crédito e não libera o horário
      await classRef.update({ status: ClassStatus.CANCELED_STUDENT });
      return { message: "Aula cancelada. O cancelamento fora do prazo não devolve o crédito." };
    }
  }

  /**
   * Busca os detalhes completos de uma aula, incluindo os perfis do
   * aluno e do professor, e verifica a autorização.
   */
  async getClassDetails(classId: string, currentUserId: string): Promise<FullClassDetails | null> {
    const classData = await classRepository.findClassById(classId);
    if (!classData) return null;
  
    const sessionUser = await userAdminRepository.findUserById(currentUserId);
    if (!sessionUser) throw new Error("Usuário da sessão não encontrado.");
    
    const isParticipant = classData.studentId === currentUserId || classData.teacherId === currentUserId;
    const isAdminOrManager = sessionUser.role === 'admin' || sessionUser.role === 'manager';
  
    if (!isParticipant && !isAdminOrManager) {
      throw new Error("Acesso não autorizado a esta aula.");
    }
  
    // Otimização: Vamos reutilizar os dados que já buscamos
    let student = classData.studentId === currentUserId ? sessionUser : null;
    let teacher = classData.teacherId === currentUserId ? sessionUser : null;
  
    // Busca apenas os perfis que ainda não temos
    const promises = [];
    if (!student) promises.push(userAdminRepository.findUserById(classData.studentId));
    if (!teacher) promises.push(userAdminRepository.findUserById(classData.teacherId));
  
    const results = await Promise.all(promises);
    
    // Atribui os resultados
    if (!student) student = results.shift() || null;
    if (!teacher) teacher = results.shift() || null;
  
    if (!student || !teacher) {
      throw new Error("Não foi possível encontrar os perfis do aluno ou do professor.");
    }
  
    return {
      ...classData,
      student,
      teacher,
    };
  }
}