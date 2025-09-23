import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { SchedulingService } from "@/services/schedulingService";
import ClassDetailsView from "@/components/class/ClassDetailsView";

const schedulingService = new SchedulingService();

interface ClassPageProps {
  params: {
    classId: string;
  };
}

export default async function ClassPage({ params }: ClassPageProps) {
  const session = await getServerSession(authOptions);
  const { classId } = params;

  // Busca os dados da aula no servidor
  const classDetails = await schedulingService.getClassDetails(
    classId,
    session!.user.id
  );

  if (!classDetails) {
    return (
      <div style={{ padding: "20px" }}>
        <h1>Aula não encontrada</h1>
        <p>
          A aula que você está procurando não existe ou você não tem permissão
          para acessá-la.
        </p>
      </div>
    );
  }

  // Passa os dados já prontos para um componente de cliente para exibição
  return <ClassDetailsView classDetails={classDetails} />;
}
