// types/users.ts
import { UserRoles } from "./userRoles";
import { UserPermission } from "./userPermissions";
import { RegularClassCredit } from "../credits/regularClassCredits";

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
    theme?: 'light' | 'dark';
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

    // CAMPOS ADICIONADOS PARA CONTRATO E REAGENDAMENTO
    contractStartDate?: Date;
    contractLengthMonths?: 6 | 12;
    monthlyReschedules?: {
        month: string; // Formato "YYYY-MM"
        count: number;
    }[];

    placementDone?: boolean;

    //OCCASIONAL_STUDENT
    classCredits?: number;

    // REGULAR STUDENTS - Extra class credits system
    regularClassCredits?: RegularClassCredit[];

    // PAYMENT / STRIPE FIELDS
    stripeCustomerId?: string | null;
    stripeSubscriptionId?: string | null;
    subscriptionStatus?: 'active' | 'canceled' | 'incomplete' | null;
    lastPaymentIntentId?: string | null;

    //TEACHER
    vacationDaysRemaining?: number; // <<< NOVO CAMPO ADICIONADO
    schedulingSettings?: {
        bookingLeadTimeHours?: number;
        bookingHorizonDays?: number;
        cancellationPolicyHours?: number;
        maxOccasionalClassesPerDay?: number;
    }

    profile?: {
        bio?: string;
        specialties?: string[];
        languages?: string[];
    }
};