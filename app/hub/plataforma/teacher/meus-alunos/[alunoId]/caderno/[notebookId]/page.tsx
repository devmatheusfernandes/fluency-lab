"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";

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
  const router = useRouter();
  const { data: session } = useSession();

  const [notebook, setNotebook] = useState<Notebook | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

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
        setTitle(data.title);
        setDescription(data.description);
        setContent(data.content);
      } catch (error: any) {
        console.error("Error fetching notebook:", error);
        setError("Erro ao carregar o caderno. Por favor, tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotebook();
  }, [alunoId, notebookId, session?.user?.id]);

  const handleSave = async () => {
    if (!title.trim()) {
      setError("O título é obrigatório.");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const response = await fetch(
        `/api/teacher/students/${alunoId}/notebooks/${notebookId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            description,
            content,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Falha ao atualizar o caderno.");
      }

      const updatedNotebook = await response.json();
      setNotebook(updatedNotebook);
      setIsEditing(false);
    } catch (error: any) {
      console.error("Error updating notebook:", error);
      setError("Erro ao atualizar o caderno. Por favor, tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Tem certeza que deseja excluir este caderno?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/teacher/students/${alunoId}/notebooks/${notebookId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Falha ao excluir o caderno.");
      }

      // Redirect to the student's panel
      router.push(`/hub/plataforma/teacher/meus-alunos/${alunoId}`);
    } catch (error: any) {
      console.error("Error deleting notebook:", error);
      setError("Erro ao excluir o caderno. Por favor, tente novamente.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fluency-blue-500"></div>
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
      className="fade-in p-4 h-full"
    >
      <div className="bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-lg p-6 h-full">
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded relative">
            <strong className="font-bold">Erro! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="mb-6">
          {isEditing ? (
            <div className="space-y-4">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-2xl font-bold text-fluency-primary dark:text-fluency-primary-dark bg-transparent border-b border-fluency-gray-300 dark:border-fluency-gray-600 focus:outline-none focus:border-fluency-blue-500 w-full"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="text-fluency-gray-600 dark:text-fluency-gray-300 bg-transparent border-b border-fluency-gray-300 dark:border-fluency-gray-600 focus:outline-none focus:border-fluency-blue-500 w-full"
              />
            </div>
          ) : (
            <div>
              <h1 className="text-2xl font-bold text-fluency-primary dark:text-fluency-primary-dark mb-2">
                {notebook.title}
              </h1>
              <p className="text-fluency-gray-600 dark:text-fluency-gray-300">
                {notebook.description || "Sem descrição"}
              </p>
            </div>
          )}

          <div className="mt-4 text-sm text-fluency-gray-500 dark:text-fluency-gray-400">
            {notebook.createdAt && (
              <span>
                Criado em:{" "}
                {new Date(notebook.createdAt).toLocaleDateString("pt-BR")} às{" "}
                {new Date(notebook.createdAt).toLocaleTimeString("pt-BR")}
              </span>
            )}
            {notebook.updatedAt &&
              notebook.updatedAt !== notebook.createdAt && (
                <span className="ml-4">
                  Atualizado em:{" "}
                  {new Date(notebook.updatedAt).toLocaleDateString("pt-BR")} às{" "}
                  {new Date(notebook.updatedAt).toLocaleTimeString("pt-BR")}
                </span>
              )}
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() =>
              router.push(`/hub/plataforma/teacher/meus-alunos/${alunoId}`)
            }
            className="flex items-center text-fluency-blue-500 hover:text-fluency-blue-600"
          >
            <svg
              className="w-5 h-5 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Voltar para os cadernos
          </button>

          <div className="space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-fluency-gray-300 dark:border-fluency-gray-600 text-fluency-gray-700 dark:text-fluency-gray-300 rounded-md hover:bg-fluency-gray-50 dark:hover:bg-fluency-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fluency-blue-500"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-fluency-blue-500 text-white rounded-md hover:bg-fluency-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fluency-blue-500 disabled:opacity-50"
                >
                  {saving ? "Salvando..." : "Salvar"}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-fluency-blue-500 text-white rounded-md hover:bg-fluency-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fluency-blue-500"
                >
                  Editar
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Excluir
                </button>
              </>
            )}
          </div>
        </div>

        <div className="border-t border-fluency-gray-200 dark:border-fluency-gray-700 pt-4">
          {isEditing ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={15}
              className="w-full px-3 py-2 border border-fluency-gray-300 dark:border-fluency-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-fluency-blue-500 focus:border-fluency-blue-500 bg-white dark:bg-fluency-gray-800"
              placeholder="Digite o conteúdo do caderno"
            />
          ) : notebook.content ? (
            <div
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: notebook.content }}
            />
          ) : (
            <p className="text-fluency-gray-500 italic">
              Nenhum conteúdo disponível para este caderno.
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
