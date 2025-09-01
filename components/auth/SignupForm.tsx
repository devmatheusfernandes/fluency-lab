"use client";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignupForm() {
  const { signup, isLoading, error, isAuthenticated } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  // If user is already authenticated, redirect to hub
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/hub");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signup(name, email, password);
  };

  if (isAuthenticated) {
    return null; // Don't render form if already authenticated
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Criar Conta</h1>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nome"
        required
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Senha"
        required
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Aguarde..." : "Cadastrar"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
}
