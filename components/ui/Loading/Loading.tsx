import * as React from "react";
import { twMerge } from "tailwind-merge";

export interface LoadingProps {
  /**
   * The type of loading animation to display.
   * @default 'spinner'
   */
  variant?: "spinner" | "dots" | "skeleton" | "pulse";
  /**
   * The size of the loading animation.
   * @default 'base'
   */
  size?: "sm" | "base" | "lg";
  /**
   * Custom CSS classes to apply to the loading component.
   */
  className?: string;
  /**
   * The text to display below the loading animation.
   */
  text?: string;
  /**
   * If true, the loading component will take the full width of its container.
   * @default false
   */
  fullWidth?: boolean;
}

const Loading = React.forwardRef<HTMLDivElement, LoadingProps>(
  (
    {
      variant = "spinner",
      size = "base",
      className,
      text,
      fullWidth = false,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: "w-5 h-5",
      base: "w-8 h-8",
      lg: "w-8 h-8",
    };

    const textSizeClasses = {
      sm: "text-xs",
      base: "text-sm",
      lg: "text-base",
    };

    const renderSpinner = () => (
      <div
        className={twMerge(
          "animate-spin rounded-full border-4 border-surface-2 border-t-primary",
          sizeClasses[size]
        )}
      />
    );

    const renderDots = () => (
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={twMerge(
              "bg-primary rounded-full animate-pulse",
              size === "sm"
                ? "w-2 h-2"
                : size === "base"
                  ? "w-2 h-2"
                  : "w-2 h-2"
            )}
            style={{
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
    );

    const renderSkeleton = () => (
      <div className="flex space-x-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={twMerge(
              "bg-surface-2 rounded animate-pulse",
              size === "sm"
                ? "w-2 h-2"
                : size === "base"
                  ? "w-3 h-3"
                  : "w-4 h-4"
            )}
            style={{
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>
    );

    const renderPulse = () => (
      <div
        className={twMerge(
          "bg-primary rounded-full animate-ping",
          sizeClasses[size]
        )}
      />
    );

    const renderAnimation = () => {
      switch (variant) {
        case "dots":
          return renderDots();
        case "skeleton":
          return renderSkeleton();
        case "pulse":
          return renderPulse();
        default:
          return renderSpinner();
      }
    };

    return (
      <div
        ref={ref}
        className={twMerge(
          "flex flex-col items-center justify-center space-y-2",
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {renderAnimation()}
        {text && (
          <p
            className={twMerge(
              "text-paragraph text-center",
              textSizeClasses[size]
            )}
          >
            {text}
          </p>
        )}
      </div>
    );
  }
);

Loading.displayName = "Loading";

export { Loading };
