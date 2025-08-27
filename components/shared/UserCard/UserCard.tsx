"use client";

import * as React from "react";
import { twMerge } from "tailwind-merge";
import { Login } from "@solar-icons/react/ssr";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";

// --- Type Definitions ---
export interface UserData {
  name: string;
  role: string;
  avatar?: string;
}

export interface UserCardProps {
  user: UserData;
  isCollapsed?: boolean;
  variant?: "sidebar" | "mobile";
  className?: string;
  onLogout?: () => void;
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  isCollapsed = false,
  variant = "sidebar",
  className,
  onLogout,
}) => {
  if (variant === "mobile") {
    return (
      <div
        className={twMerge(
          "flex items-center gap-3 p-3 bg-surface rounded-lg",
          className
        )}
      >
        <Avatar>
          <AvatarImage
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
            alt="Usuário"
          />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-title truncate">{user.name}</p>
          <p className="text-xs text-paragraph truncate">{user.role}</p>
        </div>
        {onLogout && (
          <button
            onClick={onLogout}
            className="p-2 rounded-lg hover:bg-surface-hover text-paragraph hover:text-red-500 transition-colors"
            title="Sair"
          >
            <Login className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  if (isCollapsed) {
    return (
      <div className={twMerge("relative group", className)}>
        <div className="flex items-center justify-center p-2 bg-surface rounded-lg">
          <Avatar size="sm">
            <AvatarImage
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
              alt="Usuário"
            />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
        </div>
        {onLogout && (
          <button
            onClick={onLogout}
            className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 p-2 bg-surface rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-surface-hover text-paragraph hover:text-red-500"
            title="Sair"
          >
            <Login className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={twMerge(
        "flex items-center gap-3 p-3 bg-surface-1/50 rounded-lg",
        className
      )}
    >
      <Avatar>
        <AvatarImage
          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
          alt="Usuário"
        />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-title truncate">{user.name}</p>
        <p className="text-xs text-paragraph truncate">{user.role}</p>
      </div>
      {onLogout && (
        <button
          onClick={onLogout}
          className="p-2 rounded-lg bg-danger/10 hover:bg-danger/20 text-danger hover:text-danger-light transition-all duration-300 ease-in-out"
          title="Sair"
        >
          <Login className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export { UserCard };
