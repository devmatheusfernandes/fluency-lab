"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { twMerge } from "tailwind-merge";
import { VisuallyHidden } from "../VisuallyHidden";
import { Input } from "../Input";
import { CloseSquare } from "@solar-icons/react/ssr";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { defaultIcons } from "./modalIcons";

// Modal Root Component
const Modal = Dialog.Root;

// Modal Trigger Component
const ModalTrigger = Dialog.Trigger;

// Modal Portal Component
const ModalPortal = Dialog.Portal;

// Modal Overlay Component
const ModalOverlay = React.forwardRef<
  React.ComponentRef<typeof Dialog.Overlay>,
  React.ComponentPropsWithoutRef<typeof Dialog.Overlay>
>(({ className, ...props }, ref) => {
  return (
    <Dialog.Overlay
      ref={ref}
      className={twMerge(
        "fixed inset-0 z-50 bg-black/60 backdrop-blur-md",
        className
      )}
      {...props}
    />
  );
});
ModalOverlay.displayName = "ModalOverlay";

// Modal Content Component
const ModalContent = React.forwardRef<
  React.ComponentRef<typeof Dialog.Content>,
  React.ComponentPropsWithoutRef<typeof Dialog.Content>
>(({ className, children, ...props }, ref) => {
  return (
    <Dialog.Portal>
      <AnimatePresence>
        <Dialog.Overlay asChild>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-background/35 backdrop-blur-sm"
          >
            <Dialog.Content
              ref={ref}
              className={twMerge(
                "rounded-2xl fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-background/40 bg-background dark:bg-background/50 p-8 shadow-xl",
                className
              )}
              asChild
              {...props}
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Hidden title for accessibility - required by Radix UI Dialog */}
                <VisuallyHidden>
                  <Dialog.Title>Modal</Dialog.Title>
                </VisuallyHidden>
                {children}
              </motion.div>
            </Dialog.Content>
          </motion.div>
        </Dialog.Overlay>
      </AnimatePresence>
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
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.2 }}
    >
      <div
        ref={ref}
        className={twMerge("flex flex-col space-y-2 text-center", className)}
        {...props}
      />
    </motion.div>
  );
});
ModalHeader.displayName = "ModalHeader";

// Modal Title Component
const ModalTitle = React.forwardRef<
  React.ComponentRef<typeof Dialog.Title>,
  React.ComponentPropsWithoutRef<typeof Dialog.Title>
>(({ className, ...props }, ref) => {
  return (
    <Dialog.Title
      ref={ref}
      className={twMerge(
        "text-xl font-bold leading-tight tracking-tight text-title",
        className
      )}
      {...props}
    />
  );
});
ModalTitle.displayName = "ModalTitle";

// Modal Description Component
const ModalDescription = React.forwardRef<
  React.ComponentRef<typeof Dialog.Description>,
  React.ComponentPropsWithoutRef<typeof Dialog.Description>
>(({ className, ...props }, ref) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.15, duration: 0.2 }}
    >
      <Dialog.Description
        ref={ref}
        className={twMerge("text-sm text-subtitle leading-relaxed", className)}
        {...props}
      />
    </motion.div>
  );
});
ModalDescription.displayName = "ModalDescription";

// Modal Close Component
const ModalClose = React.forwardRef<
  React.ComponentRef<typeof Dialog.Close>,
  React.ComponentPropsWithoutRef<typeof Dialog.Close>
>(({ className, children, ...props }, ref) => {
  return (
    <Dialog.Close
      ref={ref}
      className={twMerge(
        "absolute right-4 top-4 opacity-70 transition-all",
        className
      )}
      {...props}
    >
      {children || (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut", delay: 1 }}
          >
            <CloseSquare
              weight="BoldDuotone"
              className="h-7 w-7 text-primary hover:text-secondary duration-300 ease-in-out transition-all"
            />
          </motion.div>
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.2 }}
    >
      <div
        className={twMerge(
          "flex flex-col sm:flex-row gap-2 pt-2 px-4",
          className
        )}
        {...props}
      />
    </motion.div>
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
  type?:
    | "info"
    | "warning"
    | "error"
    | "success"
    | "delete"
    | "confirm"
    | "close"
    | "settings"
    | "user"
    | "edit"
    | "download"
    | "upload"
    | "search"
    | "notification"
    | "heart"
    | "star"
    | "calendar"
    | "lock"
    | "unlock"
    | "home";
  src?: string;
  alt?: string;
  children?: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) => {
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
          <div className="fallback-icon hidden justify-center items-center w-12 h-12 bg-background rounded-full">
            {defaultIcons[type]}
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center w-12 h-12 bg-background rounded-full">
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
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1, duration: 0.2 }}
    >
      <div className={twMerge("space-y-4", className)} {...props} />
    </motion.div>
  );
};
ModalBody.displayName = "ModalBody";

// Modal Form Component
const ModalForm = React.forwardRef<
  HTMLFormElement,
  React.FormHTMLAttributes<HTMLFormElement>
>(({ className, ...props }, ref) => {
  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.15, duration: 0.2 }}
    >
      <form ref={ref} className={twMerge("space-y-4", className)} {...props} />
    </motion.form>
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
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1, duration: 0.2 }}
    >
      <div className="space-y-1" {...props}>
        {label && (
          <label className="block text-sm font-medium text-paragraph">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        {children}
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    </motion.div>
  );
};
ModalField.displayName = "ModalField";

// Modal Input Component (wrapper para o Input do UI)
const ModalInput = React.forwardRef<
  React.ComponentRef<typeof Input>,
  React.ComponentPropsWithoutRef<typeof Input> & {
    error?: boolean;
  }
>(({ ...props }, ref) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.2 }}
    >
      <Input ref={ref} className="!py-4" {...props} />
    </motion.div>
  );
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
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className="w-full"
    >
      <button
        ref={ref}
        className={twMerge(
          `w-full rounded-3xl flex flex-row justify-center items-center gap-2 cursor-pointer ${
            variant === "destructive"
              ? "bg-danger hover:bg-danger-light"
              : variant === "secondary"
                ? "bg-warning hover:bg-warning-light"
                : "bg-success hover:bg-success-light"
          } px-6 py-4 text-md font-bold text-white shadow-md transition-all focus:outline-none disabled:pointer-events-none disabled:opacity-50`,
          className
        )}
        {...props}
      />
    </motion.div>
  );
});

ModalPrimaryButton.displayName = "ModalPrimaryButton";

// Secondary Button Component
const ModalSecondaryButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className="w-full"
    >
      <button
        ref={ref}
        className={twMerge(
          "cursor-pointer w-full rounded-3xl bg-secondary px-6 py-4 text-sm font-bold text-white transition-all hover:bg-secondary-hover focus:outline-none disabled:pointer-events-none disabled:opacity-50",
          className
        )}
        {...props}
      />
    </motion.div>
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
