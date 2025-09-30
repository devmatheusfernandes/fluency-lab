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
  /**
   * Optional icon to display on the left side of the input
   */
  leftIcon?: React.ReactNode;
  /**
   * Optional icon to display on the right side of the input
   */
  rightIcon?: React.ReactNode;
  /**
   * Optional label for the input
   */
  label?: string;
  /**
   * Optional helper text to display below the input
   */
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      hasError = false,
      inputSize = "base",
      leftIcon,
      rightIcon,
      label,
      helperText,
      id,
      ...props
    },
    ref
  ) => {
    // Generate unique ID if not provided
    const generatedId = React.useId();
    const inputId = id || generatedId;

    // Modern base classes with glass morphism and enhanced styling
    const baseClasses = "input-base flex w-full";

    // Size classes with improved spacing
    const sizeClasses = {
      sm: "h-9 text-sm",
      base: "h-10 text-sm",
      lg: "h-12 text-base",
    };

    // Padding classes that account for icons
    const paddingClasses = {
      sm: leftIcon
        ? rightIcon
          ? "pl-9 pr-9"
          : "pl-9 pr-3"
        : rightIcon
          ? "pl-3 pr-9"
          : "px-3",
      base: leftIcon
        ? rightIcon
          ? "pl-10 pr-10"
          : "pl-10 pr-4"
        : rightIcon
          ? "pl-4 pr-10"
          : "px-4",
      lg: leftIcon
        ? rightIcon
          ? "pl-12 pr-12"
          : "pl-12 pr-5"
        : rightIcon
          ? "pl-5 pr-12"
          : "px-5",
    };

    // Enhanced error classes with modern error styling
    const errorClasses =
      "border-red-300 dark:border-red-700 bg-red-50/80 dark:bg-red-950/20 hover:border-red-400 dark:hover:border-red-600 focus:border-red-500 dark:focus:border-red-400 focus:bg-red-50 dark:focus:bg-red-950/30 focus-visible:ring-red-500/20 dark:focus-visible:ring-red-400/20";

    // Icon sizing based on input size
    const iconSizeClasses = {
      sm: "h-4 w-4",
      base: "h-4 w-4",
      lg: "h-5 w-5",
    };

    // Icon positioning
    const leftIconClasses = {
      sm: "left-2.5",
      base: "left-3",
      lg: "left-4",
    };

    const rightIconClasses = {
      sm: "right-2.5",
      base: "right-3",
      lg: "right-4",
    };

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            {label}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div
              className={twMerge(
                "absolute top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none",
                leftIconClasses[inputSize]
              )}
            >
              <div className={iconSizeClasses[inputSize]}>{leftIcon}</div>
            </div>
          )}

          {/* Input Element */}
          <input
            id={inputId}
            type={type}
            className={twMerge(
              baseClasses,
              sizeClasses[inputSize],
              paddingClasses[inputSize],
              hasError && errorClasses,
              className
            )}
            ref={ref}
            {...props}
          />

          {/* Right Icon */}
          {rightIcon && (
            <div
              className={twMerge(
                "absolute top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none",
                rightIconClasses[inputSize]
              )}
            >
              <div className={iconSizeClasses[inputSize]}>{rightIcon}</div>
            </div>
          )}
        </div>

        {/* Helper Text / Error Message */}
        {(helperText || hasError) && (
          <div className="mt-2">
            <p
              className={twMerge(
                "text-sm",
                hasError
                  ? "text-red-600 dark:text-red-400"
                  : "text-gray-600 dark:text-gray-400"
              )}
            >
              {helperText}
            </p>
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
