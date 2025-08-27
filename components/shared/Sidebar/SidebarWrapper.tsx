"use client";

import * as React from "react";
import { Sidebar } from "./Sidebar";
import { UserData } from "../UserCard/UserCard";
import { Notification } from "../NotificationCard/NotificationCard";
import { SidebarItemType } from "./Sidebar";

interface SidebarWrapperProps {
  items: SidebarItemType[];
  user?: UserData;
}

export default function SidebarWrapper({ items, user }: SidebarWrapperProps) {
  const [notifications, setNotifications] = React.useState<Notification[]>([
    {
      id: "1",
      title: "Nova mensagem",
      message: "Você recebeu uma nova mensagem de João Silva",
      type: "info",
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutos atrás
      read: false,
      action: {
        label: "Ver mensagem",
        onClick: () => console.log("Navegando para mensagens"),
      },
    },
    {
      id: "2",
      title: "Relatório concluído",
      message: "O relatório mensal foi gerado com sucesso",
      type: "success",
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutos atrás
      read: false,
    },
    {
      id: "3",
      title: "Atenção necessária",
      message: "Alguns itens precisam de sua aprovação",
      type: "warning",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 horas atrás
      read: true,
    },
    {
      id: "4",
      title: "Erro no sistema",
      message: "Falha na sincronização de dados",
      type: "error",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 dia atrás
      read: false,
    },
  ]);

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  return (
    <Sidebar
      items={items}
      user={user}
      notifications={notifications}
      onMarkAsRead={handleMarkAsRead}
      onMarkAllAsRead={handleMarkAllAsRead}
      onDeleteNotification={handleDelete}
      onClearAllNotifications={handleClearAll}
    />
  );
}
