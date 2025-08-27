import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import LogoutButton from "@/components/auth/LogoutButton";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Painel do Administrador</h1>
      <p>Bem-vindo, {session?.user?.name || "Admin"}.</p>
      <hr style={{ margin: "20px 0" }} />
      <LogoutButton />
    </div>
  );
}
