// types/classes/class.ts
import { daysOfWeek } from "../time/times";
import { User } from "../users/users";
// 👇 ALTERADO de 'type' para 'enum'
export enum ClassStatus {
    SCHEDULED = "scheduled",
    COMPLETED = "completed",
    CANCELED_STUDENT = "canceled-student",
    CANCELED_TEACHER = "canceled-teacher",
    NO_SHOW = "no-show",
    RESCHEDULED = "rescheduled",
    TEACHER_VACATION = "teacher-vacation",
    OVERDUE = "overdue",
  }
  
export type ClassTemplateDay = {
  id: string;
  day: typeof daysOfWeek[number];
  hour: string;
  teacherId: string;
};

export type ClassTemplate = {
  days: ClassTemplateDay[];
};

export type StudentClass = {
  id: string; // id da aula
  studentId: string;
  teacherId: string;

  scheduledAt: Date;
  durationMinutes: number;
  status: ClassStatus;

  canceledAt?: Date;
  canceledBy?: "student" | "teacher" | "system";
  reason?: string;

  completedAt?: Date;
  feedback?: string; 
  notes?: string;
  
  createdAt: Date;
  updatedAt: Date;
  
  createdBy: string; // userId who created the class (system, teacher, admin)

   // OCASIONAL STUDENTS TYPES SPECIFIC
   availabilitySlotId?: string; // ID da regra de disponibilidade que originou esta aula

};

// Novo tipo que combina dados da aula com os do aluno
export type PopulatedStudentClass = StudentClass & {
  studentName: string;
  studentAvatarUrl?: string;
};

export type FullClassDetails = StudentClass & {
  student: User;
  teacher: User;
};