"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalClose,
  ModalFooter,
  ModalSecondaryButton,
  ModalPrimaryButton,
  ModalIcon,
  ModalInput,
} from "@/components/ui/Modal";
import { SearchBar } from "@/components/ui/SearchBar";
import { useToast } from "@/components/ui/Toast";
import { NoResults } from "@/components/ui/NoResults/NoResults";
import { SubContainer } from "@/components/ui/SubContainer";
import { Bag2, AddSquare, Document } from "@solar-icons/react/ssr";
import jsPDF from "jspdf";
import { Notebook } from "@/types/notebooks/notebooks";

interface NotebooksCardProps {
  student: {
    id?: string;
    name?: string;
    email?: string;
    avatarUrl?: string;
  } | null;
  notebooks: Notebook[];
  onCreateNotebook: (title: string) => Promise<boolean>;
  userRole?: string;
  onAddTask?: (taskText: string) => Promise<boolean>;
  loading?: boolean; // Added loading prop
}

// Skeleton component for notebook items
const NotebookSkeleton = () => (
  <div className="flex flex-row items-start justify-between rounded-lg overflow-hidden border border-container/50 p-4 bg-container/80 animate-pulse">
    <div className="flex-1">
      <div className="h-5 bg-input/20 dark:bg-input/80 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-input/20 dark:bg-input/80 rounded w-1/2"></div>
    </div>
    <div className="h-5 w-5 bg-input/20 dark:bg-input/80 rounded"></div>
  </div>
);

// PDF Content Component for printing
const NotebookPDFContent = React.forwardRef<
  HTMLDivElement,
  { notebook: Notebook }
>(({ notebook }, ref) => {
  return (
    <div ref={ref} className="p-8 bg-white text-black">
      <h1 className="text-2xl font-bold mb-4">{notebook.title}</h1>
      <p className="text-sm text-gray-500 mb-6">
        Criado em:{" "}
        {notebook.createdAt &&
          new Date(notebook.createdAt).toLocaleDateString("pt-BR")}
      </p>
      {notebook.description && (
        <p className="text-gray-700 mb-6">{notebook.description}</p>
      )}
      <div className="border-t border-gray-300 pt-4">
        <h2 className="text-xl font-semibold mb-3">Conteúdo</h2>
        <div className="whitespace-pre-wrap">{notebook.content}</div>
      </div>
    </div>
  );
});
NotebookPDFContent.displayName = "NotebookPDFContent";

export default function NotebooksCard({
  student,
  notebooks,
  onCreateNotebook,
  userRole,
  onAddTask,
  loading = false,
}: NotebooksCardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newNotebookTitle, setNewNotebookTitle] = useState("");
  const { success, error } = useToast();

  // Filter notebooks by search query
  const filteredNotebooks = notebooks.filter(
    (notebook) =>
      notebook.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notebook.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle creating a new notebook
  const handleCreateNotebook = async () => {
    if (!newNotebookTitle.trim()) return;

    try {
      const successResult = await onCreateNotebook(newNotebookTitle);
      if (successResult) {
        setNewNotebookTitle("");
        setIsModalOpen(false);
        success({
          title: "Sucesso!",
          description: "Caderno criado com sucesso.",
        });
      } else {
        error({
          title: "Erro!",
          description: "Não foi possível criar o caderno.",
        });
      }
    } catch (err) {
      error({
        title: "Erro!",
        description: "Ocorreu um erro ao criar o caderno.",
      });
    }
  };

  // Handle adding notebook as a task for review
  const handleAddNotebookAsTask = async (notebook: Notebook) => {
    if (!onAddTask) return;

    const taskText = `Revisar caderno: ${notebook.title} - ${new Date(notebook.createdAt).toLocaleDateString("pt-BR")}`;

    try {
      const successResult = await onAddTask(taskText);
      if (successResult) {
        success({
          title: "Sucesso!",
          description: "Caderno adicionado às tarefas para revisão!",
        });
      } else {
        error({
          title: "Erro!",
          description: "Não foi possível adicionar o caderno às tarefas.",
        });
      }
    } catch (err) {
      error({
        title: "Erro!",
        description: "Ocorreu um erro ao adicionar o caderno às tarefas.",
      });
    }
  };

  // Handle downloading notebook as PDF
  const handleDownloadNotebookPDF = (notebook: Notebook) => {
    try {
      // Create a new jsPDF instance
      const doc = new jsPDF();

      // Set document properties
      doc.setProperties({
        title: notebook.title,
      });

      // Add title
      doc.setFontSize(22);
      doc.text(notebook.title, 10, 20);

      // Add creation date
      doc.setFontSize(12);
      const createdAtText = `Criado em: ${notebook.createdAt ? new Date(notebook.createdAt).toLocaleDateString("pt-BR") : "N/A"}`;
      doc.text(createdAtText, 10, 30);

      // Add description if available
      if (notebook.description) {
        doc.setFontSize(14);
        doc.text("Descrição:", 10, 45);
        doc.setFontSize(12);
        const splitDescription = doc.splitTextToSize(notebook.description, 180);
        doc.text(splitDescription, 10, 55);

        // Update y position based on description height
        const descriptionHeight = splitDescription.length * 5;
        var yPos = 60 + descriptionHeight;
      } else {
        var yPos = 45;
      }

      // Add content
      doc.setFontSize(14);
      doc.text("Conteúdo:", 10, yPos);
      yPos += 10;

      doc.setFontSize(12);
      const content = notebook.content || "Nenhum conteúdo disponível";
      const splitContent = doc.splitTextToSize(content, 180);
      doc.text(splitContent, 10, yPos);

      // Save the PDF
      doc.save(`${notebook.title.replace(/\s+/g, "_")}.pdf`);

      success({
        title: "Sucesso!",
        description: "Caderno baixado como PDF com sucesso!",
      });
    } catch (err) {
      error({
        title: "Erro!",
        description: "Ocorreu um erro ao baixar o caderno como PDF.",
      });
      console.error("Error generating PDF:", err);
    }
  };

  return (
    <SubContainer>
      <div className="flex flex-row gap-2 mb-4 relative">
        <SearchBar
          placeholder="Buscar cadernos..."
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearchQuery(e.target.value)
          }
          className="w-full pl-10 pr-12" // Added padding to accommodate the button
        />
        {/* Only show the add button for teachers */}
        {userRole === "teacher" && (
          <AddSquare
            weight="BoldDuotone"
            className="absolute right-0 top-1/2 transform -translate-y-1/2 p-2 min-w-11 min-h-11 text-secondary hover:text-secondary-hover duration-300 ease-in-out transition-all cursor-pointer"
            onClick={() => setIsModalOpen(true)}
          />
        )}
      </div>

      <div className="flex flex-col gap-2">
        {loading ? (
          // Render skeleton loaders when loading
          Array.from({ length: 3 }).map((_, index) => (
            <NotebookSkeleton key={index} />
          ))
        ) : filteredNotebooks.length > 0 ? (
          [...filteredNotebooks]
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .map((notebook, index) => (
              <motion.div
                key={notebook.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.01 }}
                className="flex flex-row items-start justify-between overflow-hidden p-4 card-base"
              >
                <Link
                  href={`/hub/plataforma/teacher/meus-alunos/${student?.id}/caderno/${notebook.id}`}
                  className="block flex-1"
                >
                  <h3 className="font-bold text-lg text-title">
                    {notebook.title}
                  </h3>
                  <div className="text-xs text-paragraph opacity-70">
                    {notebook.createdAt &&
                      new Date(notebook.createdAt).toLocaleDateString("pt-BR")}
                  </div>
                </Link>
                {/* Action buttons - only show for teachers */}
                {userRole === "teacher" && (
                  <div className="flex items-center gap-2">
                    <Document
                      weight="BoldDuotone"
                      className="w-5 h-5 hover:text-secondary duration-300 easy-in-out transition-all cursor-pointer"
                      onClick={(e: React.MouseEvent<SVGSVGElement>) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleDownloadNotebookPDF(notebook);
                      }}
                    />
                    {onAddTask && (
                      <Bag2
                        weight="BoldDuotone"
                        className="w-5 h-5 hover:text-secondary duration-300 easy-in-out transition-all cursor-pointer"
                        onClick={(e: React.MouseEvent<SVGSVGElement>) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleAddNotebookAsTask(notebook);
                        }}
                      />
                    )}
                  </div>
                )}
              </motion.div>
            ))
        ) : (
          <NoResults
            searchQuery={searchQuery}
            customMessage={{
              withSearch: `Nenhum caderno encontrado para "${searchQuery}"`,
              withoutSearch: "Nenhum caderno criado ainda",
            }}
            className="p-8"
          />
        )}
      </div>

      {/* Modal for creating notebook - only for teachers */}
      {userRole === "teacher" && (
        <Modal open={isModalOpen} onOpenChange={setIsModalOpen}>
          <ModalContent className="max-w-md">
            <ModalIcon type="confirm" />
            <ModalHeader>
              <ModalTitle>Criar Novo Caderno</ModalTitle>
              <ModalClose />
            </ModalHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-title mb-1">
                  Título *
                </label>
                <ModalInput
                  type="text"
                  value={newNotebookTitle}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNewNotebookTitle(e.target.value)
                  }
                  placeholder="Digite o título do caderno"
                />
              </div>
              <ModalFooter>
                <ModalSecondaryButton onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </ModalSecondaryButton>
                <ModalPrimaryButton
                  onClick={handleCreateNotebook}
                  disabled={!newNotebookTitle.trim()}
                >
                  Criar
                </ModalPrimaryButton>
              </ModalFooter>
            </div>
          </ModalContent>
        </Modal>
      )}
    </SubContainer>
  );
}
