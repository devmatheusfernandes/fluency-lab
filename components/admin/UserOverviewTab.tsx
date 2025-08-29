"use client";

import { useState } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { useCan } from "@/hooks/useCurrentUser";
import { toast } from "sonner";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  Select,
  SelectContent,
  SelectOption,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Text } from "@/components/ui/Text";
import { FullUserDetails } from "@/types/users/user-details";
import { UserRoles } from "@/types/users/userRoles";

interface UserOverviewTabProps {
  user: FullUserDetails;
}

export default function UserOverviewTab({ user }: UserOverviewTabProps) {
  const [name, setName] = useState(user.name);
  const [role, setRole] = useState(user.role);
  const { updateUser, isLoading } = useAdmin();

  // Verifica se o utilizador logado tem permissão para editar
  const canEditUser = useCan("user.update");

  const handleSaveChanges = async () => {
    const success = await updateUser(user.id, { name, role });
    if (success) {
      toast.success("Perfil do utilizador salvo com sucesso!");
    } else {
      toast.error("Ocorreu um erro ao salvar o perfil.");
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-subtitle"
          >
            Nome Completo
          </label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!canEditUser || isLoading}
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-subtitle"
          >
            Email
          </label>
          <Input id="email" value={user.email} disabled />
        </div>
        <div>
          <label
            htmlFor="role"
            className="block text-sm font-medium text-subtitle"
          >
            Tipo (Role)
          </label>
          <Select
            value={role}
            onValueChange={(value) => setRole(value as UserRoles)}
            disabled={!canEditUser || isLoading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.values(UserRoles).map((roleValue) => (
                <SelectOption key={roleValue} value={roleValue}>
                  {roleValue}
                </SelectOption>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium text-subtitle">
            Data de Criação
          </label>
          <Input
            value={new Date(user.createdAt).toLocaleDateString("pt-BR")}
            disabled
          />
        </div>
      </div>
      {canEditUser && (
        <div className="flex justify-end mt-6">
          <Button onClick={handleSaveChanges} disabled={isLoading}>
            {isLoading ? "A Salvar..." : "Salvar Alterações"}
          </Button>
        </div>
      )}
    </Card>
  );
}
