// components/admin/UserCreditsTab.tsx

"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectOption,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import {
  RegularCreditsBalance,
  RegularCreditType,
  CreditTransaction,
} from "@/types/credits/regularClassCredits";
import { TextArea } from "../ui/TextArea";
import { Calendar, Card2, Gift, ShieldWarning, User } from "@solar-icons/react";
import { Alert, AlertDescription } from "../ui/alert";

interface UserCreditsTabProps {
  studentId: string;
}

export default function UserCreditsTab({ studentId }: UserCreditsTabProps) {
  const [balance, setBalance] = useState<RegularCreditsBalance | null>(null);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [granting, setGranting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Grant credits form state
  const [grantForm, setGrantForm] = useState({
    type: RegularCreditType.BONUS,
    amount: 1,
    expiresAt: "",
    reason: "",
  });

  useEffect(() => {
    loadCreditData();
  }, [studentId]);

  const loadCreditData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load balance
      const balanceResponse = await fetch(
        `/api/admin/credits/balance/${studentId}`
      );
      if (!balanceResponse.ok) {
        throw new Error("Falha ao carregar saldo de créditos");
      }
      const balanceData = await balanceResponse.json();
      setBalance(balanceData.balance);

      // Load transactions
      const transactionsResponse = await fetch(
        `/api/admin/credits/transactions/${studentId}`
      );
      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json();
        setTransactions(transactionsData.transactions || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGrantCredits = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!grantForm.expiresAt) {
      setError("Data de expiração é obrigatória");
      return;
    }

    try {
      setGranting(true);
      setError(null);
      setSuccess(null);

      const response = await fetch("/api/admin/credits/grant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId,
          ...grantForm,
          expiresAt: new Date(grantForm.expiresAt).toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Falha ao conceder créditos");
      }

      setSuccess("Créditos concedidos com sucesso!");
      setGrantForm({
        type: RegularCreditType.BONUS,
        amount: 1,
        expiresAt: "",
        reason: "",
      });

      // Reload data
      await loadCreditData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGranting(false);
    }
  };

  const formatCreditType = (type: RegularCreditType) => {
    switch (type) {
      case RegularCreditType.BONUS:
        return "Bônus";
      case RegularCreditType.LATE_STUDENTS:
        return "Alunos Tardios";
      default:
        return type;
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">
            Carregando dados de créditos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Credit Balance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Créditos
            </CardTitle>
            <Card2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {balance?.totalCredits || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Créditos Bônus
            </CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {balance?.bonusCredits || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Alunos Tardios
            </CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {balance?.lateStudentCredits || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Créditos Expirados
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {balance?.expiredCredits || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grant Credits Form */}
      <Card>
        <CardHeader>
          <CardTitle>Conceder Créditos</CardTitle>
          <CardTitle>
            Conceda créditos extras para este estudante regular
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4">
              <ShieldWarning className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 border-green-200 bg-green-50">
              <ShieldWarning className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {success}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleGrantCredits} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <span>Tipo de Crédito</span>
                <Select
                  value={grantForm.type}
                  onValueChange={(value) =>
                    setGrantForm((prev) => ({
                      ...prev,
                      type: value as RegularCreditType,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectOption value={RegularCreditType.BONUS}>
                      Bônus
                    </SelectOption>
                    <SelectOption value={RegularCreditType.LATE_STUDENTS}>
                      Alunos Tardios
                    </SelectOption>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <span>Quantidade</span>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  value={grantForm.amount}
                  onChange={(e) =>
                    setGrantForm((prev) => ({
                      ...prev,
                      amount: parseInt(e.target.value),
                    }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <span>Data de Expiração</span>
                <Input
                  id="expiresAt"
                  type="datetime-local"
                  value={grantForm.expiresAt}
                  onChange={(e) =>
                    setGrantForm((prev) => ({
                      ...prev,
                      expiresAt: e.target.value,
                    }))
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <span>Motivo (opcional)</span>
              <TextArea
                id="reason"
                placeholder="Descreva o motivo para conceder estes créditos..."
                value={grantForm.reason}
                onChange={(e) =>
                  setGrantForm((prev) => ({ ...prev, reason: e.target.value }))
                }
                rows={3}
              />
            </div>

            <Button type="submit" disabled={granting}>
              {granting ? "Concedendo..." : "Conceder Créditos"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Transações</CardTitle>
          <CardDescription>
            Histórico de créditos concedidos e utilizados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              Nenhuma transação encontrada
            </p>
          ) : (
            <div className="space-y-2">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Badge
                      variant={
                        transaction.action === "granted" ? "warning" : "success"
                      }
                    >
                      {transaction.action === "granted"
                        ? "Concedido"
                        : "Utilizado"}
                    </Badge>
                    <div>
                      <p className="font-medium">
                        {transaction.amount} crédito(s)
                      </p>
                      {transaction.reason && (
                        <p className="text-sm text-muted-foreground">
                          {transaction.reason}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {formatDate(transaction.performedAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
