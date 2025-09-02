"use client";

import React, { useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Text } from "@/components/ui/Text";
import { Badge } from "@/components/ui/Badge";
import { Login, Refresh } from "@solar-icons/react/ssr";
import { User } from "@/types/users/users";
import { UserRoles } from "@/types/users/userRoles";
import { capitalizeFirstLetter, roleLabels } from "@/lib/utils";
import { useAvatar } from "@/hooks/useAvatar";

interface UserProfileHeaderProps {
  user: User;
  onLogout: () => void;
  className?: string;
  onAvatarUpdate?: (avatarUrl: string) => void;
}

const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({
  user,
  onLogout,
  className = "",
  onAvatarUpdate,
}) => {
  const { uploadAvatar, isUploading } = useAvatar(user?.id);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const userRoleLabel = user?.role
    ? roleLabels[user.role as UserRoles] || capitalizeFirstLetter(user.role)
    : "";

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const newAvatarUrl = await uploadAvatar(file);
      if (newAvatarUrl && onAvatarUpdate) {
        onAvatarUpdate(newAvatarUrl);
      }
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className={`flex flex-row justify-between items-center ${className}`}>
      <div className="flex flex-row items-center sm:items-start gap-2">
        <div className="relative">
          <Avatar size="xl">
            <AvatarImage
              size="xl"
              src={user?.avatarUrl || ""}
              alt={user?.name}
            />
            <AvatarFallback size="lg">
              {user?.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <button
            onClick={handleAvatarClick}
            disabled={isUploading}
            className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-primary text-white hover:bg-primary-dark transition-colors shadow-md disabled:opacity-50"
            title="Alterar foto de perfil"
          >
            {isUploading ? (
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Refresh className="w-3 h-3" />
            )}
          </button>
        </div>
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
        className="p-2.5 rounded-lg h-fit bg-danger/20 hover:bg-danger/30 text-danger hover:text-red-500 transition-colors"
        title="Sair"
      >
        <Login className="w-4 h-4" />
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        disabled={isUploading}
      />
    </div>
  );
};

export default UserProfileHeader;
