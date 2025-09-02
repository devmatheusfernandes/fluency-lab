import * as React from "react";
import { twMerge } from "tailwind-merge";

// Define the component's props with all the possible variants
export interface BadgeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "style"> {
  /**
   * The color variant of the badge, mapped to your theme.
   * @default 'primary'
   */
  variant?: "primary" | "secondary" | "success" | "info" | "warning" | "danger";
  /**
   * The style of the badge.
   * @default 'outline'
   */
  style?: "solid" | "outline";
}

// Helper function to generate the correct Tailwind classes
const getBadgeClasses = ({
  variant,
  style,
}: Pick<BadgeProps, "variant" | "style">): string => {
  const baseClasses =
    "inline-flex items-center rounded-2xl px-3 py-1 text-xs font-regular transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1";

  const styleVariants = {
    solid: {
      primary: "border-transparent bg-primary text-primary-text",
      secondary: "border-transparent bg-secondary text-secondary-text",
      success: "border-transparent bg-success text-white",
      info: "border-transparent bg-info text-white",
      warning: "border-transparent bg-warning text-white",
      danger: "border-transparent bg-danger text-white",
    },
    outline: {
      primary:
        "text-indigo-800 dark:text-indigo-500 border-primary bg-primary/20 dark:bg-primary/40 hover:bg-primary/20",
      secondary:
        "text-amber-800 dark:text-secondary border-secondary bg-secondary/30 dark:bg-secondary/10 hover:bg-secondary/20",
      success:
        "text-teal-900 dark:text-teal-500 border-success bg-success/25 hover:bg-success/20",
      info: "text-info border-info bg-info/10 hover:bg-info/20",
      warning: "text-warning border-warning bg-warning/10 hover:bg-warning/20",
      danger:
        "text-rose-700 dark:text-danger border-danger bg-danger/20 dark:bg-danger/10 hover:bg-danger/20",
    },
  };

  return twMerge(
    baseClasses,
    styleVariants[style || "outline"][variant || "primary"]
  );
};

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={twMerge(getBadgeClasses({ variant, style }), className)}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";

export { Badge };
