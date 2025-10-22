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

      // UPDATED: Maps each role to the new URL structure
      const roleToPathMap: { [key: string]: string } = {
        admin: "hub/plataforma/admin/meu-perfil",
        teacher: "hub/plataforma/teacher/meu-perfil",
        student: "hub/plataforma/student/meu-perfil",
      };

      const destination = roleToPathMap[userRole] || "/";

      // router.replace to not add this page to browser history
      router.replace(destination);
    }
  }, [status, session, router]);

  // Displays a loading screen while session is being verified
  return (
    <div className="flex max-h-screen max-w-screen justify-center items-center">
      <Loading />
    </div>
  );
}
