// Adicione no topo do arquivo para indicar que é um Client Component
"use client";

import { useState, useEffect } from "react";

// Lista de todas as variáveis de cor que você forneceu
const colorNames = [
  "--color-primary",
  "--color-primary-hover",
  "--color-primary-text",
  "--color-secondary",
  "--color-secondary-hover",
  "--color-secondary-text",
  "--color-background",
  "--color-container",
  "--color-surface-0",
  "--color-surface-1",
  "--color-surface-2",
  "--color-surface-hover",
  "--color-title",
  "--color-subtitle",
  "--color-paragraph",
  "--color-placeholder",
  "--color-success",
  "--color-success-light",
  "--color-info",
  "--color-info-light",
  "--color-warning",
  "--color-warning-light",
  "--color-danger",
  "--color-danger-light",
  "--color-error",
  "--color-white",
  "--color-white-light",
  "--color-ring",
  "--color-ring-offset",
];

// Componente para exibir um único cartão de cor
const ColorCard = ({ name }: { name: string }) => (
  <div
    className="border rounded-lg shadow-lg overflow-hidden flex flex-col"
    style={{
      backgroundColor: "var(--color-input)",
      borderColor: "var(--color-surface-2)",
    }}
  >
    <div className="h-32 w-full" style={{ backgroundColor: `var(${name})` }} />
    <div className="p-4">
      <p
        className="font-mono text-sm break-all"
        style={{ color: "var(--color-paragraph)" }}
      >
        {name}
      </p>
    </div>
  </div>
);

// Componente da página principal
export default function ColorsPage() {
  const [theme, setTheme] = useState("light");

  // Efeito para aplicar a classe de tema no elemento <html>
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <main
      className="p-8 transition-colors duration-300"
      style={{
        backgroundColor: "var(--color-background)",
        color: "var(--color-title)",
      }}
    >
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Paleta de Cores</h1>
          <button
            onClick={toggleTheme}
            className="px-4 py-2 rounded-lg font-semibold transition-colors duration-300"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-primary-text)",
            }}
          >
            Mudar para tema {theme === "light" ? "Escuro" : "Claro"}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {colorNames.map((name) => (
            <ColorCard key={name} name={name} />
          ))}
        </div>
      </div>
    </main>
  );
}
