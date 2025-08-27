// types/users.ts
import { UserRoles } from "./userRoles";
import { UserPermission } from "./userPermissions";

//firebase > db > users > user.id
export type User = {
    id: string;
    name: string;
    nickname?: string;
    email: string;
    role: UserRoles;
    permissions: UserPermission[];
    createdAt: Date;
    isActive: boolean;
    deactivatedAt?: Date; //If the user is deactivated, this field will be filled

    avatarUrl: string;
    interfaceLanguage: string;
    tutorialCompleted: boolean;

    //PERSONAL INFO
    birthDate?: Date; //Required
    gender?: "male" | "female";
    phoneNumber?: string; 
    address?: { //Required
        street: string;
        number: string;
        complement?: string;
        neighborhood: string;
        city: string;
        state: string;
        zipCode: string;
    };

    //STUDENT
    teachersIds?: string[];
    badges?: string[]; //Maybe put in a differente collection
    coursesIds?: string[]; //Maybe put in a differente collection
    languages?: string[];
    rescheduleCount?: number; //Maybe put in a differente collection inside users/userid
    contractSigned?: boolean; //Maybe put in a differente collection inside users/userid
    placementDone?: boolean; //Maybe put in a differente collection inside users/userid

    //OCCASIONAL_STUDENT
    classCredits?: number;
    // PAYMENT / STRIPE FIELDS  👈 ADICIONE ESTA SEÇÃO
    stripeCustomerId?: string | null;
    stripeSubscriptionId?: string | null;
    subscriptionStatus?: 'active' | 'canceled' | 'incomplete' | null;
    lastPaymentIntentId?: string | null;

    //TEACHER
    schedulingSettings?: {
        bookingLeadTimeHours?: number; // Antecedência mínima em horas (Regra 1)
        bookingHorizonDays?: number;   // Até quantos dias no futuro pode agendar (Regra 3)
        cancellationPolicyHours?: number; // Limite para cancelar com reembolso (Regra 2)
        maxOccasionalClassesPerDay?: number; // Limite de aulas avulsas por dia (Regra 5)
    }
    
    profile?: {
        bio?: string;
        specialties?: string[];
        languages?: string[]; // 👈 Adicione este campo
      }
};
