"use client";

import { useState } from "react";
import { User } from "@/types/users/users";
import { useProfile } from "@/hooks/useProfile";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";

interface ProfileFormProps {
  initialData: User;
}

export default function ProfileForm({ initialData }: ProfileFormProps) {
  const [user, setUser] = useState(initialData);
  const { updateUserProfile, isLoading } = useProfile();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser((prev) => ({
      ...prev,
      address: {
        street: "",
        number: "",
        neighborhood: "",
        city: "",
        state: "",
        zipCode: "",
        ...prev.address,
        [name]: value,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile(user);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="space-y-6">
        {/* No futuro, podemos usar os seus componentes de Tabs aqui */}
        <section>
          <Text
            as="div"
            variant="subtitle"
            size="lg"
            weight="semibold"
            className="mb-4"
          >
            Informações Pessoais
          </Text>
          <div className="space-y-4">
            <div>
              <label htmlFor="name">Nome Completo</label>
              <Input
                id="name"
                name="name"
                value={user.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="nickname">Apelido (Opcional)</label>
              <Input
                id="nickname"
                name="nickname"
                value={user.nickname || ""}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="phoneNumber">Telefone</label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                value={user.phoneNumber || ""}
                onChange={handleChange}
              />
            </div>
          </div>
        </section>

        <div className="border-t border-surface-2" />

        <section>
          <Text
            as="div"
            variant="subtitle"
            size="lg"
            weight="semibold"
            className="mb-4"
          >
            Endereço
          </Text>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="street">Rua</label>
              <Input
                id="street"
                name="street"
                value={user.address?.street || ""}
                onChange={handleAddressChange}
              />
            </div>
            <div>
              <label htmlFor="number">Número</label>
              <Input
                id="number"
                name="number"
                value={user.address?.number || ""}
                onChange={handleAddressChange}
              />
            </div>
            {/* Adicione outros campos de endereço aqui... */}
          </div>
        </section>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "A Salvar..." : "Salvar Alterações"}
          </Button>
        </div>
      </Card>
    </form>
  );
}
