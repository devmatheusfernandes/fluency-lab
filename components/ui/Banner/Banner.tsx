"use client";

import * as React from "react";
import { twMerge } from "tailwind-merge";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { CloseCircle } from "@solar-icons/react/ssr";

// --- Type Definitions (No Changes) ---
export interface BannerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "success" | "warning" | "danger";
  isOpen?: boolean;
  onClose?: () => void;
  icon?: React.ReactNode;
  placement?: "top" | "bottom";
}

// --- Helper for styling (No Changes) ---
const getBannerClasses = ({ variant }: Pick<BannerProps, "variant">) => {
  const variantStyles = {
    info: {
      container: "bg-info/10 text-info border-2 border-info/20 shadow-lg",
      iconContainer: "text-info",
    },
    success: {
      container:
        "bg-success/10 text-success border-2 border-success/20 shadow-lg",
      iconContainer: "text-success",
    },
    warning: {
      container:
        "bg-warning/10 text-warning border-2 border-warning/20 shadow-lg",
      iconContainer: "text-warning",
    },
    danger: {
      container: "bg-danger/10 text-danger border-2 border-danger/20 shadow-lg",
      iconContainer: "text-danger",
    },
  };
  return variantStyles[variant || "info"];
};

// highlight-start
// --- UPDATED Helper for positioning ---
const getPlacementClasses = (placement?: "top" | "bottom") => {
  switch (placement) {
    case "top":
      // Pinned to top, no side margins, rounded BOTTOM corners
      return "fixed top-0 left-0 right-0 z-50 rounded-b-2xl animate-in slide-in-from-top-8 duration-300";
    case "bottom":
      // Pinned to bottom, no side margins, rounded TOP corners
      return "fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl animate-in slide-in-from-bottom-8 duration-300";
    default:
      // Default inline banner with all corners rounded
      return "relative w-full rounded-2xl";
  }
};
// highlight-end

// --- Main Banner Component ---
const Banner = React.forwardRef<HTMLDivElement, BannerProps>(
  (
    {
      className,
      children,
      variant = "info",
      icon,
      isOpen = true,
      onClose,
      placement,
      ...props
    },
    ref
  ) => {
    if (!isOpen) {
      return null;
    }

    const styles = getBannerClasses({ variant });
    const placementStyles = getPlacementClasses(placement);

    return (
      <div
        ref={ref}
        className={twMerge(
          // highlight-start
          // Common styles (removed rounded-2xl from here)
          "p-6 flex items-center border-2 transition-all duration-200 hover:shadow-xl",
          // highlight-end
          styles.container,
          placementStyles,
          className
        )}
        role="alert"
        {...props}
      >
        {icon && (
          <div className={twMerge("flex-shrink-0 mr-4", styles.iconContainer)}>
            {icon}
          </div>
        )}
        <div className="flex-1">
          <Text size="sm" weight="medium" className="!text-current">
            {children}
          </Text>
        </div>
        {onClose && (
          <div className="pl-4 ml-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="!text-current h-8 w-8 rounded-xl hover:bg-white/20"
            >
              <CloseCircle className="w-5 h-5" />
              <span className="sr-only">Dismiss</span>
            </Button>
          </div>
        )}
      </div>
    );
  }
);

Banner.displayName = "Banner";

export { Banner };
