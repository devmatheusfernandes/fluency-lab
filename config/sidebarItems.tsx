// config/sidebarItems.tsx
import { SidebarItemType } from "@/components/shared/Sidebar/Sidebar";
import { UserRoles } from "@/types/users/userRoles";
import {
  Home,
  UsersGroupRounded,
  Calendar,
  List,
  Settings,
  Book,
  Layers,
  MoneyBag,
  VideoLibrary,
  DocumentAdd,
} from "@solar-icons/react/ssr";

// Define os links para cada papel
const adminItems: SidebarItemType[] = [
  {
    href: "/hub/plataforma/profile",
    label: "Meu Perfil",
    icon: <Home />,
  },
  {
    href: "/hub/plataforma/dashboard",
    label: "Dashboard",
    icon: <Layers weight="BoldDuotone" className="w-9 h-9" />,
  },
  {
    href: "/hub/plataforma/users",
    label: "Usuários",
    icon: <UsersGroupRounded weight="BoldDuotone" className="w-9 h-9" />,
  },
  {
    href: "/hub/plataforma/finances",
    label: "Financeiro",
    icon: <MoneyBag weight="BoldDuotone" className="w-9 h-9" />,
  },
  {
    href: "/hub/plataforma/courses",
    label: "Cursos",
    icon: <VideoLibrary weight="BoldDuotone" className="w-9 h-9" />,
  },
  {
    href: "/hub/plataforma/documents",
    label: "Documentos",
    icon: <DocumentAdd weight="BoldDuotone" className="w-9 h-9" />,
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

const studentItems: SidebarItemType[] = [
  {
    href: "/hub/plataforma/profile",
    label: "Meu Perfil",
    icon: <Home />,
  },
  {
    href: "/hub/plataforma/student/schedule",
    label: "Agendar Aula",
    icon: <Calendar />,
  },
  {
    href: "/hub/plataforma/student/my-classes",
    label: "Minhas Aulas",
    icon: <List />,
  },
];

// Mapeia os papéis para suas respectivas listas de itens
export const sidebarItemsByRole: Record<string, SidebarItemType[]> = {
  [UserRoles.ADMIN]: adminItems,
  [UserRoles.TEACHER]: teacherItems,
  [UserRoles.OCCASIONAL_STUDENT]: occasionalStudentItems,
  [UserRoles.STUDENT]: studentItems,
};
