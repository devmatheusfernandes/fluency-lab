"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Text } from "@/components/ui/Text";
import { Badge } from "@/components/ui/Badge";
import { Login } from "@solar-icons/react/ssr";
import { User } from "@/types/users/users";
import { UserRoles } from "@/types/users/userRoles";
import { capitalizeFirstLetter, roleLabels } from "@/lib/utils";

interface UserProfileHeaderProps {
  user: User;
  onLogout: () => void;
  className?: string;
}

const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({
  user,
  onLogout,
  className = "",
}) => {
  const userRoleLabel = user?.role
    ? roleLabels[user.role as UserRoles] || capitalizeFirstLetter(user.role)
    : "";

  return (
    <div className={`flex flex-row justify-between items-center ${className}`}>
      <div className="flex flex-row items-center sm:items-start gap-2">
        <Avatar size="xl">
          <AvatarImage src={user?.avatarUrl || ""} alt={user?.name} />
          <AvatarFallback size="lg">
            {user?.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-start mt-0 sm:mt-2">
          <Text weight="semibold">{user.name}</Text>
          <Text variant="placeholder" size="xs">
            {user.email}
          </Text>
          <Badge className="my-1">{userRoleLabel}</Badge>
        </div>
      </div>
      <button
        onClick={onLogout}
        className="p-2.5 rounded-lg h-fit bg-danger/25 hover:bg-danger/30 text-danger hover:text-red-500 transition-colors"
        title="Sair"
      >
        <Login className="w-4 h-4" />
      </button>
    </div>
  );
};

export default UserProfileHeader;
