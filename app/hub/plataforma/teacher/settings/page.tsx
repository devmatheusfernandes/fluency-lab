import TeacherSettingsForm from "@/components/teacher/TeacherSettingsForm";
import { UserAdminRepository } from "@/repositories/user.admin.repository";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const userAdminRepo = new UserAdminRepository();

export default async function TeacherSettingsPage() {
  const session = await getServerSession(authOptions);
  // Busca as configurações atuais do professor para preencher o formulário
  const teacher = await userAdminRepo.findUserById(session!.user.id);
  const currentSettings = teacher?.schedulingSettings || {};

  return (
    <div style={{ padding: "20px" }}>
      <h1>Configurações da Agenda</h1>
      <p>Defina suas regras para o agendamento de aulas.</p>
      <TeacherSettingsForm currentSettings={currentSettings} />
    </div>
  );
}
