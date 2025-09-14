"use client";

import { useState } from "react";
import { UserRoles } from "@/types/users/userRoles";
import {
  Modal,
  ModalBody,
  ModalClose,
  ModalContent,
  ModalField,
  ModalFooter,
  ModalForm,
  ModalHeader,
  ModalInput,
  ModalPrimaryButton,
  ModalTitle,
  ModalDescription,
  ModalSecondaryButton,
  ModalIcon,
} from "@/components/ui/Modal";
import {
  Select,
  SelectContent,
  SelectOption,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { UserPlus } from "@solar-icons/react";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: (userData: {
    name: string;
    email: string;
    role: UserRoles;
  }) => Promise<void>;
  isLoading: boolean;
}

// Filtra os papéis que o admin pode criar
const creatableRoles = Object.values(UserRoles).filter(
  (role) => role !== UserRoles.OCCASIONAL_STUDENT
);

export default function AddUserModal({
  isOpen,
  onClose,
  onUserCreated,
  isLoading,
}: AddUserModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(UserRoles.TEACHER);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUserCreated({ name, email, role });
    // O modal só fecha em caso de sucesso, o que será controlado pelo componente pai
  };

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent>
        <ModalIcon type="success" />
        <ModalHeader>
          <ModalTitle>Criar Novo Usuário</ModalTitle>
          <ModalDescription>
            Um e-mail será enviado para o utilizador definir a sua senha.
          </ModalDescription>
          <ModalClose />
        </ModalHeader>
        <ModalForm onSubmit={handleSubmit}>
          <ModalBody>
            <ModalField label="Nome Completo" required>
              <ModalInput
                value={name}
                onChange={(e) => setName((e.target as HTMLInputElement).value)}
                placeholder="e.g., João Silva"
                required
              />
            </ModalField>
            <ModalField label="Email" required>
              <ModalInput
                type="email"
                value={email}
                onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
                placeholder="e.g., joao.silva@email.com"
                required
              />
            </ModalField>
            <ModalField label="Tipo (Role)" required>
              <Select
                value={role}
                onValueChange={(value) => setRole(value as UserRoles)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {creatableRoles.map((roleValue) => (
                    <SelectOption key={roleValue} value={roleValue}>
                      {roleValue}
                    </SelectOption>
                  ))}
                </SelectContent>
              </Select>
            </ModalField>
          </ModalBody>
          <ModalFooter>
            <ModalPrimaryButton type="submit" disabled={isLoading}>
              {isLoading ? "A Criar..." : "Criar Usuário"}{" "}
              <UserPlus weight="BoldDuotone" className="w-6 h-6" />
            </ModalPrimaryButton>
          </ModalFooter>
        </ModalForm>
      </ModalContent>
    </Modal>
  );
}
