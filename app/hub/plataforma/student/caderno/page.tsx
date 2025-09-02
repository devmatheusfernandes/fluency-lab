"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface Notebook {
  studentName: string;
  id: string;
  title: string;
  description: string;
  createdAt: any;
  student: string;
  content: any;
}

export default function Caderno() {
  const { data: session } = useSession();
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredNotebooks, setFilteredNotebooks] = useState<Notebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const id = session?.user?.id;

  // Fetch notebooks
  useEffect(() => {
    const fetchNotebooks = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/student/notebooks`);

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
  }, [id]);

  // Filter notebooks based on search query
  useEffect(() => {
    if (searchQuery) {
      const filtered = notebooks.filter(
        (notebook) =>
          notebook.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          notebook.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredNotebooks(filtered);
    } else {
      setFilteredNotebooks(notebooks);
    }
  }, [searchQuery, notebooks]);

  const sortedNotebooks = [...filteredNotebooks].sort((a, b) => {
    const parseDate = (dateString: string) => {
      const [day, month, year] = dateString.split("/").map(Number);
      return new Date(year, month - 1, day);
    };

    const dateA = parseDate(a.title); // Convert the title string of notebook a to a Date object
    const dateB = parseDate(b.title); // Convert the title string of notebook b to a Date object

    if (sortOrder === "asc") {
      return dateA.getTime() - dateB.getTime(); // Ascending order
    } else {
      return dateB.getTime() - dateA.getTime(); // Descending order
    }
  });

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
      {/* Mobile Layout */}
      <div className="lg:hidden flex flex-col gap-3 h-full overflow-hidden">
        {/* Search Bar - Mobile */}
        <div className="bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-lg p-4 flex-shrink-0">
          <div className="relative w-full tour-notebooks-search">
            <input
              type="text"
              placeholder="Buscar lições..."
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

        <div className="flex-1 min-h-0 tour-notebooks-list">
          <div className="h-full overflow-y-auto custom-scrollbar">
            <div className="flex flex-col gap-4 pr-2">
              <AnimatePresence>
                {sortedNotebooks.length > 0 ? (
                  sortedNotebooks.map((notebook) => (
                    <motion.div
                      key={notebook.id}
                      whileHover={{ scale: 1.02, y: 5 }}
                      exit={{ scale: 0.9 }}
                      className="bg-fluency-blue-100 dark:bg-fluency-gray-800 rounded-lg overflow-hidden border border-fluency-gray-200 dark:border-fluency-gray-700 flex-shrink-0"
                    >
                      <div className="flex justify-between items-start p-4">
                        <Link
                          href={{
                            pathname: `/hub/plataforma/student/caderno/${encodeURIComponent(
                              notebook.studentName
                            )}`,
                            query: {
                              notebook: notebook.id,
                              student: notebook.student,
                            },
                          }}
                          passHref
                          className="flex-1 min-w-0"
                        >
                          <div>
                            <h3 className="font-bold text-lg mb-2 break-words">
                              {notebook.title}
                            </h3>
                            <p className="text-fluency-gray-600 dark:text-fluency-gray-300 text-sm line-clamp-2 break-words">
                              {notebook.description || "Sem descrição"}
                            </p>
                          </div>
                        </Link>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="col-span-full text-center py-8 text-fluency-gray-500"
                  >
                    {searchQuery
                      ? "Nenhum caderno encontrado"
                      : "Nenhum caderno disponível"}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex gap-3 h-full overflow-hidden">
        {/* Notebooks Section - Desktop */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-2/3 rounded-lg bg-fluency-pages-light dark:bg-fluency-pages-dark p-4 flex flex-col min-h-0"
        >
          <div className="flex justify-between items-center mb-4 gap-4 tour-call-button flex-shrink-0">
            <div className="relative w-full tour-notebooks-search">
              <input
                type="text"
                placeholder="Buscar lições..."
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

          <div className="flex-1 min-h-0 tour-notebooks-list">
            <div className="h-full overflow-y-auto custom-scrollbar">
              <div className="flex flex-col gap-4 pr-2">
                <AnimatePresence>
                  {sortedNotebooks.length > 0 ? (
                    sortedNotebooks.map((notebook) => (
                      <motion.div
                        key={notebook.id}
                        whileHover={{ scale: 1.02, y: 5 }}
                        exit={{ scale: 0.9 }}
                        className="bg-fluency-blue-100 dark:bg-fluency-gray-800 rounded-lg overflow-hidden border border-fluency-gray-200 dark:border-fluency-gray-700 flex-shrink-0"
                      >
                        <div className="flex justify-between items-start p-4">
                          <Link
                            href={{
                              pathname: `/hub/plataforma/student/caderno/${encodeURIComponent(
                                notebook.studentName
                              )}`,
                              query: {
                                notebook: notebook.id,
                                student: notebook.student,
                              },
                            }}
                            passHref
                            className="flex-1 min-w-0"
                          >
                            <div>
                              <h3 className="font-bold text-lg mb-2 break-words">
                                {notebook.title}
                              </h3>
                              <p className="text-fluency-gray-600 dark:text-fluency-gray-300 text-sm line-clamp-2 break-words">
                                {notebook.description || "Sem descrição"}
                              </p>
                            </div>
                          </Link>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="col-span-full text-center py-8 text-fluency-gray-500"
                    >
                      {searchQuery
                        ? "Nenhum caderno encontrado"
                        : "Nenhum caderno disponível"}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
