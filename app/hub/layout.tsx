import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { sidebarItemsByRole } from "@/config/sidebarItems";
import { UserRoles } from "@/types/users/userRoles";
import HubHeader from "@/components/shared/Breadcrum/HubHeader";
import { Container } from "@/components/ui/Container";
import { SidebarProvider } from "@/context/SidebarContext";
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
        <div className="flex flex-row gap-2 min-w-screen min-h-screen h-full p-2 sidebar-base transition-colors duration-300 max-w-screen max-h-screen overflow-y-hidden">
          <SidebarWrapper items={items} />

          {/* Main content area with padding for mobile navbar */}
          <div className="flex-1 flex flex-col gap-[1.5px] overflow-x-hidden pb-14 md:pb-0">
            <div className="sticky top-0 z-20">
              <HubHeader />
            </div>
            {/* Use normal div on mobile and Container on desktop */}
            <div className="flex flex-1 flex-col sm:hidden">{children}</div>
            <Container className=" flex-1 flex-col hidden sm:flex">
              {children}
            </Container>
          </div>
        </div>
      </SidebarProvider>
    </OnboardingWrapper>
  );
}
