import ClassScheduler from "@/components/occasional-student/ClassScheduler"; // Seu novo caminho
import { UserAdminRepository } from "@/repositories/user.admin.repository";
import { User } from "@/types/users/users";
import { safeDateToISO } from "@/lib/utils";
import { TeacherService } from "@/services/teacherService";
import { useStudent } from "@/hooks/useStudent";

const userAdminRepo = new UserAdminRepository();
const teacherService = new TeacherService();

const serializeTeacher = (
  teacher: User
): Omit<User, "createdAt" | "birthDate"> & {
  createdAt: string;
  birthDate: string | undefined;
} => {
  return {
    ...teacher,
    // Converte Timestamp para uma string no formato ISO de forma segura
    createdAt: safeDateToISO(teacher.createdAt) || new Date().toISOString(),
    // Garante que outras datas também sejam serializadas se existirem
    birthDate: safeDateToISO(teacher.birthDate),
  };
};

export default async function ScheduleClassPage() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Agendar Nova Aula</h1>
      <p>
        Use seus créditos para marcar uma aula com um de nossos professores.
      </p>
      <ClassScheduler />
    </div>
  );
}
