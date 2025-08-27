"use client";

import {
  Modal,
  ModalBody,
  ModalClose,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalPrimaryButton,
  ModalSecondaryButton,
  ModalTitle,
  ModalIcon,
} from "@/components/ui/Modal";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (deleteType: "single" | "future") => void;
  isLoading: boolean;
  isRepeating: boolean; // Para saber se mostra as duas opções
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  isRepeating,
}: DeleteConfirmationModalProps) {
  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent>
        <ModalHeader>
          <ModalIcon type="delete" />
          <ModalTitle>Confirmar Deleção</ModalTitle>
          <ModalClose />
        </ModalHeader>
        <ModalBody>
          <p className="text-center text-gray-600">
            {isRepeating
              ? "Este é um evento recorrente. Como você gostaria de deletá-lo?"
              : "Você tem certeza que deseja deletar este horário?"}
          </p>
        </ModalBody>
        <ModalFooter className="!flex-col sm:!flex-col">
          {isRepeating && (
            <>
              <ModalPrimaryButton
                onClick={() => onConfirm("future")}
                disabled={isLoading}
                variant="destructive"
              >
                {isLoading ? "Deletando..." : "Deletar esta e as futuras"}
              </ModalPrimaryButton>
              <ModalSecondaryButton
                onClick={() => onConfirm("single")}
                disabled={isLoading}
              >
                Deletar somente esta ocorrência
              </ModalSecondaryButton>
            </>
          )}
          {!isRepeating && (
            <ModalPrimaryButton
              onClick={() => onConfirm("single")}
              disabled={isLoading}
              variant="destructive"
            >
              {isLoading ? "Deletando..." : "Sim, deletar este horário"}
            </ModalPrimaryButton>
          )}
          <ModalSecondaryButton onClick={onClose} disabled={isLoading}>
            Cancelar
          </ModalSecondaryButton>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
