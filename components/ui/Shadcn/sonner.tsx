"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--color-background)",
          "--normal-text": "var(--color-title)",
          "--normal-border": "var(--color-surface-2)",
          // Success
          "--success-bg": "var(--color-container)",
          "--success-text": "var(--color-title)",
          "--success-border": "var(--color-success)",
          // Error
          "--error-bg": "var(--color-container)",
          "--error-text": "var(--color-title)",
          "--error-border": "var(--color-error)",
          // Warning
          "--warning-bg": "var(--color-container)",
          "--warning-text": "var(--color-title)",
          "--warning-border": "var(--color-warning)",
          // Info
          "--info-bg": "var(--color-container)",
          "--info-text": "var(--color-title)",
          "--info-border": "var(--color-info)",
        } as React.CSSProperties
      }
      richColors
      {...props}
    />
  );
};

export { Toaster };
