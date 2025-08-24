"use client";

import * as React from "react";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";

// --- Type Definitions ---
interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "success" | "error" | "warning" | "info" | "default";
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  closable?: boolean;
}

// --- Modern Icon Components ---
const CheckIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const ErrorIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M15 9l-6 6M9 9l6 6" />
  </svg>
);

const WarningIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const InfoIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4M12 8h.01" />
  </svg>
);

// --- Icon Map ---
const iconMap: Record<NonNullable<ToastProps["variant"]>, React.ReactNode> = {
  success: <CheckIcon />,
  error: <ErrorIcon />,
  warning: <WarningIcon />,
  info: <InfoIcon />,
  default: <InfoIcon />,
};

// --- Modern Variant Styles ---
const variantStyles = {
  success: {
    icon: "text-emerald-500",
    iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
    border: "border-emerald-200/50 dark:border-emerald-500/20",
    accent: "bg-gradient-to-r from-emerald-500/10 to-transparent",
  },
  error: {
    icon: "text-red-500",
    iconBg: "bg-red-50 dark:bg-red-500/10",
    border: "border-red-200/50 dark:border-red-500/20",
    accent: "bg-gradient-to-r from-red-500/10 to-transparent",
  },
  warning: {
    icon: "text-amber-500",
    iconBg: "bg-amber-50 dark:bg-amber-500/10",
    border: "border-amber-200/50 dark:border-amber-500/20",
    accent: "bg-gradient-to-r from-amber-500/10 to-transparent",
  },
  info: {
    icon: "text-blue-500",
    iconBg: "bg-blue-50 dark:bg-blue-500/10",
    border: "border-blue-200/50 dark:border-blue-500/20",
    accent: "bg-gradient-to-r from-blue-500/10 to-transparent",
  },
  default: {
    icon: "text-slate-600 dark:text-slate-300",
    iconBg: "bg-slate-50 dark:bg-slate-800/50",
    border: "border-slate-200/50 dark:border-slate-700/50",
    accent: "bg-gradient-to-r from-slate-500/5 to-transparent",
  },
};

// --- Modern Elegant Toast Component ---
const ToastComponent = React.forwardRef<HTMLDivElement, ToastProps>(
  (
    {
      variant = "default",
      title,
      description,
      action,
      closable = true,
      className,
      ...props
    },
    ref
  ) => {
    const variantStyle = variantStyles[variant];

    return (
      <div
        ref={ref}
        className={twMerge(
          // Modern glass morphism container
          "group relative max-w-sm w-full",
          "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl",
          "border border-white/20 dark:border-slate-700/30",
          variantStyle.border,
          "rounded-2xl shadow-xl shadow-black/5 dark:shadow-black/20",
          "pointer-events-auto overflow-hidden",
          "transform transition-all duration-500 ease-out",
          "hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/10",
          className
        )}
        {...props}
      >
        {/* Subtle accent gradient */}
        <div
          className={twMerge(
            "absolute inset-0 opacity-30",
            variantStyle.accent
          )}
        />

        {/* Content container */}
        <div className="relative flex items-start gap-4 p-6">
          {/* Modern icon with elegant background */}
          <div
            className={twMerge(
              "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
              "ring-1 ring-black/5 dark:ring-white/10",
              "shadow-sm",
              variantStyle.iconBg
            )}
          >
            <div className={variantStyle.icon}>{iconMap[variant]}</div>
          </div>

          {/* Content area */}
          <div className="flex-1 min-w-0 space-y-2">
            {title && (
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-tight tracking-tight">
                {title}
              </h4>
            )}
            {description && (
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {description}
              </p>
            )}

            {/* Modern action button */}
            {action && (
              <div className="pt-3">
                <button
                  onClick={action.onClick}
                  className={twMerge(
                    "inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium",
                    "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700",
                    "text-slate-700 dark:text-slate-300",
                    "rounded-xl border border-slate-200/50 dark:border-slate-700/50",
                    "transition-all duration-200 ease-out",
                    "hover:scale-105 hover:shadow-sm",
                    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500/50"
                  )}
                >
                  {action.label}
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Optional close button */}
          {closable && (
            <button
              onClick={() => toast.dismiss()}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Subtle bottom border accent */}
        <div
          className={twMerge(
            "absolute bottom-0 left-6 right-6 h-px",
            "bg-gradient-to-r from-transparent via-current to-transparent opacity-20",
            variantStyle.icon
          )}
        />
      </div>
    );
  }
);
ToastComponent.displayName = "ToastComponent";

// --- Enhanced Toast Hook ---
type ToastOptions = {
  title?: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  closable?: boolean;
  position?:
    | "top-right"
    | "top-center"
    | "top-left"
    | "bottom-right"
    | "bottom-center"
    | "bottom-left";
};

const useToast = () => {
  const showToast = (
    variant: ToastProps["variant"],
    options: ToastOptions = {}
  ) => {
    const { title, description, duration, action, closable, position } =
      options;

    const sonnerPosition =
      position === "top-center"
        ? "top-center"
        : position === "bottom-center"
        ? "bottom-center"
        : position === "top-left"
        ? "top-left"
        : position === "bottom-left"
        ? "bottom-left"
        : position === "bottom-right"
        ? "bottom-right"
        : "top-right";

    return toast.custom(
      (id) => (
        <ToastComponent
          variant={variant}
          title={title}
          description={description}
          action={action}
          closable={closable}
        />
      ),
      {
        duration,
        position: sonnerPosition,
      }
    );
  };

  return {
    success: (options: ToastOptions = {}) =>
      showToast("success", { duration: 4000, ...options }),

    error: (options: ToastOptions = {}) =>
      showToast("error", { duration: 6000, ...options }),

    warning: (options: ToastOptions = {}) =>
      showToast("warning", { duration: 5000, ...options }),

    info: (options: ToastOptions = {}) =>
      showToast("info", { duration: 4000, ...options }),

    default: (options: ToastOptions = {}) =>
      showToast("default", { duration: 4000, ...options }),

    show: (options: ToastOptions & { variant: ToastProps["variant"] }) => {
      const { variant, ...rest } = options;
      return showToast(variant, rest);
    },

    dismiss: (toastId: string) => toast.dismiss(toastId),

    dismissAll: () => toast.dismiss(),
  };
};

export { useToast, ToastComponent };
