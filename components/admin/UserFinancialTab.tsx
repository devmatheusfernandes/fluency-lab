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
import { useUserFinancials } from "@/hooks/useUserFinancials";

interface UserFinancialTabProps {
  userId: string;
}

export default function UserFinancialTab({ userId }: UserFinancialTabProps) {
  // 2. O componente agora simplesmente consome o hook
  const { payments, isLoading } = useUserFinancials(userId);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Card className="p-6">
      <Text variant="title" size="lg" weight="semibold" className="mb-4">
        Histórico de Pagamentos
      </Text>
      {payments.length === 0 ? (
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
              {payments.map((payment) => (
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
