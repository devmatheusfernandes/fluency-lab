"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import TiptapEditor from "@/components/ui/TiptapEditor";
import { Loading } from "@/components/ui/Loading";

interface Notebook {
  id: string;
  title: string;
  description: string;
  createdAt: any;
  updatedAt: any;
  student: string;
  content: any;
}

export default function VisualizarCaderno() {
  const { alunoId, notebookId } = useParams();
  const { data: session } = useSession();

  const [notebook, setNotebook] = useState<Notebook | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchNotebook = async () => {
      if (!alunoId || !notebookId || !session?.user?.id) return;

      try {
        setLoading(true);
        const response = await fetch(
          `/api/teacher/students/${alunoId}/notebooks/${notebookId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch notebook");
        }

        const data = await response.json();
        setNotebook(data);
      } catch (error: any) {
        console.error("Error fetching notebook:", error);
        setError("Erro ao carregar o caderno. Por favor, tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotebook();
  }, [alunoId, notebookId, session?.user?.id]);

  const handleContentSave = useCallback(
    async (content: string) => {
      if (!alunoId || !notebookId) return;

      try {
        const response = await fetch(
          `/api/teacher/students/${alunoId}/notebooks/${notebookId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              content,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Falha ao salvar o conteúdo.");
        }

        // Atualiza o notebook local com o novo conteúdo
        if (notebook) {
          setNotebook({ ...notebook, content });
        }
      } catch (error: any) {
        console.error("Error auto-saving content:", error);
        // Não mostra erro para o usuário em auto-save para não interromper a escrita
      }
    },
    [alunoId, notebookId, notebook]
  );

  if (loading) {
    return (
      <div className="min-w-screen min-h-[90vh] flex justify-center items-center overflow-y-hidden">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Erro! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  if (!notebook) {
    return (
      <div className="flex justify-center items-center h-64">
        <div
          className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Caderno não encontrado! </strong>
          <span className="block sm:inline">
            O caderno solicitado não foi encontrado.
          </span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fade-in min-h-screen"
    >
      <TiptapEditor
        content={notebook.content || ""}
        onSave={handleContentSave}
        placeholder="Comece a escrever o conteúdo do caderno..."
        className="min-h-screen"
      />
    </motion.div>
  );
}
