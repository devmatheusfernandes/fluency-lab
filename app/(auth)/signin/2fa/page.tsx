"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Text } from "@/components/ui/Text";

export default function TwoFactorVerificationPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get the callback URL from query parameters
  const callbackUrl = searchParams.get("callbackUrl") || "/hub";

  // Load stored credentials securely
  useEffect(() => {
    const loadStoredCredentials = async () => {
      try {
        // Try server-side storage first
        const { getTwoFactorData } = await import('@/lib/auth/twoFactorStorage');
        const data = await getTwoFactorData();
        
        if (data) {
          setEmail(data.email);
          setPassword(data.password);
          return;
        }
        
        // Fallback to sessionStorage
        const fallbackData = sessionStorage.getItem('temp-2fa-data');
        if (fallbackData) {
          const parsed = JSON.parse(fallbackData);
          // Check if data is not too old (10 minutes)
          const isExpired = Date.now() - parsed.timestamp > 10 * 60 * 1000;
          if (!isExpired) {
            setEmail(parsed.email);
            setPassword(parsed.password);
            return;
          } else {
            sessionStorage.removeItem('temp-2fa-data');
          }
        }
        router.push('/signin');
      } catch (error) {
        console.error('Erro ao carregar dados do 2FA:', error);
        // Try sessionStorage as last resort
        try {
          const fallbackData = sessionStorage.getItem('temp-2fa-data');
          if (fallbackData) {
            const parsed = JSON.parse(fallbackData);
            const isExpired = Date.now() - parsed.timestamp > 10 * 60 * 1000;
            if (!isExpired) {
              setEmail(parsed.email);
              setPassword(parsed.password);
              return;
            }
          }
        } catch (fallbackError) {
          console.error('Erro no fallback storage:', fallbackError);
        }
        router.push('/signin');
      }
    };

    loadStoredCredentials();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!email || !password) {
      setError(
        "Dados de autenticação não encontrados. Tente fazer login novamente."
      );
      setIsLoading(false);
      return;
    }

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
        twoFactorCode: code,
      });

      if (result?.error) {
        if (result.error === "Invalid 2FA code") {
          setError("Código 2FA inválido. Tente novamente.");
        } else {
          setError("Erro na verificação. Tente novamente.");
        }
      } else if (result?.ok) {
        // Clear stored credentials on successful verification
        try {
          const { clearTwoFactorData } = await import(
            "@/lib/auth/twoFactorStorage"
          );
          await clearTwoFactorData();
        } catch (error) {
          console.error("Erro ao limpar dados do 2FA:", error);
        }

        // Redirect to the intended destination
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      console.error("2FA verification error:", err);
      setError("Erro na verificação. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-6">
        <div className="text-center mb-6">
          <Text variant="title" size="xl" weight="bold">
            Verificação em Duas Etapas
          </Text>
          <Text className="mt-2 text-gray-600">
            Digite o código de 6 dígitos do seu aplicativo autenticador
          </Text>
          {email && (
            <Text className="mt-1 text-sm text-gray-500">
              Fazendo login como: {email}
            </Text>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="text"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="000000"
              maxLength={6}
              className="text-center text-lg tracking-widest"
              required
              autoFocus
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || code.length !== 6}
          >
            {isLoading ? "Verificando..." : "Verificar"}
          </Button>
        </form>

        <div className="text-center mt-4">
          <Button
            variant="link"
            onClick={async () => {
              // Clear stored credentials when using a different account
              try {
                const { clearTwoFactorData } = await import(
                  "@/lib/auth/twoFactorStorage"
                );
                await clearTwoFactorData();
              } catch (error) {
                console.error("Erro ao limpar dados do 2FA:", error);
              }
              router.push("/signin");
            }}
            className="text-sm"
          >
            Usar uma conta diferente
          </Button>
        </div>
      </Card>
    </div>
  );
}
