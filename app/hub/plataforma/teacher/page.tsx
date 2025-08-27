import LogoutButton from "@/components/auth/LogoutButton";
import TeacherAvailabilityManager from "@/components/teacher/TeacherAvailabilityManager";

export default function TeacherDashboardPage() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Painel do Professor</h1>
      <p>Gerencie sua disponibilidade e suas aulas.</p>
      <hr style={{ margin: "20px 0" }} />
      <TeacherAvailabilityManager />
      {/* Aqui listaremos os horários já cadastrados e o calendário */}
      <LogoutButton />
    </div>
  );
}
