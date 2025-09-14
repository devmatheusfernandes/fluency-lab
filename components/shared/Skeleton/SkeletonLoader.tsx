import React from "react";
import { twMerge } from "tailwind-merge";

interface SkeletonLoaderProps {
  /**
   * Custom CSS classes to apply to the skeleton.
   */
  className?: string;
  /**
   * The child elements to render inside the skeleton.
   * If provided, the skeleton will wrap these elements.
   * If not provided, a default skeleton will be rendered.
   */
  children?: React.ReactNode;
  /**
   * The variant of the skeleton to render.
   * @default 'text'
   */
  variant?: "text" | "circle" | "rect" | "avatar";
  /**
   * The size of the skeleton.
   * @default 'base'
   */
  size?: "sm" | "base" | "lg";
  /**
   * Whether the skeleton should be animated.
   * @default true
   */
  animated?: boolean;
  /**
   * The width of the skeleton.
   */
  width?: string;
  /**
   * The height of the skeleton.
   */
  height?: string;
  /**
   * The number of lines for text variant.
   * @default 1
   */
  lines?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  className = "",
  children,
  variant = "text",
  size = "base",
  animated = true,
  width,
  height,
  lines = 1,
}) => {
  // Base classes for all skeletons
  const baseClasses = twMerge("rounded", animated && "animate-shimmer");

  // Size classes
  const sizeClasses = {
    sm: "h-3",
    base: "h-4",
    lg: "h-6",
  };

  // Variant classes
  const variantClasses = {
    text: "",
    circle: "rounded-full",
    rect: "",
    avatar: "rounded-full",
  };

  // Size-specific classes for avatar
  const avatarSizeClasses = {
    sm: "w-8 h-8",
    base: "w-12 h-12",
    lg: "w-16 h-16",
  };

  // Render default skeleton based on variant
  const renderDefaultSkeleton = () => {
    if (variant === "avatar") {
      return (
        <div
          className={twMerge(
            baseClasses,
            variantClasses.avatar,
            avatarSizeClasses[size]
          )}
          style={{ width, height }}
        />
      );
    }

    if (variant === "circle") {
      return (
        <div
          className={twMerge(
            baseClasses,
            variantClasses.circle,
            sizeClasses[size]
          )}
          style={{
            width: width || sizeClasses[size],
            height: height || sizeClasses[size],
          }}
        />
      );
    }

    if (variant === "rect") {
      return (
        <div
          className={twMerge(baseClasses, variantClasses.rect)}
          style={{ width, height }}
        />
      );
    }

    // Default text variant with multi-line support
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }, (_, index) => (
          <div
            key={index}
            className={twMerge(
              baseClasses,
              sizeClasses[size],
              index === lines - 1 && lines > 1 && "w-3/4"
            )}
            style={{
              width:
                width || (index === lines - 1 && lines > 1 ? "75%" : "100%"),
              height,
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className={twMerge("inline-block", className)}>
      {children ? children : renderDefaultSkeleton()}
    </div>
  );
};

export default SkeletonLoader;
