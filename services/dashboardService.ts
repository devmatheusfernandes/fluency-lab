// services/dashboardService.ts

import { UserAdminRepository } from "@/repositories/user.admin.repository";
import { ClassRepository } from "@/repositories/classRepository";
// import { PaymentRepository } from "@/repositories/paymentRepository"; // A ser criado no futuro

const userAdminRepo = new UserAdminRepository();
const classRepo = new ClassRepository();
// const paymentRepo = new PaymentRepository();

export class DashboardService {
  async getDashboardData() {
    // Busca todos os dados necessários em paralelo para máxima performance
    const [
      newUsersCount,
      activeTeachersCount,
      classesTodayCount,
      recentClasses,
      // Dados financeiros (placeholders)
      monthlyRevenue,
      revenueTrend,
    ] = await Promise.all([
      userAdminRepo.countNewUsersThisMonth(),
      userAdminRepo.countActiveTeachers(),
      classRepo.countClassesForToday(),
      classRepo.findRecentClassesWithUserDetails(5), // Busca as últimas 5 aulas com detalhes
      // paymentRepo.getRevenueThisMonth(), // Futura implementação
      // paymentRepo.getRevenueTrend(), // Futura implementação
      Promise.resolve(1234.56), // Placeholder para receita mensal
      Promise.resolve(0.15), // Placeholder para tendência (+15%)
    ]);

    return {
      newUsersCount,
      activeTeachersCount,
      classesTodayCount,
      recentClasses,
      monthlyRevenue,
      revenueTrend,
    };
  }
}
