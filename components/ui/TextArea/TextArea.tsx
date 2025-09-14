import * as React from "react";
import { twMerge } from "tailwind-merge";

// Define the component's props
// It extends all standard HTML textarea attributes
export interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /**
   * If true, the textarea will have a red border to indicate an error.
   * @default false
   */
  hasError?: boolean;
  /**
   * The size of the textarea element.
   * @default 'base'
   */
  textareaSize?: "sm" | "base" | "lg";
}

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, hasError = false, textareaSize = "base", ...props }, ref) => {
    // Base classes for the textarea element with modern styling
    const baseClasses =
      "flex min-h-[80px] focus:outline-none w-full rounded-2xl border-1 bg-container border-subcontainer text-base text-paragraph placeholder:text-placeholder disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 resize-none";

    // Size classes
    const sizeClasses = {
      sm: "px-3 py-2 text-sm min-h-[60px]",
      base: "px-4 py-3 text-base min-h-[80px]",
      lg: "px-5 py-4 text-lg min-h-[100px]",
    };

    // Classes to apply when there is an error
    const errorClasses = "border-error bg-error/10 focus-visible:ring-error";

    return (
      <textarea
        className={twMerge(
          baseClasses,
          sizeClasses[textareaSize],
          hasError && errorClasses, // Conditionally apply error styles
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

TextArea.displayName = "TextArea";

export { TextArea };
