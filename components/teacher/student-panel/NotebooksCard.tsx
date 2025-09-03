"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface Notebook {
  id: string;
  title: string;
  description: string;
  content: any;
  student: string;
  studentName?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface NotebooksCardProps {
  student: {
    id?: string;
    name?: string;
    email?: string;
    avatarUrl?: string;
  } | null;
  notebooks: Notebook[];
  onCreateNotebook: (title: string) => Promise<boolean>;
}

export default function NotebooksCard({
  student,
  notebooks,
  onCreateNotebook,
}: NotebooksCardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newNotebookTitle, setNewNotebookTitle] = useState("");

  // Filter notebooks by search query
  const filteredNotebooks = notebooks.filter(
    (notebook) =>
      notebook.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notebook.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle creating a new notebook
  const handleCreateNotebook = async () => {
    if (!newNotebookTitle.trim()) return;

    const success = await onCreateNotebook(newNotebookTitle);
    if (success) {
      setNewNotebookTitle("");
      setIsModalOpen(false);
    }
  };

  return (
    <div className="bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-lg p-4 flex-shrink-0 flex-1 flex flex-col">
      <div className="flex items-center space-x-4 mb-4">
        {student?.avatarUrl ? (
          <img
            src={student.avatarUrl}
            alt={student.name}
            className="w-16 h-16 rounded-xl object-cover"
          />
        ) : (
          <div className="bg-fluency-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
        )}
        <div>
          <h1 className="font-bold text-2xl">{student?.name || "Aluno"}</h1>
          <p className="text-fluency-gray-600 dark:text-fluency-gray-300">
            {student?.email || "Email não disponível"}
          </p>
        </div>
      </div>

      <div className="bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-lg p-4 flex-shrink-0 mt-4 flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Cadernos do Aluno</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-fluency-blue-500 hover:bg-fluency-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Criar Caderno
          </button>
        </div>

        <div className="relative w-full mb-4">
          <input
            type="text"
            placeholder="Buscar cadernos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-fluency-gray-100 dark:bg-fluency-gray-800 border border-fluency-gray-200 dark:border-fluency-gray-700 focus:outline-none focus:ring-2 focus:ring-fluency-blue-500"
          />
          <svg
            className="absolute left-3 top-3 text-fluency-gray-500 w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-3 text-fluency-gray-500 hover:text-fluency-red-500"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        <div className="flex-1 min-h-0">
          <div className="h-full overflow-y-auto custom-scrollbar">
            <div className="space-y-3">
              {filteredNotebooks.length > 0 ? (
                [...filteredNotebooks]
                  .sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime()
                  )
                  .map((notebook) => (
                    <motion.div
                      key={notebook.id}
                      whileHover={{ scale: 1.02 }}
                      className="bg-fluency-blue-100 dark:bg-fluency-gray-800 rounded-lg overflow-hidden border border-fluency-gray-200 dark:border-fluency-gray-700 p-4"
                    >
                      <Link
                        href={`/hub/plataforma/teacher/meus-alunos/${student?.id}/caderno/${notebook.id}`}
                        className="block"
                      >
                        <h3 className="font-bold text-lg mb-1">
                          {notebook.title}
                        </h3>
                        <div className="text-xs text-fluency-gray-500">
                          {notebook.createdAt &&
                            new Date(notebook.createdAt).toLocaleDateString(
                              "pt-BR"
                            )}
                        </div>
                      </Link>
                    </motion.div>
                  ))
              ) : (
                <div className="text-center py-8 text-fluency-gray-500">
                  {searchQuery
                    ? "Nenhum caderno encontrado"
                    : "Nenhum caderno disponível"}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal for creating notebook */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Criar Novo Caderno</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-fluency-gray-700 dark:text-fluency-gray-300 mb-1">
                Título *
              </label>
              <input
                type="text"
                value={newNotebookTitle}
                onChange={(e) => setNewNotebookTitle(e.target.value)}
                className="w-full px-3 py-2 border border-fluency-gray-300 dark:border-fluency-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-fluency-blue-500 focus:border-fluency-blue-500 bg-white dark:bg-fluency-gray-800"
                placeholder="Digite o título do caderno"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-fluency-gray-300 dark:border-fluency-gray-600 text-fluency-gray-700 dark:text-fluency-gray-300 rounded-md hover:bg-fluency-gray-50 dark:hover:bg-fluency-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fluency-blue-500"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateNotebook}
                className="px-4 py-2 bg-fluency-blue-500 text-white rounded-md hover:bg-fluency-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fluency-blue-500"
              >
                Criar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
