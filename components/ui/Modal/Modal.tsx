"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { twMerge } from "tailwind-merge";
import { VisuallyHidden } from "../VisuallyHidden";
import { Input } from "../Input";
import { CloseCircle } from "@solar-icons/react/ssr";
import Image from "next/image";

// Modal Root Component
const Modal = Dialog.Root;

// Modal Trigger Component
const ModalTrigger = Dialog.Trigger;

// Modal Portal Component
const ModalPortal = Dialog.Portal;

// Modal Overlay Component
const ModalOverlay = React.forwardRef<
  React.ElementRef<typeof Dialog.Overlay>,
  React.ComponentPropsWithoutRef<typeof Dialog.Overlay>
>(({ className, ...props }, ref) => {
  return (
    <Dialog.Overlay
      ref={ref}
      className={twMerge(
        "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    />
  );
});
ModalOverlay.displayName = "ModalOverlay";

// Modal Content Component
const ModalContent = React.forwardRef<
  React.ElementRef<typeof Dialog.Content>,
  React.ComponentPropsWithoutRef<typeof Dialog.Content>
>(({ className, children, ...props }, ref) => {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <Dialog.Content
        ref={ref}
        className={twMerge(
          "rounded-2xl fixed left-[50%] top-[50%] z-50 grid w-full max-w-sm translate-x-[-50%] translate-y-[-50%] gap-4 border border-gray-200 bg-white p-6 shadow-xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
          className
        )}
        {...props}
      >
        {/* Hidden title for accessibility - required by Radix UI Dialog */}
        <VisuallyHidden>
          <Dialog.Title>Modal</Dialog.Title>
        </VisuallyHidden>
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  );
});
ModalContent.displayName = "ModalContent";

// Modal Header Component
const ModalHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={twMerge("flex flex-col space-y-2 text-center", className)}
      {...props}
    />
  );
});
ModalHeader.displayName = "ModalHeader";

// Modal Title Component
const ModalTitle = React.forwardRef<
  React.ElementRef<typeof Dialog.Title>,
  React.ComponentPropsWithoutRef<typeof Dialog.Title>
>(({ className, ...props }, ref) => {
  return (
    <Dialog.Title
      ref={ref}
      className={twMerge(
        "text-xl font-bold leading-tight tracking-tight text-gray-900",
        className
      )}
      {...props}
    />
  );
});
ModalTitle.displayName = "ModalTitle";

// Modal Description Component
const ModalDescription = React.forwardRef<
  React.ElementRef<typeof Dialog.Description>,
  React.ComponentPropsWithoutRef<typeof Dialog.Description>
>(({ className, ...props }, ref) => {
  return (
    <Dialog.Description
      ref={ref}
      className={twMerge("text-sm text-gray-600 leading-relaxed", className)}
      {...props}
    />
  );
});
ModalDescription.displayName = "ModalDescription";

// Modal Close Component
const ModalClose = React.forwardRef<
  React.ElementRef<typeof Dialog.Close>,
  React.ComponentPropsWithoutRef<typeof Dialog.Close>
>(({ className, children, ...props }, ref) => {
  return (
    <Dialog.Close
      ref={ref}
      className={twMerge(
        "absolute right-4 top-4 rounded-full p-2 opacity-70  transition-all hover:opacity-100 hover:bg-gray-100 disabled:pointer-events-none",
        className
      )}
      {...props}
    >
      {children || (
        <>
          <CloseCircle className="h-5 w-5 text-gray-500" />
          <span className="sr-only">Close</span>
        </>
      )}
    </Dialog.Close>
  );
});
ModalClose.displayName = "ModalClose";

// Modal Footer Component (novo componente para botões)
const ModalFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={twMerge("flex flex-col sm:flex-row gap-2 pt-1", className)}
      {...props}
    />
  );
};
ModalFooter.displayName = "ModalFooter";

// Modal Icon Container Component
const ModalIcon = ({
  className,
  type = "info",
  src,
  alt = "",
  children,
  ...props
}: {
  className?: string;
  type?: "info" | "warning" | "error" | "success" | "delete" | "confirm";
  src?: string;
  alt?: string;
  children?: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) => {
  // Ícones padrão baseados no tipo
  const defaultIcons = {
    info: (
      <svg
        className="w-8 h-8 text-blue-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    warning: (
      <svg
        className="w-8 h-8 text-yellow-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
        />
      </svg>
    ),
    error: (
      <svg
        className="w-8 h-8 text-red-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    success: (
      <svg
        className="w-8 h-8 text-green-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
        />
      </svg>
    ),
    delete: (
      <svg
        className="w-8 h-8 text-red-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        />
      </svg>
    ),
    confirm: (
      <svg
        className="w-8 h-8 text-blue-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  };

  const iconContent =
    children ||
    (src ? (
      <Image
        src={src}
        alt={alt}
        className="w-12 h-12 object-cover rounded-full"
        onError={(e) => {
          // Fallback para ícone padrão se a imagem não carregar
          const target = e.target as HTMLImageElement;
          target.style.display = "none";
          const fallbackIcon = target.nextElementSibling as HTMLElement;
          if (fallbackIcon) {
            fallbackIcon.style.display = "flex";
          }
        }}
      />
    ) : (
      defaultIcons[type]
    ));

  return (
    <div
      className={twMerge("flex justify-center items-center mb-3", className)}
      {...props}
    >
      {src ? (
        <div className="relative">
          <Image
            src={src}
            alt={alt}
            className="w-12 h-12 object-cover rounded-full"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
              const fallback = target.parentElement?.querySelector(
                ".fallback-icon"
              ) as HTMLElement;
              if (fallback) {
                fallback.style.display = "flex";
              }
            }}
          />
          <div className="fallback-icon hidden justify-center items-center w-12 h-12 bg-gray-100 rounded-full">
            {defaultIcons[type]}
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center w-12 h-12 bg-gray-50 rounded-full">
          {iconContent}
        </div>
      )}
    </div>
  );
};
ModalIcon.displayName = "ModalIcon";

// Modal Body Component (para conteúdo entre header e footer)
const ModalBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return <div className={twMerge("space-y-4", className)} {...props} />;
};
ModalBody.displayName = "ModalBody";

// Modal Form Component
const ModalForm = React.forwardRef<
  HTMLFormElement,
  React.FormHTMLAttributes<HTMLFormElement>
>(({ className, ...props }, ref) => {
  return (
    <form ref={ref} className={twMerge("space-y-4", className)} {...props} />
  );
});
ModalForm.displayName = "ModalForm";

// Modal Field Component (label + input wrapper)
const ModalField = ({
  label,
  required,
  error,
  children,
  ...props
}: {
  label?: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className="space-y-1" {...props}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
};
ModalField.displayName = "ModalField";

// Modal Input Component (wrapper para o Input do UI)
const ModalInput = React.forwardRef<
  React.ElementRef<typeof Input>,
  React.ComponentPropsWithoutRef<typeof Input> & {
    error?: boolean;
  }
>(({ ...props }, ref) => {
  return <Input ref={ref} className="!bg-white-light !py-4" {...props} />;
});

ModalInput.displayName = "ModalInput";

// Primary Button Component
const ModalPrimaryButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "default" | "destructive" | "secondary";
  }
>(({ className, variant = "default", ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={twMerge(
        `w-full sm:flex-1 rounded-3xl ${
          variant === "destructive"
            ? "bg-danger hover:bg-danger-dark focus:ring-danger"
            : variant === "secondary"
            ? "bg-secondary hover:bg-secondary-dark focus:ring-secondary"
            : "bg-primary hover:bg-primary-dark focus:ring-primary"
        } px-6 py-4 text-sm font-bold text-white shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50`,
        className
      )}
      {...props}
    />
  );
});

ModalPrimaryButton.displayName = "ModalPrimaryButton";

// Secondary Button Component
const ModalSecondaryButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={twMerge(
        "w-full sm:flex-1 rounded-3xl bg-gray-100 px-6 py-4 text-sm font-bold text-secondary transition-all hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});
ModalSecondaryButton.displayName = "ModalSecondaryButton";

export {
  Modal,
  ModalTrigger,
  ModalPortal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalClose,
  ModalBody,
  ModalForm,
  ModalField,
  ModalInput,
  ModalFooter,
  ModalIcon,
  ModalPrimaryButton,
  ModalSecondaryButton,
};
