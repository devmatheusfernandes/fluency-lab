import * as React from "react";
import { twMerge } from "tailwind-merge";

export interface SkeletonProps {
  /**
   * The type of skeleton to display.
   * @default 'text'
   */
  variant?: "text" | "avatar" | "card" | "button" | "input" | "image";
  /**
   * The size of the skeleton.
   * @default 'base'
   */
  size?: "sm" | "base" | "lg";
  /**
   * Custom CSS classes to apply to the skeleton.
   */
  className?: string;
  /**
   * Whether to show an animated skeleton.
   * @default true
   */
  animated?: boolean;
  /**
   * The number of lines for text variant.
   * @default 1
   */
  lines?: number;
  /**
   * The width of the skeleton (can be a CSS value like '100%', '200px', etc.).
   */
  width?: string;
  /**
   * The height of the skeleton (can be a CSS value like '100%', '200px', etc.).
   */
  height?: string;
  /**
   * Whether the skeleton should take the full width of its container.
   * @default false
   */
  fullWidth?: boolean;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      variant = "text",
      size = "base",
      className,
      animated = true,
      lines = 1,
      width,
      height,
      fullWidth = false,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: "h-3",
      base: "h-4",
      lg: "h-6",
    };

    const avatarSizeClasses = {
      sm: "w-8 h-8",
      base: "w-12 h-12",
      lg: "w-16 h-16",
    };

    const buttonSizeClasses = {
      sm: "h-8 px-3",
      base: "h-10 px-4",
      lg: "h-12 px-6",
    };

    const inputSizeClasses = {
      sm: "h-8",
      base: "h-10",
      lg: "h-12",
    };

    const baseClasses = twMerge(
      "bg-surface-2 rounded-md",
      animated && "animate-pulse",
      fullWidth && "w-full"
    );

    const renderText = () => (
      <div className="space-y-2">
        {Array.from({ length: lines }, (_, index) => (
          <div
            key={index}
            className={twMerge(
              baseClasses,
              sizeClasses[size],
              index === lines - 1 && "w-3/4"
            )}
            style={{
              width: width || (index === lines - 1 ? "75%" : "100%"),
            }}
          />
        ))}
      </div>
    );

    const renderAvatar = () => (
      <div
        className={twMerge(
          baseClasses,
          avatarSizeClasses[size],
          "rounded-full"
        )}
        style={{
          width: width || undefined,
          height: height || undefined,
        }}
      />
    );

    const renderCard = () => (
      <div
        className={twMerge(
          baseClasses,
          "p-4 space-y-3",
          size === "sm" ? "h-24" : size === "base" ? "h-32" : "h-40"
        )}
        style={{
          width: width || undefined,
          height: height || undefined,
        }}
      >
        <div className={twMerge(baseClasses, sizeClasses[size], "w-3/4")} />
        <div className={twMerge(baseClasses, sizeClasses[size], "w-full")} />
        <div className={twMerge(baseClasses, sizeClasses[size], "w-2/3")} />
      </div>
    );

    const renderButton = () => (
      <div
        className={twMerge(baseClasses, buttonSizeClasses[size], "rounded-2xl")}
        style={{
          width: width || undefined,
          height: height || undefined,
        }}
      />
    );

    const renderInput = () => (
      <div
        className={twMerge(baseClasses, inputSizeClasses[size], "rounded-2xl")}
        style={{
          width: width || undefined,
          height: height || undefined,
        }}
      />
    );

    const renderImage = () => (
      <div
        className={twMerge(
          baseClasses,
          size === "sm" ? "h-20" : size === "base" ? "h-32" : "h-48",
          "rounded-lg"
        )}
        style={{
          width: width || undefined,
          height: height || undefined,
        }}
      />
    );

    const renderSkeleton = () => {
      switch (variant) {
        case "avatar":
          return renderAvatar();
        case "card":
          return renderCard();
        case "button":
          return renderButton();
        case "input":
          return renderInput();
        case "image":
          return renderImage();
        default:
          return renderText();
      }
    };

    return (
      <div ref={ref} className={twMerge("inline-block", className)} {...props}>
        {renderSkeleton()}
      </div>
    );
  }
);

Skeleton.displayName = "Skeleton";

export { Skeleton };
