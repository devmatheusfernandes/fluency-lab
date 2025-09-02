// app/hub/plataforma/admin/announcements/page.tsx
import { AnnouncementsManager } from "@/components/admin/AnnouncementsManager";
import { Text } from "@/components/ui/Text";

export default function AdminAnnouncementsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Text variant="title">Gerenciamento de Avisos</Text>
      </div>

      <AnnouncementsManager />
    </div>
  );
}
