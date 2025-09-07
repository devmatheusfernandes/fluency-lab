import TeacherSettingsForm from "@/components/teacher/TeacherSettingsForm";
import { UserAdminRepository } from "@/repositories/user.admin.repository";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import TeacherVacationManager from "@/components/teacher/TeacherVacationManager";
import { SchedulingService } from "@/services/schedulingService";
import {
  mapTeacherEventsToCalendar,
  mapTeacherClassesToCalendar,
} from "@/lib/calendar/calendarUtils";
import ClientCalendar from "@/components/teacher/ClientCalendar";
import { serializeForClientComponent } from "@/lib/utils";
import TeacherSettingsClient from "@/components/teacher/TeacherSettingsClient";

const userAdminRepo = new UserAdminRepository();
const schedulingService = new SchedulingService();

export default async function TeacherSettingsPage() {
  const session = await getServerSession(authOptions);

  // Busca as configurações atuais do professor para preencher o formulário
  const teacher = await userAdminRepo.findUserById(session!.user.id);
  const currentSettings = teacher?.schedulingSettings || {};

  // Fetch teacher's schedule data
  const scheduleData = await schedulingService.getTeacherAvailability(
    session!.user.id
  );

  // Fetch all teacher's classes
  const allClasses = await schedulingService.getPopulatedClassesForTeacher(
    session!.user.id
  );

  // Combine availability slots with all classes
  const calendarEvents = [
    ...mapTeacherEventsToCalendar(
      scheduleData.slots,
      scheduleData.exceptions,
      scheduleData.bookedClasses
    ),
    ...mapTeacherClassesToCalendar(allClasses),
  ];

  // Serialize data before passing to Client Component
  const serializedEvents = serializeForClientComponent(calendarEvents);
  const serializedClasses = serializeForClientComponent(allClasses);
  const serializedScheduleData = serializeForClientComponent(scheduleData);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Configurações da Agenda</h1>
      <p>Defina suas regras para o agendamento de aulas.</p>
      <TeacherSettingsForm currentSettings={currentSettings} />
      <TeacherVacationManager />
      <TeacherSettingsClient
        initialEvents={serializedEvents}
        initialClasses={serializedClasses}
        initialScheduleData={serializedScheduleData}
        teacherId={session!.user.id}
      />
    </div>
  );
}
