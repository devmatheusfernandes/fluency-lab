// app/hub/plataforma/users/[userName]/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { UserService } from "@/services/userService";
import { UserAdminRepository } from "@/repositories/user.admin.repository"; // Importa o repositório
import { redirect } from "next/navigation";
import { Text } from "@/components/ui/Text";
import UserDetailsClient from "@/components/admin/UseDetailsClient"; // Verifique o caminho

const userService = new UserService();
const userAdminRepo = new UserAdminRepository(); // Cria a instância

// As props da página agora incluem 'params' e 'searchParams'
interface UserDetailsPageProps {
  params: { userName: string }; // O nome vem do caminho da URL
  searchParams: { id?: string }; // O ID vem dos parâmetros de busca (?id=...)
}

export default async function UserDetailsPage({
  params,
  searchParams,
}: UserDetailsPageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/signin");
  }

  const userId = searchParams.id;

  if (!userId) {
    return (
      <div>
        <Text variant="title" size="xl">
          ID do utilizador em falta
        </Text>
        <Text>Não foi possível encontrar o ID do utilizador na URL.</Text>
      </div>
    );
  }

  // Busca os detalhes do utilizador E a lista de todos os professores em paralelo
  const [userDetails, allTeachers] = await Promise.all([
    userService.getFullUserDetails(userId),
    userAdminRepo.findUsersByRole("teacher"),
  ]);

  if (!userDetails) {
    return (
      <div>
        <Text variant="title" size="xl">
          Utilizador não encontrado
        </Text>
        <Text>O utilizador com o ID especificado não foi encontrado.</Text>
      </div>
    );
  }

  // Passa os dados completos, incluindo a lista de professores, para o componente de cliente
  return <UserDetailsClient user={userDetails} allTeachers={allTeachers} />;
}
