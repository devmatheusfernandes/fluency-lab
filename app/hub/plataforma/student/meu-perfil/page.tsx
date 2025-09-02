"use client";

import { Container } from "@/components/ui/Container";
import { SubContainer } from "@/components/ui/SubContainer";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { signOut } from "next-auth/react";
import NextClassCard from "@/components/student/NextClassCard";
import ProgressStatusCard from "@/components/student/ProgressStatusCard";
import UserProfileHeader from "@/components/shared/ProfilePersonal/UserProfileHeader";
import UserProfileSkeleton from "@/components/shared/ProgressSkeletons/UserProfileSkeleton";
import { StudentPaymentStatusCard } from "@/components/student/StudentPaymentStatusCard";

export default function MeuPerfil() {
  const { user, isLoading } = useCurrentUser();

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <Container
      className="
        grid gap-2
        grid-cols-1
        md:grid-cols-3
        "
    >
      <SubContainer
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        {!isLoading && user ? (
          <UserProfileHeader user={user} onLogout={handleLogout} />
        ) : (
          <UserProfileSkeleton />
        )}
      </SubContainer>

      <SubContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <ProgressStatusCard />
      </SubContainer>

      <SubContainer
        className="md:row-span-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <StudentPaymentStatusCard />
      </SubContainer>

      <SubContainer
        className="md:col-span-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <NextClassCard />
      </SubContainer>

      <SubContainer
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        8
      </SubContainer>

      <SubContainer
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        9
      </SubContainer>

      <SubContainer
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.6 }}
      >
        6
      </SubContainer>
    </Container>
  );
}
