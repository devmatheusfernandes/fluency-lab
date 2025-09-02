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

export default function EditarCaderno() {
  const { alunoId, notebookId } = useParams();
  const router = useRouter();
  const { data: session } = useSession();

  const [notebook, setNotebook] = useState<Notebook | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

      // Redirect to the notebook view page
      router.push(
        `/hub/plataforma/teacher/meus-alunos/${alunoId}/caderno/${notebookId}`
      );
    } catch (error: any) {
      console.error("Error updating notebook:", error);
      setError("Erro ao atualizar o caderno. Por favor, tente novamente.");
    } finally {
      setSaving(false);
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
    <div className="fade-in p-4 h-full">
      <div className="bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-lg p-6 h-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-fluency-primary dark:text-fluency-primary-dark mb-2">
            Editar Caderno
          </h1>
          <p className="text-fluency-gray-600 dark:text-fluency-gray-300">
            Editando: {notebook.title}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded relative">
            <strong className="font-bold">Erro! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-fluency-gray-700 dark:text-fluency-gray-300 mb-1"
            >
              Título *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-fluency-gray-300 dark:border-fluency-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-fluency-blue-500 focus:border-fluency-blue-500 bg-white dark:bg-fluency-gray-800"
              placeholder="Digite o título do caderno"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-fluency-gray-700 dark:text-fluency-gray-300 mb-1"
            >
              Descrição
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-fluency-gray-300 dark:border-fluency-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-fluency-blue-500 focus:border-fluency-blue-500 bg-white dark:bg-fluency-gray-800"
              placeholder="Digite uma descrição para o caderno"
            />
          </div>

          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-fluency-gray-700 dark:text-fluency-gray-300 mb-1"
            >
              Conteúdo
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={15}
              className="w-full px-3 py-2 border border-fluency-gray-300 dark:border-fluency-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-fluency-blue-500 focus:border-fluency-blue-500 bg-white dark:bg-fluency-gray-800"
              placeholder="Digite o conteúdo do caderno"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() =>
                router.push(
                  `/hub/plataforma/teacher/meus-alunos/${alunoId}/caderno/${notebookId}`
                )
              }
              className="px-4 py-2 border border-fluency-gray-300 dark:border-fluency-gray-600 text-fluency-gray-700 dark:text-fluency-gray-300 rounded-md hover:bg-fluency-gray-50 dark:hover:bg-fluency-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fluency-blue-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-fluency-blue-500 text-white rounded-md hover:bg-fluency-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fluency-blue-500 disabled:opacity-50"
            >
              {saving ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
