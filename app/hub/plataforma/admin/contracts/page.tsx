import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import AdminContractsClient from "@/components/admin/AdminContractsClient";

export default async function AdminContractsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== 'admin') {
    redirect('/hub/plataforma');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Contratos</h1>
        <p className="text-gray-600 mt-2">
          Visualize e gerencie todos os contratos dos estudantes
        </p>
      </div>
      
      <AdminContractsClient />
    </div>
  );
}