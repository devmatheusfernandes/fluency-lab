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
import { OnboardingWrapper } from "@/components/onboarding/OnboardingWrapper";

export default async function HubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role || UserRoles.OCCASIONAL_STUDENT;
  const items = sidebarItemsByRole[userRole] || [];

  return (
    <OnboardingWrapper>
      <SidebarProvider>
        <div className="flex flex-row gap-2 min-w-screen min-h-screen h-full p-2 bg-background transition-colors duration-300 max-w-screen max-h-screen overflow-y-hidden">
          <SidebarWrapper items={items} />

          <div className="flex-1 flex flex-col gap-[1.5px]">
            <HubHeader />
            <Container className="flex flex-1 flex-col">{children}</Container>
          </div>
        </div>
      </SidebarProvider>
    </OnboardingWrapper>
  );
}
