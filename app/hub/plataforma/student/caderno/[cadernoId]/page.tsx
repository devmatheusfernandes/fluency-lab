"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Notebook } from "@/types/notebooks/notebooks";

export default function CadernoID() {
  const { data: session } = useSession();
  const params = useParams();
  const searchParams = useSearchParams();
  const [notebook, setNotebook] = useState<Notebook | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const notebookId = searchParams.get("notebook");
  const studentId = session?.user?.id;

  useEffect(() => {
    const fetchNotebook = async () => {
      if (!studentId || !notebookId) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/student/notebooks/${notebookId}`);

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
  }, [studentId, notebookId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2 border-
blue-500"
        ></div>
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
      <div
        className="bg-
pages-light dark:bg-
pages-dark rounded-lg p-6 h-full"
      >
        <div className="mb-6">
          <h1
            className="text-2xl font-bold text-
primary dark:text-primary-dark mb-2"
          >
            {notebook.title}
          </h1>
          <p
            className="text-
gray-600 dark:text-
gray-300"
          >
            {notebook.description || "Sem descrição"}
          </p>
        </div>

        <div
          className="border-t border-
gray-200 dark:border-
gray-700 pt-4"
        >
          {notebook.content ? (
            <div
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: notebook.content }}
            />
          ) : (
            <p
              className="text-
gray-500 italic"
            >
              Nenhum conteúdo disponível para este caderno.
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
