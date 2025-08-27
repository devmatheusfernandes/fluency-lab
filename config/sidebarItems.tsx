// config/sidebarItems.tsx
import { Sidebar } from "@/components/shared/Sidebar";
import { SidebarItemType } from "@/components/shared/Sidebar/Sidebar";
import { UserRoles } from "@/types/users/userRoles";
import {
  Home,
  UsersGroupRounded,
  Calendar,
  List,
  Settings,
  Book,
} from "@solar-icons/react/ssr";

// Define os links para cada papel
const adminItems: SidebarItemType[] = [
  { href: "/hub/plataforma/admin", label: "Dashboard", icon: <Home /> },
  {
    href: "/hub/plataforma/admin/users",
    label: "Usuários",
    icon: <UsersGroupRounded />,
  },
];

const teacherItems: SidebarItemType[] = [
  {
    href: "/hub/plataforma/teacher",
    label: "Minha Agenda",
    icon: <Calendar />,
  },
  {
    href: "/hub/plataforma/teacher/my-classes",
    label: "Minhas Aulas",
    icon: <List />,
  },
  {
    href: "/hub/plataforma/teacher/settings",
    label: "Configurações",
    icon: <Settings />,
  },
];

const occasionalStudentItems: SidebarItemType[] = [
  {
    href: "/hub/plataforma/occasional-student",
    label: "Dashboard",
    icon: <Home />,
  },
  {
    href: "/hub/plataforma/occasional-student/schedule",
    label: "Agendar Aula",
    icon: <Calendar />,
  },
  {
    href: "/hub/plataforma/occasional-student/my-classes",
    label: "Minhas Aulas",
    icon: <List />,
  },
  {
    href: "/hub/plataforma/occasional-student/courses",
    label: "Cursos",
    icon: <Book />,
  },
];

// Mapeia os papéis para suas respectivas listas de itens
export const sidebarItemsByRole: Record<string, SidebarItemType[]> = {
  [UserRoles.ADMIN]: adminItems,
  [UserRoles.TEACHER]: teacherItems,
  [UserRoles.OCCASIONAL_STUDENT]: occasionalStudentItems,
  // Adicione outros papéis (MANAGER, STUDENT, etc.) aqui
};
