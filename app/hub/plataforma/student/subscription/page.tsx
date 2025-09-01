// app/hub/plataforma/student/subscription/page.tsx
import { SubscriptionCreationClient } from "@/components/student/SubscriptionCreationClient";
import { Container } from "@/components/ui/Container/Container";
import { Heading } from "@/components/ui/Heading/Heading";

export default function SubscriptionPage() {
  return (
    <Container>
      <div className="space-y-6">
        <div className="text-center">
          <Heading size="lg">Criar Assinatura</Heading>
          <p className="text-gray-600 mt-2">
            Escolha a forma de pagamento que mais se adequa ao seu perfil
          </p>
        </div>

        <SubscriptionCreationClient />
      </div>
    </Container>
  );
}
