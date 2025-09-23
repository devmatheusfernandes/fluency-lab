// app/hub/plataforma/dashboard/page.tsx

import { DashboardService } from "@/services/dashboardService";
import DashboardClient from "@/components/admin/DashboardClient";
import {
  User,
  Chart,
  Calendar,
  UsersGroupRounded,
} from "@solar-icons/react/ssr";

const dashboardService = new DashboardService();
//essa página aparece para manager e admin
export default async function DashboardPage() {
  const dashboardData = await dashboardService.getDashboardData();

  const icons = {
    revenue: <Chart />,
    newUsers: <User />,
    classesToday: <Calendar />,
    activeTeachers: <UsersGroupRounded />,
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-title">Dashboard</h1>
      <DashboardClient data={dashboardData} icons={icons} />
    </div>
  );
}
