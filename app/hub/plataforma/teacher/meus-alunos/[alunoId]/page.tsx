"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

interface Notebook {
  id: string;
  title: string;
  description: string;
  createdAt: any;
  student: string;
  content: any;
}

interface Student {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export default function AlunoPainel() {
  const { alunoId } = useParams();
  const { data: session } = useSession();
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch student data
  useEffect(() => {
    const fetchStudent = async () => {
      if (!alunoId || !session?.user?.id) return;

      try {
        // Fetch the student data from the API
        const response = await fetch(`/api/admin/users/${alunoId}/details`);

        if (!response.ok) {
          throw new Error("Failed to fetch student data");
        }

        const studentData = await response.json();
        setStudent({
          id: studentData.id,
          name: studentData.name,
          email: studentData.email,
          avatarUrl: studentData.avatarUrl,
        });
      } catch (error: any) {
        console.error("Error fetching student:", error);
        setError(
          "Erro ao carregar os dados do aluno. Por favor, tente novamente."
        );
      }
    };

    fetchStudent();
  }, [alunoId, session?.user?.id]);

  // Fetch notebooks
  useEffect(() => {
    const fetchNotebooks = async () => {
      if (!alunoId || !session?.user?.id) return;

      try {
        setLoading(true);
        const response = await fetch(
          `/api/teacher/students/${alunoId}/notebooks`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch notebooks");
        }

        const data = await response.json();
        setNotebooks(data);
      } catch (error: any) {
        console.error("Error fetching notebooks:", error);
        setError("Erro ao carregar os cadernos. Por favor, tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotebooks();
  }, [alunoId, session?.user?.id]);

  const filteredNotebooks = notebooks.filter(
    (notebook) =>
      notebook.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notebook.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  return (
    <div className="fade-in fade-out p-2 h-max md:h-max lg:h-[92vh] min-w-screen overflow-hidden">
      <div className="flex flex-col gap-3 h-full overflow-hidden">
        {/* Student Header */}
        <div className="bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-lg p-4 flex-shrink-0">
          <div className="flex items-center space-x-4">
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
        </div>

        {/* Search Bar */}
        <div className="bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-lg p-4 flex-shrink-0">
          <div className="relative w-full">
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
        </div>

        {/* Notebooks Section */}
        <div className="flex-1 min-h-0">
          <div className="h-full overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Cadernos do Aluno</h2>
              <button
                onClick={() =>
                  router.push(
                    `/hub/plataforma/teacher/meus-alunos/${alunoId}/criar-caderno`
                  )
                }
                className="bg-fluency-blue-500 hover:bg-fluency-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Criar Caderno
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-2">
              {filteredNotebooks.length > 0 ? (
                filteredNotebooks.map((notebook) => (
                  <motion.div
                    key={notebook.id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-fluency-blue-100 dark:bg-fluency-gray-800 rounded-lg overflow-hidden border border-fluency-gray-200 dark:border-fluency-gray-700"
                  >
                    <div className="p-4">
                      <Link
                        href={`/hub/plataforma/teacher/meus-alunos/${alunoId}/caderno/${notebook.id}`}
                        className="block"
                      >
                        <h3 className="font-bold text-lg mb-2">
                          {notebook.title}
                        </h3>
                        <p className="text-fluency-gray-600 dark:text-fluency-gray-300 text-sm line-clamp-2">
                          {notebook.description || "Sem descrição"}
                        </p>
                        <div className="mt-3 text-xs text-fluency-gray-500">
                          {notebook.createdAt &&
                            new Date(notebook.createdAt).toLocaleDateString(
                              "pt-BR"
                            )}
                        </div>
                      </Link>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-fluency-gray-500">
                  {searchQuery
                    ? "Nenhum caderno encontrado"
                    : "Nenhum caderno disponível"}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
