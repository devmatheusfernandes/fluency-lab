"use client";

import React, { useRef } from "react";
import { useContract } from "@/hooks/useContract";
import {
  Student,
  SignatureFormData,
} from "@/components/contract/contrato-types";
import { Loading } from "@/components/ui/Loading";
import { Button } from "@/components/ui/Button";
import { CheckCircle, Printer, ShieldWarning } from "@solar-icons/react/ssr";
import ContratoPDF from "@/components/contract/ContratoPDF";
import SignatureModal from "@/components/contract/SignatureModal";
import { toast } from "sonner";

const ContratoPage: React.FC = () => {
  const {
    student,
    contractStatus,
    contractLog,
    isLoading,
    isSigning,
    error,
    signContract,
  } = useContract();

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const contractRef = useRef<HTMLDivElement>(null);

  // Merge student data with contract log for display
  const displayData: Student | null = React.useMemo(() => {
    if (!student) return null;

    return {
      ...student,
      ...(contractLog && {
        name: contractLog.name,
        cpf: contractLog.cpf,
        address: contractLog.address,
        city: contractLog.city,
        state: contractLog.state,
        zipCode: contractLog.zipCode,
        birthDate: contractLog.birthDate,
      }),
    };
  }, [student, contractLog]);

  const handleSignContract = async (signatureData: SignatureFormData) => {
    try {
      const result = await signContract(signatureData);

      if (result.success) {
        setIsModalOpen(false);
        toast.success("Contrato assinado com sucesso por ambas as partes!");
      } else {
        toast.error(result.message || "Erro ao assinar contrato");
      }
    } catch (error) {
      console.error("Error signing contract:", error);
      toast.error("Erro inesperado ao assinar contrato");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loading />
      </div>
    );
  }

  if (error || !displayData) {
    return (
      <div className="container mx-auto p-4 md:p-8 text-center bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col justify-center">
        <ShieldWarning
          className="text-red-500 dark:text-red-400 mx-auto mb-4 animate-pulse"
          size={40}
        />
        <h1 className="text-2xl md:text-3xl font-bold mb-4 text-red-600 dark:text-red-500">
          Erro ao Carregar Dados
        </h1>
        <p className="text-gray-700 dark:text-gray-300">
          {error ||
            "Não foi possível carregar os dados do aluno para exibir o contrato."}
        </p>
        <p className="mt-4 text-gray-700 dark:text-gray-300">
          Por favor, tente recarregar a página ou contate o suporte.
        </p>
      </div>
    );
  }

  const isSigned = contractStatus?.signed && contractStatus?.signedByAdmin;

  return (
    <div className="container mx-auto p-4 min-h-screen transition-colors duration-300">
      <div
        ref={contractRef}
        className="contract-page mb-8 transition-all duration-300 transform"
      >
        <ContratoPDF alunoData={displayData} contractStatus={contractStatus} />
      </div>

      <div className="flex flex-col sm:flex-row justify-center items-center fixed bottom-0 left-0 right-0 z-30 animate-fadeIn bg-fluency-gray-200 dark:bg-fluency-gray-800 text-black dark:text-white p-4 shadow-lg">
        {isSigned ? (
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold transition-colors duration-300">
              <CheckCircle size={20} />
              <span className="text-center">
                Contrato assinado em{" "}
                {contractStatus.signedAt
                  ? new Date(contractStatus.signedAt).toLocaleDateString(
                      "pt-BR"
                    )
                  : ""}
                .
              </span>
            </div>
            <Button
              variant="primary"
              disabled={isLoading || isSigning}
              onClick={handlePrint}
            >
              <Printer size={18} className="mr-2" />
              Imprimir
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="glass"
            disabled={isLoading || isSigning}
            isLoading={isSigning}
          >
            <Printer size={18} className="mr-2" />
            {isSigning ? "Assinando..." : "Assinar"}
          </Button>
        )}
      </div>

      {displayData && (
        <SignatureModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSignContract}
          studentName={displayData.name || ""}
        />
      )}
    </div>
  );
};

export default ContratoPage;
