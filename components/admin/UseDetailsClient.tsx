"use client";

import { Text } from "@/components/ui/Text";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { FullUserDetails } from "@/types/users/user-details";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import UserOverviewTab from "./UserOverviewTab";
import UserClassesTab from "./UserClassesTab";
import UserFinancialTab from "./UserFinancialTab";
import TeacherAssociation from "./TeacherAssociation";
import { User } from "@/types/users/users";

interface UserDetailsClientProps {
  user: FullUserDetails;
  allTeachers: User[];
}

export default function UserDetailsClient({
  user,
  allTeachers,
}: UserDetailsClientProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={user.avatarUrl} />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <Text variant="title" size="2xl" weight="bold">
            {user.name}
          </Text>
          <Text variant="subtitle">{user.email}</Text>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="classes">Aulas</TabsTrigger>
          <TabsTrigger value="financial">Financeiro</TabsTrigger>
          <TabsTrigger value="contracts">Contratos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <UserOverviewTab user={user} />
          <TeacherAssociation student={user} allTeachers={allTeachers} />
          {/* Futuro: <StudentDetails user={user} /> ou <TeacherDetails user={user} /> */}
        </TabsContent>
        <TabsContent value="classes" className="mt-4">
          <UserClassesTab classes={user.scheduledClasses || []} />
        </TabsContent>
        <TabsContent value="financial" className="mt-4">
          <UserFinancialTab userId={user.id} />
        </TabsContent>
        <TabsContent value="contracts" className="mt-4">
          <Text>Aqui ficará a gestão de contratos.</Text>
        </TabsContent>
      </Tabs>
    </div>
  );
}
