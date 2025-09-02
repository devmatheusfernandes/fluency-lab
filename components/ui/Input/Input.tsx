import * as React from "react";
import { twMerge } from "tailwind-merge";

// Define the component's props
// It extends all standard HTML input attributes
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * If true, the input will have a red border to indicate an error.
   * @default false
   */
  hasError?: boolean;
  /**
   * The size of the input element.
   * @default 'base'
   */
  inputSize?: "sm" | "base" | "lg";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type, hasError = false, inputSize = "base", ...props },
    ref
  ) => {
    // Base classes for the input element with modern styling
    const baseClasses =
      "flex w-full rounded-xl border-2 border-input/60 hover:border-input/80 focus:border-input/50 focus:bg-input/70 bg-input/30 hover:bg-input/50 backdrop-blur-xl text-base text-placeholder placeholder:text-placeholder/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ease-in-out";

    // Size classes
    const sizeClasses = {
      sm: "h-10 px-3 py-2 text-sm",
      base: "h-12 px-4 py-3 text-base",
      lg: "h-14 px-5 py-4 text-lg",
    };

    // Classes to apply when there is an error
    const errorClasses =
      "border-error/10 border-1 hover:border-error/20 focus:bg-error/20 bg-error/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-error hover:border-error";

    return (
      <input
        type={type}
        className={twMerge(
          baseClasses,
          sizeClasses[inputSize],
          hasError && errorClasses, // Conditionally apply error styles
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
