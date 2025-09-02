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
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get the callback URL from query parameters
  const callbackUrl = searchParams.get("callbackUrl") || "/hub";

  // Get email and password from session storage
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    // Retrieve email and password from session storage
    const storedEmail = sessionStorage.getItem("2fa_email") || "";
    const storedPassword = sessionStorage.getItem("2fa_password") || "";

    setEmail(storedEmail);
    setPassword(storedPassword);

    // If we don't have the email/password, redirect back to signin
    if (!storedEmail || !storedPassword) {
      router.push("/signin");
    }
    // NOTE: We don't remove the credentials here anymore, they will be removed after successful verification
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
        twoFactorCode: code,
      });

      if (result?.error) {
        if (result.error === "Invalid 2FA code") {
          setError("Invalid authentication code. Please try again.");
        } else {
          setError("An error occurred. Please try again.");
        }
      } else if (result?.ok) {
        // Clear the stored credentials after successful verification
        sessionStorage.removeItem("2fa_email");
        sessionStorage.removeItem("2fa_password");

        // Redirect to the intended destination
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-1 p-4">
      <Card className="w-full max-w-md space-y-6 p-8">
        <div className="text-center">
          <Text variant="title" size="2xl" weight="bold">
            Two-Factor Authentication
          </Text>
          <Text variant="placeholder" className="mt-2">
            Enter the 6-digit code from your authenticator app
          </Text>
        </div>

        {error && (
          <div className="rounded-lg bg-red-100 p-3 border border-red-200">
            <Text className="text-red-800" size="sm">
              {error}
            </Text>
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
              className="text-center text-2xl tracking-widest"
              autoFocus
            />
            <Text variant="placeholder" size="sm" className="mt-2 text-center">
              Enter your backup code if you can't access your authenticator app
            </Text>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || code.length !== 6}
          >
            {isLoading ? "Verifying..." : "Verify"}
          </Button>
        </form>

        <div className="text-center">
          <Button
            variant="link"
            onClick={() => {
              // Clear stored credentials when using a different account
              sessionStorage.removeItem("2fa_email");
              sessionStorage.removeItem("2fa_password");
              router.push("/signin");
            }}
            className="text-sm"
          >
            Use a different account
          </Button>
        </div>
      </Card>
    </div>
  );
}
