import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { getUserById_Admin } from "@/repositories/user.admin.repository"; // 👈 Importe a nova função
import LogoutButton from "@/components/auth/LogoutButton";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/signin");
  }

  // 👇 Usa a função de admin para buscar os dados no servidor
  const currentUser = await getUserById_Admin(session.user.id);

  if (!currentUser) {
    // Se o usuário existe na sessão mas não no DB, algo está errado.
    // Pode ser útil forçar o logout aqui.
    redirect("/signin");
  }

  return (
    <div style={{ padding: "40px" }}>
      <h1>Dashboard (Temporário em /hub/dashboard)</h1>
      <h2>Olá, {currentUser.name}!</h2>
      <p>Bem-vindo(a) à sua área de aluno.</p>

      <div
        style={{ marginTop: "20px", border: "1px solid #ccc", padding: "10px" }}
      >
        <h3>Informações da Conta</h3>
        <p>
          <strong>Email:</strong> {currentUser.email}
        </p>
        <p>
          <strong>Perfil:</strong> {currentUser.role}
        </p>
        <p>
          <strong>Créditos de Aula:</strong> {currentUser.classCredits || 0}
        </p>
      </div>

      <div style={{ marginTop: "20px" }}>
        <LogoutButton />
      </div>
    </div>
  );
}
