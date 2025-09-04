"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
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
import { Bag2 } from "@solar-icons/react";
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

export default function NotebooksCard({
  student,
  notebooks,
  onCreateNotebook,
  userRole,
  onAddTask,
  loading = false, // Default to false
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

  return (
    <SubContainer>
      <div className="flex flex-row gap-2 mb-6">
        <SearchBar
          placeholder="Buscar cadernos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
        <Button className="min-w-max" onClick={() => setIsModalOpen(true)}>
          Criar Caderno
        </Button>
      </div>

      <div className="flex flex-col gap-3">
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
                className="flex flex-row items-start justify-between rounded-lg overflow-hidden border border-container/50 p-4 bg-container/80"
              >
                <Link
                  href={`/hub/plataforma/teacher/meus-alunos/${student?.id}/caderno/${notebook.id}`}
                  className="block"
                >
                  <h3 className="font-bold text-lg text-title">
                    {notebook.title}
                  </h3>
                  <div className="text-xs text-paragraph opacity-70">
                    {notebook.createdAt &&
                      new Date(notebook.createdAt).toLocaleDateString("pt-BR")}
                  </div>
                </Link>
                {userRole === "teacher" && onAddTask && (
                  <Bag2
                    weight="BoldDuotone"
                    className="w-5 h-5 hover:text-secondary duration-300 easy-in-out transition-all cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleAddNotebookAsTask(notebook);
                    }}
                  />
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

      {/* Modal for creating notebook */}
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
                onChange={(e) => setNewNotebookTitle(e.target.value)}
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
    </SubContainer>
  );
}
