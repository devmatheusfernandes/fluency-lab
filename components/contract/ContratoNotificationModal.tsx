import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useContractNotification } from "@/hooks/useContract";
import { ArrowRight } from "@solar-icons/react/ssr";
import { ShieldWarning } from "@solar-icons/react";

const ContratoNotificationModal = () => {
  const { data: session, status } = useSession();
  const { notification, shouldShow } = useContractNotification();

  if (status !== "authenticated" || !shouldShow) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 animate-fadeIn">
      <div className="bg-fluency-orange-600 text-black p-4 shadow-lg">
        <div className="container mx-auto flex flex-col md:flex-row justify-center gap-4 items-center">
          <div className="flex items-center mb-2 md:mb-0">
            <ShieldWarning size={24} className="mr-2" weight="Bold" />
            <span className="font-semibold">
              Seu contrato ainda não foi assinado!
            </span>
          </div>

          <Link
            href="contrato"
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors duration-300 flex items-center"
          >
            Assinar Agora
            <ArrowRight size={20} className="ml-1" weight="Bold" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ContratoNotificationModal;
