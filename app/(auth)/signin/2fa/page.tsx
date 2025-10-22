"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import BackgroundLogin from "@/public/images/login/background";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import { useTheme } from "@/context/ThemeContext";

function TwoFactorForm() {
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
        const { getTwoFactorData } = await import("@/lib/auth/twoFactorStorage");
        const data = await getTwoFactorData();

        if (data) {
          setEmail(data.email);
          setPassword(data.password);
          return;
        }

        // Fallback to sessionStorage
        const fallbackData = sessionStorage.getItem("temp-2fa-data");
        if (fallbackData) {
          const parsed = JSON.parse(fallbackData);
          // Check if data is not too old (10 minutes)
          const isExpired = Date.now() - parsed.timestamp > 10 * 60 * 1000;
          if (!isExpired) {
            setEmail(parsed.email);
            setPassword(parsed.password);
            return;
          } else {
            sessionStorage.removeItem("temp-2fa-data");
          }
        }

        // If no valid data found, redirect to signin
        router.push("/signin");
      } catch (error) {
        console.error("Erro ao carregar dados do 2FA:", error);
        // Try sessionStorage as last resort
        try {
          const fallbackData = sessionStorage.getItem("temp-2fa-data");
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
          console.error("Erro no fallback storage:", fallbackError);
        }
        router.push("/signin");
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
        console.error("SignIn error:", result.error);

        if (result.error === "Invalid 2FA code") {
          setError("Código 2FA inválido. Tente novamente.");
        } else if (result.error === "2FA_REQUIRED") {
          setError(
            "Código 2FA é obrigatório. Digite o código do seu aplicativo autenticador."
          );
        } else if (result.error === "CredentialsSignin") {
          setError(
            "Erro de autenticação. Verifique suas credenciais e tente novamente."
          );
        } else if (result.error.includes("fetch")) {
          setError("Erro de conexão. Verifique sua internet e tente novamente.");
        } else if (result.error.includes("timeout")) {
          setError("Tempo limite excedido. Tente novamente.");
        } else if (
          result.error.includes("500") ||
          result.error.includes("Internal Server Error")
        ) {
          setError(
            "Erro interno do servidor. Tente novamente em alguns instantes."
          );
        } else if (
          result.error.includes("401") ||
          result.error.includes("Unauthorized")
        ) {
          setError("Não autorizado. Faça login novamente.");
        } else {
          setError(`Erro na verificação: ${result.error}. Tente novamente.`);
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
      } else {
        // Handle case where result is null/undefined
        setError("Resposta inválida do servidor. Tente novamente.");
      }
    } catch (err: any) {
      console.error("2FA verification error:", err);

      // Handle different types of network/fetch errors
      if (err.name === "TypeError" && err.message.includes("fetch")) {
        setError(
          "Erro de conexão de rede. Verifique sua internet e tente novamente."
        );
      } else if (err.name === "AbortError") {
        setError("Requisição cancelada. Tente novamente.");
      } else if (err.message?.includes("JSON")) {
        setError(
          "Erro de formato de resposta do servidor. Tente novamente."
        );
      } else if (err.message?.includes("timeout")) {
        setError("Tempo limite da requisição excedido. Tente novamente.");
      } else {
        setError(`Erro inesperado: ${err.message || "Tente novamente."}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto w-full">
      <div className="text-center mb-6">
        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Verificação em Duas Etapas
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Digite o código de 6 dígitos do seu aplicativo autenticador
        </p>
        {email && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Fazendo login como: {email}
          </p>
        )}
      </div>

      {error && (
        <p className="text-red-600 dark:text-red-400 text-center text-sm mb-4">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          type="text"
          value={code}
          onChange={(e) =>
            setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
          }
          placeholder="000000"
          maxLength={6}
          className="text-center tracking-widest"
          required
          inputSize="lg"
          autoFocus
        />

        <Button
          type="submit"
          fullWidth
          size="lg"
          disabled={isLoading || code.length !== 6}
          variant="primary"
        >
          {isLoading ? "Verificando..." : "Verificar"}
        </Button>

        <div className="text-center">
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
      </form>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="max-w-md mx-auto w-full">
      <div className="text-center">
        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Carregando...
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Preparando verificação em duas etapas
        </p>
      </div>
    </div>
  );
}

export default function TwoFactorVerificationPage() {
  const { isDark, setTheme } = useTheme();

  return (
    <div className="min-h-dvh w-full bg-background dark:bg-gray-950 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-5xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Left Side - Background/Illustration (hidden on mobile) */}
          <div className="hidden lg:block lg:w-1/2 bg-gray-100 dark:bg-gray-800 p-8 lg:p-12 relative min-h-[300px] lg:min-h-[600px]">
            <BackgroundLogin />
          </div>

          {/* Right Side - 2FA Form */}
          <div className="w-full lg:w-1/2 p-6 sm:p-8 lg:p-12 flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full">
              {/* Top Bar with Dark Mode Toggle */}
              <div className="flex justify-end mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Dark Mode</span>
                  <Switch
                    checked={isDark}
                    onCheckedChange={(checked) => setTheme(!!checked)}
                    aria-label="Alternar tema"
                  />
                </div>
              </div>

              <Suspense fallback={<LoadingFallback />}>
                <TwoFactorForm />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
