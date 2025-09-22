// config/sidebarItems.tsx
import { SidebarItemType } from "@/components/shared/Sidebar/Sidebar";
import { UserRoles } from "@/types/users/userRoles";
import {
  Gameboy,
  MonitorSmartphone,
  Notebook,
  PeopleNearby,
  SettingsMinimalistic,
} from "@solar-icons/react/ssr";
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
    label: "Painel",
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
    href: "/hub/plataforma/teacher/meus-alunos",
    label: "Alunos",
    icon: <PeopleNearby />,
  },
  {
    href: "/hub/plataforma/teacher/calendario",
    label: "Minha Agenda",
    icon: <Calendar />,
  },
  {
    href: "/hub/plataforma/settings",
    label: "Configurações",
    icon: <Settings />,
  },
];

const studentItems: SidebarItemType[] = [
  {
    href: "/hub/plataforma/student/meu-perfil",
    label: "Meu Perfil",
    icon: <Home />,
  },
  {
    href: "/hub/plataforma/student/caderno",
    label: "Caderno",
    icon: <Notebook weight="BoldDuotone" />,
  },
  {
    href: "/hub/plataforma/student/pratica",
    label: "Prática",
    icon: <Gameboy weight="BoldDuotone" />,
  },
  {
    href: "/hub/plataforma/student/my-class",
    label: "Calendário",
    icon: <Calendar weight="BoldDuotone" />,
  },
  {
    href: "/hub/plataforma/courses",
    label: "Cursos",
    icon: <MonitorSmartphone weight="BoldDuotone" />,
  },
  {
    href: "/hub/plataforma/settings",
    label: "Configurações",
    icon: <SettingsMinimalistic weight="BoldDuotone" />,
  },
];

// Mapeia os papéis para suas respectivas listas de itens
export const sidebarItemsByRole: Record<string, SidebarItemType[]> = {
  [UserRoles.ADMIN]: adminItems,
  [UserRoles.TEACHER]: teacherItems,
  [UserRoles.STUDENT]: studentItems,
};
