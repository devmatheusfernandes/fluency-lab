import * as React from "react";
import { twMerge } from "tailwind-merge";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  type SelectProps,
} from "@/components/ui/Select";
import { Text } from "@/components/ui/Text";

// Define the component's props
export interface SelectFieldProps extends SelectProps {
  /**
   * The text content for the label associated with the select.
   */
  label?: string;
  /**
   * Optional helper text displayed below the select.
   */
  helperText?: string;
  /**
   * Error message to display below the select. Replaces helperText if present.
   */
  errorText?: string;
  /**
   * Optional className for the div that wraps the entire component.
   */
  containerClassName?: string;
  /**
   * Optional className for the select element.
   */
  className?: string;
  /**
   * Optional id for the select element.
   */
  id?: string;
  /**
   * The select options.
   */
  children?: React.ReactNode;
}

const SelectField = React.forwardRef<HTMLButtonElement, SelectFieldProps>(
  (
    {
      label,
      helperText,
      errorText,
      containerClassName,
      className,
      id,
      children,
      ...props
    },
    ref
  ) => {
    // Generate a unique ID if one isn't provided for accessibility
    const generatedId = React.useId();
    const selectId = id || generatedId;

    const hasError = !!errorText;

    return (
      <div className={twMerge("w-full space-y-2", containerClassName)}>
        {/* Label */}
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium leading-6 text-subtitle"
          >
            {label}
          </label>
        )}

        {/* Select */}
        <Select>
          <SelectTrigger
            ref={ref}
            hasError={hasError}
            className={className}
            {...props}
          >
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>{children}</SelectContent>
        </Select>

        {/* Error or Helper Text */}
        {errorText ? (
          <Text size="sm" variant="error" className="text-sm text-error">
            {errorText}
          </Text>
        ) : helperText ? (
          <Text
            size="sm"
            variant="placeholder"
            className="text-sm text-placeholder"
          >
            {helperText}
          </Text>
        ) : null}
      </div>
    );
  }
);

SelectField.displayName = "SelectField";

export { SelectField };
