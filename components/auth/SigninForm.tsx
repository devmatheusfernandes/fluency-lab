"use client";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import BackgroundLogin from "@/public/images/login/background";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import { useTheme } from "@/context/ThemeContext";
import { BackButton } from "@/components/ui/BackButton";

export default function SigninForm() {
  const { isLoading, error, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isDark, setTheme } = useTheme();

  const callbackUrl = searchParams.get("callbackUrl") || "/hub";

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
        if (result.error === "2FA_REQUIRED") {
          try {
            const { storeTwoFactorData } = await import(
              "@/lib/auth/twoFactorStorage"
            );
            await storeTwoFactorData(email, password);

            const tempData = {
              email,
              password,
              timestamp: Date.now(),
            };
            sessionStorage.setItem("temp-2fa-data", JSON.stringify(tempData));

            router.push(
              `/signin/2fa?callbackUrl=${encodeURIComponent(callbackUrl)}`
            );
          } catch (error) {
            console.error("Erro ao armazenar dados do 2FA:", error);
            try {
              const tempData = {
                email,
                password,
                timestamp: Date.now(),
              };
              sessionStorage.setItem("temp-2fa-data", JSON.stringify(tempData));
              router.push(
                `/signin/2fa?callbackUrl=${encodeURIComponent(callbackUrl)}`
              );
            } catch (fallbackError) {
              console.error("Erro no fallback storage:", fallbackError);
              setLocalError("Erro interno. Tente novamente.");
            }
          }
        } else {
          console.error("Sign in error:", result.error);
          setLocalError("Credenciais inválidas.");
        }
      } else if (result?.ok) {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      console.error("Sign in error:", err);
    }
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-dvh w-full bg-background dark:bg-gray-950 flex items-center justify-center p-4 sm:p-6 relative">
      <BackButton
        href="/"
        ariaLabel="Back to landing page"
        className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10"
      />
      <div className="w-full max-w-5xl bg-white/60 dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Left Side - Background/Illustration (hidden on mobile for better UX) */}
          <div className="hidden lg:flex flex-col items-center justify-center lg:w-1/2 bg-gray-100 dark:bg-gray-800 p-8 lg:p-12 relative min-h-[300px] lg:min-h-[600px]">
            <BackgroundLogin />
          </div>
          {/* Right Side - Login Form */}
          <div className="w-full lg:w-1/2 p-6 sm:p-8 lg:p-12 flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full">
              {/* Top Bar with Dark Mode Toggle */}
              <div className="flex justify-end mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Dark Mode
                  </span>
                  <Switch
                    checked={isDark}
                    onCheckedChange={(checked) => setTheme(!!checked)}
                    aria-label="Alternar tema"
                  />
                </div>
              </div>

              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Login
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                Enter your credentials to access the platform.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your student ID"
                  required
                  inputSize="lg"
                />

                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  inputSize="lg"
                />

                <Button
                  type="submit"
                  isLoading={isLoading}
                  fullWidth
                  size="lg"
                  variant="primary"
                >
                  {isLoading ? "Aguarde..." : "Login"}
                </Button>

                {(error || localError) && (
                  <p className="text-red-600 dark:text-red-400 text-center text-sm mt-2">
                    {localError || error}
                  </p>
                )}
              </form>

              <p className="text-center text-gray-600 dark:text-gray-300 mt-8 text-sm">
                You dont have a Student ID and Password?
                <a
                  href="#"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:dark:text-blue-300 font-medium underline"
                >
                  Contact Us
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
