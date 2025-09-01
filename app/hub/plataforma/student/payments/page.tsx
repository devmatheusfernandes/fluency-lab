// app/hub/plataforma/student/payments/page.tsx
import { PaymentManagementClient } from "@/components/student/PaymentManagementClient";
import { Container } from "@/components/ui/Container/Container";
import { Heading } from "@/components/ui/Heading/Heading";

export default function PaymentsPage() {
  return (
    <Container>
      <div className="space-y-6">
        <div>
          <Heading size="lg">Gestão de Pagamentos</Heading>
          <p className="text-gray-600 mt-2">
            Gerencie sua assinatura, métodos de pagamento e histórico de
            transações
          </p>
        </div>

        <PaymentManagementClient />
      </div>
    </Container>
  );
}
