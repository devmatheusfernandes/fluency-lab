"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function CriarCaderno() {
  const { alunoId } = useParams();
  const router = useRouter();
  const { data: session } = useSession();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("O título é obrigatório.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/teacher/students/${alunoId}/notebooks`,
        {
          method: "POST",
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
        throw new Error("Falha ao criar o caderno.");
      }

      setSuccess(true);
      // Redirect to the student's panel after a short delay
      setTimeout(() => {
        router.push(`/hub/plataforma/teacher/meus-alunos/${alunoId}`);
      }, 1500);
    } catch (error: any) {
      console.error("Error creating notebook:", error);
      setError("Erro ao criar o caderno. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in p-4 h-full">
      <div className="bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-lg p-6 h-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-fluency-primary dark:text-fluency-primary-dark mb-2">
            Criar Novo Caderno
          </h1>
          <p className="text-fluency-gray-600 dark:text-fluency-gray-300">
            Crie um novo caderno para o aluno
          </p>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded relative">
            <strong className="font-bold">Sucesso! </strong>
            <span className="block sm:inline">Caderno criado com sucesso.</span>
          </div>
        )}

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
              rows={10}
              className="w-full px-3 py-2 border border-fluency-gray-300 dark:border-fluency-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-fluency-blue-500 focus:border-fluency-blue-500 bg-white dark:bg-fluency-gray-800"
              placeholder="Digite o conteúdo do caderno"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-fluency-gray-300 dark:border-fluency-gray-600 text-fluency-gray-700 dark:text-fluency-gray-300 rounded-md hover:bg-fluency-gray-50 dark:hover:bg-fluency-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fluency-blue-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-fluency-blue-500 text-white rounded-md hover:bg-fluency-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fluency-blue-500 disabled:opacity-50"
            >
              {loading ? "Criando..." : "Criar Caderno"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
