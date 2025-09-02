// app/hub/plataforma/profile/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { UserAdminRepository } from "@/repositories/user.admin.repository";
import ProfileForm from "@/components/profile/ProfileForm";
import { redirect } from "next/navigation";
import { Text } from "@/components/ui/Text";

const userAdminRepo = new UserAdminRepository();

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/signin");
  }

  const user = await userAdminRepo.findUserById(session.user.id);

  if (!user) {
    return <Text>Usuário não encontrado.</Text>;
  }

  return <ProfileForm initialData={user} />;
}
