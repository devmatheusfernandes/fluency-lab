import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { sidebarItemsByRole } from "@/config/sidebarItems";
import { UserRoles } from "@/types/users/userRoles";
import HubHeader from "@/components/shared/Breadcrum/HubHeader";
import { Container } from "@/components/ui/Container";
import { SubContainer } from "@/components/ui/SubContainer";
import { SidebarProvider } from "@/context/SidebarContext";
import { UserData } from "@/components/shared/UserCard/UserCard";
import SidebarWrapper from "@/components/shared/Sidebar/SidebarWrapper";

const userData: UserData = {
  name: "João Silva",
  role: "Administrator",
  avatar: "https://example.com/avatar.jpg",
};

export default async function HubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role || UserRoles.OCCASIONAL_STUDENT;
  const items = sidebarItemsByRole[userRole] || [];

  return (
    <SidebarProvider>
      <Container className="flex flex-row max-w-screen max-h-screen">
        {/* agora o SidebarWrapper cuida do estado */}
        <SidebarWrapper items={items} user={userData} />

        <div className="flex-1 flex flex-col gap-[1.5px]">
          <HubHeader />
          <SubContainer className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            {children}
          </SubContainer>
        </div>
      </Container>
    </SidebarProvider>
  );
}
