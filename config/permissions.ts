import { UserRoles } from "@/types/users/userRoles";
import { UserPermission } from "@/types/users/userPermissions";

// Este objeto mapeia cada papel para um array de permissões padrão.
export const rolePermissionsMap: Record<UserRoles, UserPermission[]> = {
  [UserRoles.ADMIN]: [
    "user.create",
    "user.update",
    "user.delete",
    "class.view.all",
    "class.update.any",
    "contract.create",
    "contract.update",
    "report.view",
    "payment.manage",
  ],
  [UserRoles.MANAGER]: [
    "student.support",
    "teacher.support",
    "report.view.limited",
  ],
  [UserRoles.TEACHER]: [
    "class.view.assigned",
    "class.update.status",
    "class.reschedule.teacher",
    "vacation.create",
    "vacation.view",
    "student.feedback.read",
  ],
  [UserRoles.STUDENT]: [
    "class.view",
    "class.cancel.self",
    "class.reschedule.self",
    "contract.view.self",
    "profile.update.self",
    "feedback.create",
    "payment.view.self",
  ],
  [UserRoles.GUARDED_STUDENT]: [
    "class.view",
    "class.cancel.self",
    "class.reschedule.self",
    "profile.update.self",
    "feedback.create",
  ],
  [UserRoles.MATERIAL_MANAGER]: [
    "material.create",
    "material.update",
    "material.delete",
    "material.view",
  ],
  // O estudante ocasional começa com permissões limitadas.
  [UserRoles.OCCASIONAL_STUDENT]: [
    "class.view",
    "class.cancel.self",
    "profile.update.self",
  ],
};