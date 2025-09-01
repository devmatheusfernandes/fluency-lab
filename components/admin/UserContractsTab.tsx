"use client";

import { useState, useEffect } from "react";
import { Text } from "@/components/ui/Text";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Loading } from "@/components/ui/Loading";
import {
  ContractStatus,
  ContractLog,
  Student,
} from "@/components/contract/contrato-types";
import { User } from "@/types/users/users";
import { UserRoles } from "@/types/users/userRoles";

interface UserContractsTabProps {
  user: User;
  currentUserRole: UserRoles;
}

export default function UserContractsTab({
  user,
  currentUserRole,
}: UserContractsTabProps) {
  const [contractData, setContractData] = useState<{
    status: ContractStatus | null;
    log: ContractLog | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContractData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/contract/${user.id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch contract data");
        }

        const data = await response.json();
        setContractData({
          status: data.contractStatus,
          log: data.contractLog,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchContractData();
  }, [user.id]);

  // Simple date formatting function
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch (e) {
      return "Data inválida";
    }
  };

  // Short date formatting function
  const formatShortDate = (dateString: string | undefined): string => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("pt-BR");
    } catch (e) {
      return "N/A";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <Text variant="error">
          Erro ao carregar informações do contrato: {error}
        </Text>
      </Card>
    );
  }

  if (!contractData?.status) {
    return (
      <Card className="p-6">
        <Text>Nenhum contrato encontrado para este usuário.</Text>
      </Card>
    );
  }

  const { status, log } = contractData;

  // Check if contract is near expiration (within 30 days)
  const isNearExpiration = status.expiresAt
    ? new Date(status.expiresAt) <
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) &&
      new Date(status.expiresAt) > new Date()
    : false;

  // Check if contract is expired
  const isExpired = status.expiresAt
    ? new Date(status.expiresAt) < new Date()
    : false;

  // For managers, only show limited information
  if (currentUserRole === UserRoles.MANAGER) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Text variant="subtitle">Status do Contrato:</Text>
            {status.signed && status.signedByAdmin && status.isValid ? (
              <Badge variant="success">Assinado e Válido</Badge>
            ) : isExpired ? (
              <Badge variant="danger">Expirado</Badge>
            ) : (
              <Badge variant="warning">Pendente</Badge>
            )}
          </div>

          {isNearExpiration && !isExpired && (
            <div className="flex items-center gap-2">
              <Text variant="subtitle">Validade:</Text>
              <Badge variant="warning">Perto de expirar</Badge>
            </div>
          )}

          {isExpired && (
            <div className="flex items-center gap-2">
              <Text variant="subtitle">Validade:</Text>
              <Badge variant="danger">Expirado</Badge>
            </div>
          )}

          {status.expiresAt && (
            <div className="flex items-center gap-2">
              <Text variant="subtitle">Data de Expiração:</Text>
              <Text>{formatShortDate(status.expiresAt)}</Text>
            </div>
          )}
        </div>
      </Card>
    );
  }

  // For admins, show full contract information
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Text variant="subtitle">Status do Contrato</Text>
            <div className="flex items-center gap-2 mt-1">
              {status.signed && status.signedByAdmin && status.isValid ? (
                <Badge variant="success">Assinado e Válido</Badge>
              ) : isExpired ? (
                <Badge variant="danger">Expirado</Badge>
              ) : (
                <Badge variant="warning">Pendente</Badge>
              )}
            </div>
          </div>

          <div>
            <Text variant="subtitle">Assinatura do Aluno</Text>
            <div className="flex items-center gap-2 mt-1">
              {status.signed ? (
                <Badge variant="success">Assinado</Badge>
              ) : (
                <Badge variant="warning">Pendente</Badge>
              )}
            </div>
          </div>

          <div>
            <Text variant="subtitle">Assinatura do Administrador</Text>
            <div className="flex items-center gap-2 mt-1">
              {status.signedByAdmin ? (
                <Badge variant="success">Assinado</Badge>
              ) : (
                <Badge variant="warning">Pendente</Badge>
              )}
            </div>
          </div>

          <div>
            <Text variant="subtitle">Validade</Text>
            <div className="flex items-center gap-2 mt-1">
              {isExpired ? (
                <Badge variant="danger">Expirado</Badge>
              ) : isNearExpiration ? (
                <Badge variant="warning">Perto de expirar</Badge>
              ) : (
                <Badge variant="success">Válido</Badge>
              )}
            </div>
          </div>

          {status.signedAt && (
            <div>
              <Text variant="subtitle">Data de Assinatura</Text>
              <Text className="mt-1">{formatDate(status.signedAt)}</Text>
            </div>
          )}

          {status.expiresAt && (
            <div>
              <Text variant="subtitle">Data de Expiração</Text>
              <Text className="mt-1">{formatDate(status.expiresAt)}</Text>
            </div>
          )}

          {status.adminSignedAt && (
            <div>
              <Text variant="subtitle">Data de Assinatura Admin</Text>
              <Text className="mt-1">{formatDate(status.adminSignedAt)}</Text>
            </div>
          )}
        </div>
      </Card>

      {log && (
        <Card className="p-6">
          <Text variant="title" size="lg" className="mb-4">
            Detalhes do Contrato
          </Text>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Text variant="subtitle">Nome Completo</Text>
              <Text>{log.name}</Text>
            </div>

            <div>
              <Text variant="subtitle">CPF</Text>
              <Text>{log.cpf}</Text>
            </div>

            <div>
              <Text variant="subtitle">Data de Nascimento</Text>
              <Text>{formatDate(log.birthDate)}</Text>
            </div>

            <div>
              <Text variant="subtitle">Endereço</Text>
              <Text>
                {log.address}, {log.city} - {log.state}, {log.zipCode}
              </Text>
            </div>

            <div>
              <Text variant="subtitle">IP do Cliente</Text>
              <Text>{log.ip}</Text>
            </div>

            <div>
              <Text variant="subtitle">Navegador</Text>
              <Text>{log.browser}</Text>
            </div>

            {log.adminName && (
              <div>
                <Text variant="subtitle">Administrador</Text>
                <Text>{log.adminName}</Text>
              </div>
            )}

            {log.adminCPF && (
              <div>
                <Text variant="subtitle">CPF do Administrador</Text>
                <Text>{log.adminCPF}</Text>
              </div>
            )}
          </div>
        </Card>
      )}

      <Card className="p-6">
        <Text variant="title" size="lg" className="mb-4">
          Ações
        </Text>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" onClick={() => window.location.reload()}>
            Atualizar Informações
          </Button>

          {status.signed && !status.signedByAdmin && (
            <Button
              onClick={async () => {
                try {
                  const response = await fetch("/api/admin/contracts/sign", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      studentId: user.id,
                      contractId: status.logId,
                      adminData: {
                        name: "Matheus de Souza Fernandes",
                        cpf: "70625181158",
                      },
                    }),
                  });

                  const result = await response.json();
                  if (result.success) {
                    window.location.reload();
                  } else {
                    alert(`Erro: ${result.message}`);
                  }
                } catch (error) {
                  alert("Erro ao assinar contrato");
                }
              }}
            >
              Assinar como Administrador
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
