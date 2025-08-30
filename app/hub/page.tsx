"use client";

import { Loading } from "@/components/ui/Loading";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HubEntryPoint() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role) {
      const userRole = session.user.role;

      // ATUALIZADO: Mapeia cada role para a nova estrutura de URL
      const roleToPathMap: { [key: string]: string } = {
        admin: "hub/plataforma/admin",
        teacher: "hub/plataforma/teacher",
        occasional_student: "hub/plataforma/occasional-student",
        student: "hub/plataforma/student",
      };

      const destination = roleToPathMap[userRole] || "/";

      // router.replace para não adicionar esta página ao histórico do navegador
      router.replace(destination);
    }
  }, [status, session, router]);

  // Exibe uma tela de carregamento enquanto a sessão é verificada
  return (
    <div className="flex max-h-screen max-w-screen justify-center items-center">
      <Loading />
    </div>
  );
}
