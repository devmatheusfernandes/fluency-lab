import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { twMerge } from "tailwind-merge";

// Define the component's props with all the possible variants
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * The visual style of the button.
   * @default 'primary'
   */
  variant?:
    | "primary"
    | "secondary"
    | "danger"
    | "warning"
    | "success"
    | "ghost"
    | "glass"
    | "link"
    | "purple";
  /**
   * The size of the button.
   * @default 'base'
   */
  size?: "sm" | "base" | "lg" | "icon";
  /**
   * If true, the button will be rendered as its child component.
   * This is useful for wrapping components like Next.js's <Link>.
   * @default false
   */
  asChild?: boolean;
  /**
   * If true, a loading spinner will be shown, and the button will be disabled.
   * @default false
   */
  isLoading?: boolean;
}

// Helper function to generate the correct Tailwind classes
const getButtonClasses = ({
  variant,
  size,
}: Pick<ButtonProps, "variant" | "size">): string => {
  const baseClasses =
    "inline-flex items-center justify-center rounded-3xl font-semibold border-2 transition-all ease-in-out duration-200 focus:outline-none disabled:opacity-50 transform active:scale-[0.98] disabled:cursor-not-allowed disabled:active:scale-100";

  const variantClasses = {
    primary:
      "bg-primary border-primary text-primary-text hover:bg-primary-hover hover:border-primary-hover hover:shadow-xl",
    secondary:
      "bg-secondary border-secondary text-secondary-text hover:bg-secondary-hover hover:border-secondary-hover hover:shadow-xl",
    danger:
      "bg-danger border-danger text-white hover:bg-danger-light hover:border-danger-light hover:shadow-xl",
    warning:
      "bg-warning border-warning text-white hover:bg-warning-light hover:border-warning-light hover:shadow-xl",
    success:
      "bg-info border-info text-white hover:bg-info-light hover:border-info-light hover:shadow-xl",
    ghost:
      "border-surface-2 hover:border-surface-hover bg-surface-1 text-paragraph hover:bg-surface-hover hover:text-title",
    glass:
      "bg-white/20 backdrop-blur-xl border-2 border-white/30 text-white shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:bg-white/30 hover:border-white/50 hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)] transition-all duration-300",
    link: "border-transparent bg-transparent text-primary underline-offset-4 hover:underline",
    purple:
      "bg-primary border-primary text-primary-text hover:bg-primary-hover hover:border-primary-hover hover:shadow-xl",
  };

  const sizeClasses = {
    base: "px-6 py-3 text-base",
    sm: "px-4 py-2 text-sm",
    lg: "px-8 py-4 text-lg",
    icon: "p-3",
  };

  return twMerge(
    baseClasses,
    variantClasses[variant || "primary"],
    sizeClasses[size || "base"]
  );
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      children,
      ...props
    },
    ref
  ) => {
    // Use Slot if asChild is true, otherwise use a regular button
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={twMerge(getButtonClasses({ variant, size }), className)}
        data-variant={variant}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        ) : (
          children
        )}
      </Comp>
    );
  }
);

Button.displayName = "Button";

export { Button };
