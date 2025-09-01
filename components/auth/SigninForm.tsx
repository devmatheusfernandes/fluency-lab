"use client";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SigninForm() {
  const { login, isLoading, error, isAuthenticated } = useAuth();
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
    login(email, password);
  };

  if (isAuthenticated) {
    return null; // Don't render form if already authenticated
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Entrar</h1>
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
        {isLoading ? "Aguarde..." : "Entrar"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
}
