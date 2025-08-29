// app/hub/plataforma/settings/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { UserAdminRepository } from "@/repositories/user.admin.repository";
import { redirect } from "next/navigation";
import { Text } from "@/components/ui/Text";
import SettingsForm from "@/components/settings/SettingsForm";

const userAdminRepo = new UserAdminRepository();

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/signin");
  }

  const user = await userAdminRepo.findUserById(session.user.id);

  if (!user) {
    return <Text>Utilizador não encontrado.</Text>;
  }

  return (
    <div>
      <Text variant="title" size="2xl" weight="bold" className="mb-6">
        Configurações
      </Text>
      <SettingsForm
        currentLanguage={user.interfaceLanguage}
        currentTheme={user.theme || "light"}
      />
    </div>
  );
}
