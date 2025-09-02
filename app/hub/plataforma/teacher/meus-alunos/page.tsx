"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface Student {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export default function MeusAlunos() {
  const { data: session } = useSession();
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      if (!session?.user?.id) return;

      try {
        setLoading(true);
        // Fetch the teacher's students from the API
        const response = await fetch(`/api/teacher/my-students`);

        if (!response.ok) {
          throw new Error("Failed to fetch students");
        }

        const data = await response.json();
        setStudents(data);
      } catch (error: any) {
        console.error("Error fetching students:", error);
        setError("Erro ao carregar os alunos. Por favor, tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [session?.user?.id]);

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase())
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
        {/* Search Bar */}
        <div className="bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-lg p-4 flex-shrink-0">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Buscar alunos..."
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

        {/* Students List */}
        <div className="flex-1 min-h-0">
          <div className="h-full overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-2">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <motion.div
                    key={student.id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-fluency-blue-100 dark:bg-fluency-gray-800 rounded-lg overflow-hidden border border-fluency-gray-200 dark:border-fluency-gray-700"
                  >
                    <div className="p-4">
                      <Link
                        href={`/hub/plataforma/teacher/meus-alunos/${student.id}`}
                        className="flex items-center space-x-4"
                      >
                        <div className="bg-fluency-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                        <div>
                          <h3 className="font-bold text-lg">{student.name}</h3>
                          <p className="text-fluency-gray-600 dark:text-fluency-gray-300 text-sm">
                            {student.email}
                          </p>
                        </div>
                      </Link>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-fluency-gray-500">
                  {searchQuery
                    ? "Nenhum aluno encontrado"
                    : "Nenhum aluno disponível"}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
