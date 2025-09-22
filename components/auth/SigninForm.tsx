"use client";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

export default function SigninForm() {
  const { isLoading, error, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get the callback URL from query parameters
  const callbackUrl = searchParams.get("callbackUrl") || "/hub";

  // If user is already authenticated, redirect to hub
  useEffect(() => {
    if (isAuthenticated) {
      router.push(callbackUrl);
    }
  }, [isAuthenticated, router, callbackUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        // Check if 2FA is required
        if (result.error === "2FA_REQUIRED") {
          // Store credentials securely using server action and sessionStorage as fallback
          try {
            // Try server-side storage first
            const { storeTwoFactorData } = await import('@/lib/auth/twoFactorStorage');
            await storeTwoFactorData(email, password);
            
            // Also store in sessionStorage as fallback
            const tempData = {
              email,
              password,
              timestamp: Date.now()
            };
            sessionStorage.setItem('temp-2fa-data', JSON.stringify(tempData));
            
            // Redirect to 2FA verification page
            router.push(
              `/signin/2fa?callbackUrl=${encodeURIComponent(callbackUrl)}`
            );
          } catch (error) {
             console.error('Erro ao armazenar dados do 2FA:', error);
              // Try fallback storage only
              try {
                const tempData = {
                  email,
                  password,
                  timestamp: Date.now()
                };
                sessionStorage.setItem('temp-2fa-data', JSON.stringify(tempData));
               router.push(
                 `/signin/2fa?callbackUrl=${encodeURIComponent(callbackUrl)}`
               );
             } catch (fallbackError) {
               console.error('Erro no fallback storage:', fallbackError);
               setLocalError('Erro interno. Tente novamente.');
             }
           }
        } else {
           // Handle other errors
           console.error("Sign in error:", result.error);
           setLocalError('Credenciais inválidas.');
         }
      } else if (result?.ok) {
        // Successful login without 2FA
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      console.error("Sign in error:", err);
    }
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
