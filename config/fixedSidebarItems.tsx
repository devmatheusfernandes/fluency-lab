// config/fixedSidebarItems.tsx
import { SidebarItemType } from "@/components/shared/Sidebar/Sidebar";
import { Bell, ChatLine, Settings } from "@solar-icons/react/ssr";

// Estes itens aparecerão para todos os utilizadores logados.
export const fixedSidebarItems: SidebarItemType[] = [
  { href: "/hub/notifications", label: "Notificações", icon: <Bell /> },
  { href: "/hub/chat", label: "Chat", icon: <ChatLine /> },
  { href: "/hub/settings", label: "Configurações", icon: <Settings /> },
];
