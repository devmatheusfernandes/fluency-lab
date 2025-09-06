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

// --- Minimalist Icons ---
const CheckIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const XIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const AlertTriangleIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
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
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
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
  error: <XIcon />,
  warning: <AlertTriangleIcon />,
  info: <InfoIcon />,
  default: <InfoIcon />,
};

// --- Minimal Color System ---
const variantStyles = {
  success: "text-green-600 dark:text-green-400",
  error: "text-red-600 dark:text-red-400",
  warning: "text-amber-600 dark:text-amber-400",
  info: "text-blue-600 dark:text-blue-400",
  default: "text-gray-600 dark:text-gray-400",
};

// --- Minimalist Toast Component ---
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
    return (
      <div
        ref={ref}
        className={twMerge(
          // Clean minimalist container
          "group relative max-w-md w-full",
          "bg-white dark:bg-gray-900",
          "border border-gray-200 dark:border-gray-800",
          "rounded-lg shadow-sm",
          "pointer-events-auto",
          "transform transition-all duration-300 ease-out",
          "hover:shadow-md",
          className
        )}
        {...props}
      >
        <div className="flex items-start gap-3 p-4">
          {/* Simple icon */}
          <div
            className={twMerge("flex-shrink-0 mt-0.5", variantStyles[variant])}
          >
            {iconMap[variant]}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {title && (
              <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                {title}
              </div>
            )}
            {description && (
              <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {description}
              </div>
            )}

            {/* Action */}
            {action && (
              <button
                onClick={action.onClick}
                className="mt-3 text-sm font-medium text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200"
              >
                {action.label}
              </button>
            )}
          </div>

          {/* Close button */}
          {closable && (
            <button
              onClick={() => toast.dismiss()}
              className="flex-shrink-0 opacity-60 hover:opacity-100 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-all duration-200 p-1 -m-1 rounded"
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
      </div>
    );
  }
);
ToastComponent.displayName = "ToastComponent";

// --- Simplified Toast Hook ---
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

    return toast.custom(
      () => (
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
        position: position || "top-right",
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

    dismiss: toast.dismiss,
    dismissAll: () => toast.dismiss(),
  };
};

export { useToast, ToastComponent };
