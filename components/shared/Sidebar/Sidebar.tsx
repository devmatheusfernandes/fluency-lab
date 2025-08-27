"use client"; // This component uses client-side state and hooks

import * as React from "react";
import * as Collapsible from "@radix-ui/react-collapsible";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { twMerge } from "tailwind-merge";
import {
  ArrowDown,
  CloseCircle,
  HamburgerMenu,
  Bell,
} from "@solar-icons/react/ssr";
import { useSidebar } from "@/context/SidebarContext";
import { UserCard, UserData } from "../UserCard/UserCard";
import {
  NotificationCard,
  NotificationBadge,
  Notification,
} from "../NotificationCard/NotificationCard";

// --- Type Definitions ---
export interface SubItem {
  href: string;
  label: string;
  icon?: React.ReactNode;
}

export interface SidebarItemType {
  href: string;
  label: string;
  icon?: React.ReactNode;
  subItems?: SubItem[];
}

// --- Sidebar Item Component ---
interface SidebarItemProps {
  item: SidebarItemType;
  isCollapsed: boolean;
}

const handleLogout = () => {
  // Sua lógica de logout aqui
  console.log("Fazendo logout...");
  // Exemplo: limpar tokens, redirecionar, etc.
};

const SidebarItem: React.FC<SidebarItemProps> = ({ item, isCollapsed }) => {
  const pathname = usePathname();
  const isActive = pathname === item.href;

  if (item.subItems) {
    return (
      <Collapsible.Root className="w-full">
        <Collapsible.Trigger className="w-full">
          <div
            className={twMerge(
              "flex items-center h-12 px-3 py-3 rounded-lg text-paragraph hover:bg-surface-hover transition-colors duration-200",
              isActive && "bg-surface-hover text-title",
              isCollapsed && "justify-center px-3"
            )}
          >
            <div className="w-5 h-5 flex items-center justify-center">
              {item.icon}
            </div>
            {!isCollapsed && (
              <span className="ml-3 flex-1 whitespace-nowrap text-left">
                {item.label}
              </span>
            )}
            {!isCollapsed && (
              <div className="w-5 h-5 flex items-center justify-center ml-auto">
                <ArrowDown className="w-5 h-5" />
              </div>
            )}
          </div>
        </Collapsible.Trigger>
        <Collapsible.Content className="overflow-hidden transition-all data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
          <div
            className={twMerge(
              "pl-6 flex flex-col gap-1 py-1",
              isCollapsed && "pl-0"
            )}
          >
            {item.subItems.map((subItem) => (
              <Link
                key={subItem.href}
                href={subItem.href}
                className={twMerge(
                  "flex items-center h-10 px-3 py-2 rounded-lg text-paragraph hover:bg-surface-hover transition-colors duration-200",
                  pathname === subItem.href && "bg-surface-hover text-title",
                  isCollapsed && "justify-center px-3"
                )}
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  {subItem.icon}
                </div>
                {!isCollapsed && (
                  <span className="ml-3 whitespace-nowrap">
                    {subItem.label}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </Collapsible.Content>
      </Collapsible.Root>
    );
  }

  return (
    <Link
      href={item.href}
      className={twMerge(
        "flex items-center h-12 px-3 py-3 rounded-lg text-paragraph hover:text-primary-hover hover:bg-primary/5 transition-all ease-in-out duration-300",
        isActive && "bg-primary/15 text-primary font-medium",
        isCollapsed && "justify-center px-3"
      )}
    >
      <div className="w-5 h-5 flex items-center justify-center">
        {item.icon}
      </div>
      {!isCollapsed && (
        <span className="ml-3 flex-1 whitespace-nowrap">{item.label}</span>
      )}
    </Link>
  );
};

// --- Mobile Navbar Item Component ---
interface MobileNavItemProps {
  item: SidebarItemType;
  notificationCount?: number;
}

const MobileNavItem: React.FC<MobileNavItemProps> = ({
  item,
  notificationCount,
}) => {
  const pathname = usePathname();
  const isActive = pathname === item.href;

  if (item.subItems) {
    return null;
  }

  return (
    <Link
      href={item.href}
      className={twMerge(
        "relative flex items-center justify-center p-2 rounded-lg text-paragraph hover:bg-surface-hover transition-colors duration-200",
        isActive && "bg-surface-hover text-title shadow-sm"
      )}
    >
      <div className="w-6 h-6 flex items-center justify-center">
        {item.icon}
      </div>
      {notificationCount && notificationCount > 0 && (
        <NotificationBadge count={notificationCount} />
      )}
    </Link>
  );
};

// --- Mobile Bottom Drawer Component ---
interface MobileBottomDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: SidebarItemType[];
  user?: UserData;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (id: string) => void;
  onClearAllNotifications: () => void;
}

const MobileBottomDrawer: React.FC<MobileBottomDrawerProps> = ({
  isOpen,
  onClose,
  items,
  user,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onClearAllNotifications,
}) => {
  const pathname = usePathname();
  const [openSection, setOpenSection] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<"menu" | "notifications">(
    "menu"
  );

  React.useEffect(() => {
    if (isOpen) {
      const activeSection = items.find((item) =>
        item.subItems?.some((sub) => pathname === sub.href)
      );
      if (activeSection) {
        setOpenSection(activeSection.label);
      }
    }
  }, [isOpen, pathname, items]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Bottom Drawer */}
      <div
        className={twMerge(
          "fixed bottom-0 left-0 right-0 bg-container rounded-t-2xl border-t border-surface-2 z-50 md:hidden transition-transform duration-300 ease-out",
          isOpen ? "translate-y-0" : "translate-y-full"
        )}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-surface-2 rounded-full" />
        </div>

        {/* Header with User Card */}
        <div className="px-4 py-3 border-b border-surface-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-title">
              {activeTab === "menu" ? "Menu" : "Notificações"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-surface-hover transition-colors"
            >
              <CloseCircle className="w-5 h-5 text-paragraph" />
            </button>
          </div>
          {user && activeTab === "menu" && (
            <UserCard user={user} variant="mobile" onLogout={handleLogout} />
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-surface-2">
          <button
            onClick={() => setActiveTab("menu")}
            className={twMerge(
              "flex-1 py-3 px-4 text-sm font-medium transition-colors relative",
              activeTab === "menu"
                ? "text-primary bg-primary/5"
                : "text-paragraph hover:text-title"
            )}
          >
            Menu
            {activeTab === "menu" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={twMerge(
              "flex-1 py-3 px-4 text-sm font-medium transition-colors relative flex items-center justify-center gap-2",
              activeTab === "notifications"
                ? "text-primary bg-primary/5"
                : "text-paragraph hover:text-title"
            )}
          >
            <span>Notificações</span>
            {unreadCount > 0 && (
              <NotificationBadge
                count={unreadCount}
                className="relative top-0 right-0"
              />
            )}
            {activeTab === "notifications" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto">
          {activeTab === "menu" ? (
            <nav className="p-4">
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.label}>
                    {item.subItems ? (
                      <div>
                        <button
                          onClick={() =>
                            setOpenSection(
                              openSection === item.label ? null : item.label
                            )
                          }
                          className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-surface-hover transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 flex items-center justify-center">
                              {item.icon}
                            </div>
                            <span className="font-medium text-paragraph">
                              {item.label}
                            </span>
                          </div>
                          <ArrowDown
                            className={twMerge(
                              "w-4 h-4 text-paragraph transition-transform",
                              openSection === item.label && "rotate-180"
                            )}
                          />
                        </button>

                        {/* Sub-items */}
                        {openSection === item.label && (
                          <div className="ml-6 mt-2 space-y-1 border-l-2 border-surface-2 pl-4">
                            {item.subItems.map((subItem) => {
                              const isActive = pathname === subItem.href;
                              return (
                                <Link
                                  key={subItem.href}
                                  href={subItem.href}
                                  onClick={onClose}
                                  className={twMerge(
                                    "flex items-center gap-3 p-2 rounded-lg transition-colors",
                                    isActive
                                      ? "bg-surface-hover text-title font-medium"
                                      : "text-paragraph hover:bg-surface-hover"
                                  )}
                                >
                                  <div className="w-4 h-4 flex items-center justify-center">
                                    {subItem.icon}
                                  </div>
                                  <span className="text-sm">
                                    {subItem.label}
                                  </span>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={twMerge(
                          "flex items-center gap-3 p-3 rounded-lg transition-colors",
                          pathname === item.href
                            ? "bg-surface-hover text-title font-medium"
                            : "text-paragraph hover:bg-surface-hover"
                        )}
                      >
                        <div className="w-5 h-5 flex items-center justify-center">
                          {item.icon}
                        </div>
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ) : (
            <div className="p-4">
              <NotificationCard
                notifications={notifications}
                onMarkAsRead={onMarkAsRead}
                onMarkAllAsRead={onMarkAllAsRead}
                onDelete={onDeleteNotification}
                onClearAll={onClearAllNotifications}
                isOpen={true}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// --- Main Sidebar Component ---
export interface SidebarProps {
  items: SidebarItemType[];
  user?: UserData;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (id: string) => void;
  onClearAllNotifications: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  items,
  user,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onClearAllNotifications,
}) => {
  const { isCollapsed } = useSidebar();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={twMerge(
          "hidden md:flex flex-col items-center max-h-full transition-all duration-300 ease-in-out",
          isCollapsed ? "w-12" : "w-64 px-2 gap-3"
        )}
      >
        {/* User Card at top */}
        {user && (
          <UserCard
            user={user}
            isCollapsed={isCollapsed}
            className="w-full"
            onLogout={handleLogout}
          />
        )}

        {/* Navigation */}
        <nav
          className={twMerge(
            "flex flex-col gap-2 flex-1",
            isCollapsed && "w-fit",
            !isCollapsed && "w-full"
          )}
        >
          {items.map((item) => (
            <SidebarItem
              key={item.label}
              item={item}
              isCollapsed={isCollapsed}
            />
          ))}
        </nav>

        {/* Notifications at bottom */}
        <div
          className={twMerge(
            "border-t border-surface-2 pt-3 w-full",
            isCollapsed && "border-none pt-0"
          )}
        >
          <NotificationCard
            notifications={notifications}
            onMarkAsRead={onMarkAsRead}
            onMarkAllAsRead={onMarkAllAsRead}
            onDelete={onDeleteNotification}
            onClearAll={onClearAllNotifications}
            isCollapsed={isCollapsed}
            isOpen={false}
          />
        </div>
      </aside>

      {/* Mobile Bottom Navbar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-container border-t border-surface-2 px-2 py-1 z-50 shadow-lg">
        <div className="flex items-center justify-around">
          {items
            .filter((item) => !item.subItems)
            .slice(0, 4)
            .map((item) => (
              <MobileNavItem key={item.label} item={item} />
            ))}

          {/* More/Notifications button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="relative flex items-center justify-center p-3 rounded-lg text-paragraph hover:bg-surface-hover transition-colors duration-200"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <HamburgerMenu className="w-6 h-6" />
            </div>
            {unreadCount > 0 && <NotificationBadge count={unreadCount} />}
          </button>
        </div>
      </nav>

      {/* Mobile Bottom Drawer */}
      <MobileBottomDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        items={items}
        user={user}
        notifications={notifications}
        onMarkAsRead={onMarkAsRead}
        onMarkAllAsRead={onMarkAllAsRead}
        onDeleteNotification={onDeleteNotification}
        onClearAllNotifications={onClearAllNotifications}
      />
    </>
  );
};

export { Sidebar };
export type { Notification };
