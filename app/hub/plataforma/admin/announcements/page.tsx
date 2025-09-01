// app/hub/plataforma/admin/announcements/page.tsx
import { AnnouncementsManager } from "@/components/admin/AnnouncementsManager";
import { Heading } from "@/components/ui/Heading";

export default function AdminAnnouncementsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Heading>Gerenciamento de Avisos</Heading>
      </div>

      <AnnouncementsManager />
    </div>
  );
}
