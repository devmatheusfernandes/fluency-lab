"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { Loading } from "@/components/ui/Loading";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/Badge";
import { toast } from "sonner";
import { FullUserDetails } from "@/types/users/user-details";
import { UserRoles } from "@/types/users/userRoles";
import { StudentClass, ClassStatus } from "@/types/classes/class";
import {
  Select,
  SelectContent,
  SelectOption,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Payment } from "@/types/financial/payments";
import { MonthlyPayment } from "@/types/financial/subscription";

interface UserFinancialTabProps {
  user: FullUserDetails;
}

// Function to fetch teacher classes
const useTeacherClasses = (userId: string, userRole: string) => {
  const [classes, setClasses] = useState<
    (StudentClass & { studentName?: string })[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  useEffect(() => {
    if (!userId || userRole !== UserRoles.TEACHER) return;

    const fetchClasses = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/teacher/my-classes`);
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Falha ao buscar aulas do professor.");
        }
        const data = await response.json();
        setClasses(data);
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClasses();
  }, [userId, selectedMonth, userRole]);

  // Filter classes by selected month
  const filteredClasses = classes.filter((cls) => {
    const classDate = new Date(cls.scheduledAt);
    const classMonth = `${classDate.getFullYear()}-${String(classDate.getMonth() + 1).padStart(2, "0")}`;
    return classMonth === selectedMonth;
  });

  // Get unique students for the selected month
  const uniqueStudents = [
    ...new Set(filteredClasses.map((cls) => cls.studentId)),
  ];

  // Get all available months
  const availableMonths = [
    ...new Set(
      classes.map((cls) => {
        const date = new Date(cls.scheduledAt);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      })
    ),
  ]
    .sort()
    .reverse();

  return {
    classes: filteredClasses,
    isLoading,
    selectedMonth,
    setSelectedMonth,
    availableMonths,
    studentCount: uniqueStudents.length,
  };
};

// Function to fetch student payment history
const useStudentPaymentHistory = (userId: string, userRole: string) => {
  const [payments, setPayments] = useState<MonthlyPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (
      !userId ||
      (userRole !== UserRoles.STUDENT && userRole !== UserRoles.GUARDED_STUDENT)
    )
      return;

    const fetchPaymentHistory = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/student/payment-history`);
        if (!response.ok) {
          const data = await response.json();
          throw new Error(
            data.error || "Falha ao buscar histórico de pagamentos."
          );
        }
        const data = await response.json();
        setPayments(data.payments || []);
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentHistory();
  }, [userId, userRole]);

  return { payments, isLoading };
};

// Function to fetch occasional student payment history
const useOccasionalStudentPaymentHistory = (
  userId: string,
  userRole: string
) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId || userRole !== UserRoles.OCCASIONAL_STUDENT) return;

    const fetchPaymentHistory = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/admin/users/${userId}/financials`);
        if (!response.ok) {
          const data = await response.json();
          throw new Error(
            data.error || "Falha ao buscar histórico de pagamentos."
          );
        }
        const data = await response.json();
        setPayments(data);
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentHistory();
  }, [userId, userRole]);

  return { payments, isLoading };
};

export default function UserFinancialTab({ user }: UserFinancialTabProps) {
  const {
    classes,
    isLoading: isClassesLoading,
    selectedMonth,
    setSelectedMonth,
    availableMonths,
    studentCount,
  } = useTeacherClasses(user.id, user.role);

  const { payments: studentPayments, isLoading: isStudentPaymentsLoading } =
    useStudentPaymentHistory(user.id, user.role);

  const {
    payments: occasionalPayments,
    isLoading: isOccasionalPaymentsLoading,
  } = useOccasionalStudentPaymentHistory(user.id, user.role);

  // Calculate classes per month for teacher
  const classesPerMonth = classes.length;

  if (
    isClassesLoading ||
    isStudentPaymentsLoading ||
    isOccasionalPaymentsLoading
  ) {
    return <Loading />;
  }

  // For teachers, show Stripe connection and class statistics
  if (user.role === UserRoles.TEACHER) {
    return (
      <Card className="p-6">
        <Text variant="title" size="lg" weight="semibold" className="mb-4">
          Informações Financeiras do Professor
        </Text>

        <div className="mb-6 p-4 bg-surface-1 rounded-lg">
          <h3 className="font-medium mb-2">Integração com Stripe</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-sm text-subtitle">Status da Conexão</p>
              <Badge variant={user.stripeCustomerId ? "success" : "warning"}>
                {user.stripeCustomerId ? "Conectado" : "Não Conectado"}
              </Badge>
            </div>
            {user.stripeCustomerId && (
              <div>
                <p className="text-sm text-subtitle">ID do Cliente Stripe</p>
                <p className="text-xs font-mono">{user.stripeCustomerId}</p>
              </div>
            )}
          </div>
        </div>

        <Text variant="title" size="lg" weight="semibold" className="mb-4">
          Estatísticas de Aulas
        </Text>

        <div className="mb-4 flex items-center gap-2">
          <span className="text-subtitle">Filtrar por mês:</span>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableMonths.map((month) => (
                <SelectOption key={month} value={month}>
                  {new Date(`${month}-01`).toLocaleDateString("pt-BR", {
                    year: "numeric",
                    month: "long",
                  })}
                </SelectOption>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-surface-1 rounded-lg">
            <p className="text-subtitle">Aulas Dadas</p>
            <p className="text-2xl font-bold">{classesPerMonth}</p>
          </div>
          <div className="p-4 bg-surface-1 rounded-lg">
            <p className="text-subtitle">Alunos Únicos</p>
            <p className="text-2xl font-bold">{studentCount}</p>
          </div>
          <div className="p-4 bg-surface-1 rounded-lg">
            <p className="text-subtitle">Média de Alunos</p>
            <p className="text-2xl font-bold">
              {classesPerMonth > 0
                ? (studentCount / classesPerMonth).toFixed(2)
                : "0.00"}
            </p>
          </div>
        </div>

        <Text variant="title" size="base" weight="semibold" className="mb-2">
          Aulas do Mês
        </Text>
        {classes.length === 0 ? (
          <Text>Nenhuma aula encontrada para este mês.</Text>
        ) : (
          <div className="rounded-lg border border-surface-2 overflow-hidden">
            <Table>
              <TableHeader className="bg-surface-1">
                <TableRow>
                  <TableHead className="text-subtitle">Data</TableHead>
                  <TableHead className="text-subtitle">Aluno</TableHead>
                  <TableHead className="text-subtitle">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-container divide-y divide-surface-2">
                {classes.map((cls) => (
                  <TableRow key={cls.id}>
                    <TableCell>
                      {new Date(cls.scheduledAt).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      {cls.studentName || "Aluno Desconhecido"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          cls.status === ClassStatus.COMPLETED
                            ? "success"
                            : cls.status === ClassStatus.CANCELED_STUDENT ||
                                cls.status === ClassStatus.CANCELED_TEACHER ||
                                cls.status ===
                                  ClassStatus.CANCELED_TEACHER_MAKEUP ||
                                cls.status === ClassStatus.CANCELED_CREDIT
                              ? "danger"
                              : "warning"
                        }
                      >
                        {cls.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    );
  }

  // For regular students, show subscription payment history
  if (
    user.role === UserRoles.STUDENT ||
    user.role === UserRoles.GUARDED_STUDENT
  ) {
    return (
      <Card className="p-6">
        <Text variant="title" size="lg" weight="semibold" className="mb-4">
          Histórico de Pagamentos
        </Text>

        {user.subscriptionStatus && (
          <div className="mb-6 p-4 bg-surface-1 rounded-lg">
            <h3 className="font-medium mb-2">Assinatura Atual</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-sm text-subtitle">Status</p>
                <Badge
                  variant={
                    user.subscriptionStatus === "active" ? "success" : "warning"
                  }
                >
                  {user.subscriptionStatus}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-subtitle">Método de Pagamento</p>
                <p>{user.subscriptionPaymentMethod || "Não definido"}</p>
              </div>
              {user.subscriptionNextBilling && (
                <div>
                  <p className="text-sm text-subtitle">Próxima Cobrança</p>
                  <p>
                    {new Date(user.subscriptionNextBilling).toLocaleDateString(
                      "pt-BR"
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {studentPayments.length === 0 ? (
          <Text>Nenhum pagamento encontrado para este utilizador.</Text>
        ) : (
          <div className="rounded-lg border border-surface-2 overflow-hidden">
            <Table>
              <TableHeader className="bg-surface-1">
                <TableRow>
                  <TableHead className="text-subtitle">
                    Data de Vencimento
                  </TableHead>
                  <TableHead className="text-subtitle">Descrição</TableHead>
                  <TableHead className="text-subtitle">Valor</TableHead>
                  <TableHead className="text-subtitle">Status</TableHead>
                  <TableHead className="text-subtitle">Método</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-container divide-y divide-surface-2">
                {studentPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {new Date(payment.dueDate).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>{payment.description}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL", // MonthlyPayment uses BRL by default
                      }).format(payment.amount / 100)}{" "}
                      {/* Convert from centavos */}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          payment.status === "paid"
                            ? "success"
                            : payment.status === "overdue"
                              ? "danger"
                              : "warning"
                        }
                      >
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{payment.paymentMethod}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    );
  }

  // For occasional students, show Stripe payment history
  if (user.role === UserRoles.OCCASIONAL_STUDENT) {
    return (
      <Card className="p-6">
        <Text variant="title" size="lg" weight="semibold" className="mb-4">
          Histórico de Pagamentos
        </Text>

        {occasionalPayments.length === 0 ? (
          <Text>Nenhum pagamento encontrado para este utilizador.</Text>
        ) : (
          <div className="rounded-lg border border-surface-2 overflow-hidden">
            <Table>
              <TableHeader className="bg-surface-1">
                <TableRow>
                  <TableHead className="text-subtitle">Data</TableHead>
                  <TableHead className="text-subtitle">Descrição</TableHead>
                  <TableHead className="text-subtitle">Valor</TableHead>
                  <TableHead className="text-subtitle">Status</TableHead>
                  <TableHead className="text-subtitle">Provedor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-container divide-y divide-surface-2">
                {occasionalPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {new Date(payment.createdAt).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>{payment.description}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: payment.currency,
                      }).format(payment.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          payment.status === "completed" ? "success" : "warning"
                        }
                      >
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{payment.provider}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    );
  }

  // For other roles, show nothing for now
  return (
    <Card className="p-6">
      <Text>
        Nenhuma informação financeira disponível para este tipo de usuário.
      </Text>
    </Card>
  );
}
