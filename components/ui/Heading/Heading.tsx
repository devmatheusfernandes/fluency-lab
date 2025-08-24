import * as React from "react";
import { twMerge } from "tailwind-merge";

// Define the component's props with all the possible variants
export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /**
   * The HTML heading element to render. Defaults to 'h1'.
   */
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  /**
   * The color variant of the text, mapped to your theme. Defaults to 'title'.
   */
  variant?: "title" | "subtitle" | "paragraph" | "primary" | "secondary";
  /**
   * The font size of the text. If not provided, it's inferred from the `as` prop.
   */
  size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
  /**
   * The font weight of the text. Defaults to 'bold'.
   */
  weight?: "normal" | "medium" | "semibold" | "bold";
}

// Helper function to generate the correct Tailwind classes
const getHeadingClasses = ({
  variant,
  size,
  weight,
}: Pick<HeadingProps, "variant" | "size" | "weight">): string => {
  const variantClasses = {
    title: "text-title",
    subtitle: "text-subtitle",
    paragraph: "text-paragraph",
    primary: "text-primary",
    secondary: "text-secondary",
  };

  const sizeClasses = {
    xs: "text-xs",
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl",
    "3xl": "text-3xl",
    "4xl": "text-4xl",
  };

  const weightClasses = {
    normal: "font-normal",
    medium: "font-medium",
    semibold: "font-semibold",
    bold: "font-bold",
  };

  return [
    "transition-colors mb-3", // Base classes
    variantClasses[variant || "title"],
    sizeClasses[size || "base"], // A default 'base' is set, but will be overridden
    weightClasses[weight || "bold"],
  ].join(" ");
};

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, variant, size, weight, as = "h1", ...props }, ref) => {
    // Determine which HTML tag to use
    const Comp = as;

    // Map heading levels to default responsive font sizes
    const sizeMap: Record<string, HeadingProps["size"]> = {
      h1: "4xl",
      h2: "3xl",
      h3: "2xl",
      h4: "xl",
      h5: "lg",
      h6: "base",
    };

    // Use the explicit `size` prop if provided, otherwise fall back to the map
    const finalSize = size || sizeMap[as];

    // 1. Generate the variant classes using our helper function
    const variantClasses = getHeadingClasses({
      variant,
      size: finalSize,
      weight,
    });

    // 2. Merge them with any custom classes passed via props
    const finalClassName = twMerge(variantClasses, className);

    return <Comp className={finalClassName} ref={ref} {...props} />;
  }
);

Heading.displayName = "Heading";

export { Heading };
