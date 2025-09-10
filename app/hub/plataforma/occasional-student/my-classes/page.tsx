"use client";

import { useEffect } from "react";
import { useStudent } from "@/hooks/useStudent";

export default function MyClassesPage() {
  // O hook agora gerencia o estado e a lógica de fetch
  const { myClasses, isLoading, error, cancelClass, fetchMyClasses } =
    useStudent();

  // O useEffect agora só precisa ser chamado uma vez para buscar os dados
  useEffect(() => {
    fetchMyClasses();
  }, [fetchMyClasses]); // A dependência garante que a função seja estável

  const handleCancel = (classId: string, scheduledAt: Date) => {
    if (window.confirm("Tem certeza que deseja cancelar esta aula?")) {
      // A chamada agora passa o ID da aula e a data agendada
      cancelClass(classId, scheduledAt);
    }
  };

  if (isLoading) return <p>Carregando suas aulas...</p>;
  if (error) return <p style={{ color: "red" }}>Erro: {error}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Minhas Aulas Agendadas</h1>
      {myClasses.length === 0 ? (
        <p>Você ainda não tem nenhuma aula agendada.</p>
      ) : (
        <ul>
          {myClasses.map((cls) => {
            const classDate = new Date(cls.scheduledAt);
            const formattedDate = classDate.toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "2-digit",
              month: "long",
              year: "numeric",
            });
            const formattedTime = classDate.toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <li
                key={cls.id}
                style={{
                  border: "1px solid #ccc",
                  padding: "10px",
                  marginBottom: "10px",
                }}
              >
                <p>
                  <strong>Data:</strong> {formattedDate}
                </p>
                <p>
                  <strong>Horário:</strong> {formattedTime}
                </p>
                <p>
                  <strong>Status:</strong> {cls.status}
                </p>

                {/* Mostra o botão de cancelar apenas para aulas futuras agendadas */}
                {cls.status === "scheduled" &&
                  new Date(cls.scheduledAt) > new Date() && (
                    <button
                      onClick={() => handleCancel(cls.id, new Date(cls.scheduledAt))}
                      disabled={isLoading}
                      style={{ marginTop: "10px", color: "red" }}
                    >
                      {isLoading ? "Cancelando..." : "Cancelar Aula"}
                    </button>
                  )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
