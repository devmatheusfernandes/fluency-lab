"use client";
import * as React from "react";
import { twMerge } from "tailwind-merge";
import { motion, AnimatePresence } from "framer-motion";

export interface TooltipProps {
  /**
   * The content to display in the tooltip.
   */
  content: React.ReactNode;
  /**
   * The element that triggers the tooltip.
   */
  children: React.ReactNode;
  /**
   * The position of the tooltip relative to the trigger.
   * @default 'top'
   */
  position?: "top" | "right" | "bottom" | "left";
  /**
   * The alignment of the tooltip relative to the trigger.
   * @default 'center'
   */
  align?: "start" | "center" | "end";
  /**
   * Custom CSS classes to apply to the tooltip content.
   */
  className?: string;
  /**
   * The size of the tooltip.
   * @default 'base'
   */
  size?: "sm" | "base" | "lg";
  /**
   * The color variant of the tooltip.
   * @default 'default'
   */
  variant?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger";
  /**
   * Whether to show the tooltip (controlled mode).
   * @default false
   */
  show?: boolean;
  /**
   * Delay before showing tooltip on hover (ms).
   * @default 0
   */
  showDelay?: number;
  /**
   * Delay before hiding tooltip on mouse leave (ms).
   * @default 100
   */
  hideDelay?: number;
  /**
   * Whether to disable hover interactions.
   * @default false
   */
  disabled?: boolean;
  /**
   * Animation preset for entrance/exit transitions.
   * @default 'scale'
   */
  animation?: "scale" | "slide" | "fade" | "bounce";
  /**
   * Duration of the animation in seconds.
   * @default 0.2
   */
  animationDuration?: number;
}

// Style constants moved outside component for better performance
const TOOLTIP_STYLES = {
  size: {
    sm: "text-xs px-2 py-1",
    base: "text-sm px-3 py-2",
    lg: "text-base px-4 py-3",
  },
  variant: {
    default: "bg-surface-1 text-paragraph border border-surface-2",
    primary: "bg-primary text-primary-text border border-primary",
    secondary: "bg-secondary text-secondary-text border border-secondary",
    success: "bg-success text-white border border-success",
    warning: "bg-warning text-white border border-warning",
    danger: "bg-danger text-white border border-danger",
  },
  arrow: {
    default: "bg-surface-1 border-surface-2",
    primary: "bg-primary border-primary",
    secondary: "bg-secondary border-secondary",
    success: "bg-success border-success",
    warning: "bg-warning border-warning",
    danger: "bg-danger border-danger",
  },
  position: {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  },
  align: {
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0",
  },
} as const;

// Animation variants for different entrance/exit styles
const getAnimationVariants = (
  position: TooltipProps["position"],
  animation: TooltipProps["animation"]
) => {
  const baseVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const slideDirections = {
    top: { y: 10 },
    bottom: { y: -10 },
    left: { x: 10 },
    right: { x: -10 },
  };

  switch (animation) {
    case "scale":
      return {
        hidden: { ...baseVariants.hidden, scale: 0.8 },
        visible: { ...baseVariants.visible, scale: 1 },
      };
    case "slide":
      return {
        hidden: {
          ...baseVariants.hidden,
          ...slideDirections[position || "top"],
        },
        visible: {
          ...baseVariants.visible,
          x: 0,
          y: 0,
        },
      };
    case "bounce":
      return {
        hidden: {
          ...baseVariants.hidden,
          scale: 0.3,
          ...slideDirections[position || "top"],
        },
        visible: {
          ...baseVariants.visible,
          scale: 1,
          x: 0,
          y: 0,
          transition: {
            type: "spring" as const,
            stiffness: 400,
            damping: 15,
          },
        },
      };
    case "fade":
    default:
      return baseVariants;
  }
};

// Arrow positioning logic extracted to a separate function
const getArrowStyles = (position: TooltipProps["position"]) => {
  const arrowPositions = {
    top: { top: "-4px", left: "50%", transform: "translateX(-50%)" },
    bottom: { bottom: "-4px", left: "50%", transform: "translateX(-50%)" },
    left: { left: "-4px", top: "50%", transform: "translateY(-50%)" },
    right: { right: "-4px", top: "50%", transform: "translateY(-50%)" },
  };

  return arrowPositions[position || "top"];
};

// Get arrow border styles for different positions
const getArrowBorderStyles = (position: TooltipProps["position"]) => {
  switch (position) {
    case "top":
      return "border-l border-t";
    case "bottom":
      return "border-r border-b";
    case "left":
      return "border-l border-b";
    case "right":
      return "border-r border-t";
    default:
      return "border-l border-t";
  }
};

// Custom hook for tooltip visibility logic
const useTooltipVisibility = (
  show: boolean | undefined,
  showDelay: number,
  hideDelay: number,
  disabled: boolean
) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const showTimeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined);
  const hideTimeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined);

  const clearTimeouts = React.useCallback(() => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = undefined;
    }
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = undefined;
    }
  }, []);

  const handleMouseEnter = React.useCallback(() => {
    if (disabled || show !== undefined) return;

    clearTimeouts();

    if (showDelay > 0) {
      showTimeoutRef.current = setTimeout(() => {
        setIsVisible(true);
      }, showDelay);
    } else {
      setIsVisible(true);
    }
  }, [disabled, show, showDelay, clearTimeouts]);

  const handleMouseLeave = React.useCallback(() => {
    if (disabled || show !== undefined) return;

    clearTimeouts();

    if (hideDelay > 0) {
      hideTimeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, hideDelay);
    } else {
      setIsVisible(false);
    }
  }, [disabled, show, hideDelay, clearTimeouts]);

  React.useEffect(() => {
    return clearTimeouts;
  }, [clearTimeouts]);

  const shouldShow = show !== undefined ? show : isVisible;

  return {
    shouldShow,
    handleMouseEnter,
    handleMouseLeave,
  };
};

const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  (
    {
      content,
      children,
      position = "top",
      align = "center",
      className,
      size = "base",
      variant = "default",
      show,
      showDelay = 0,
      hideDelay = 100,
      disabled = false,
      animation = "scale",
      animationDuration = 0.2,
      ...props
    },
    ref
  ) => {
    const { shouldShow, handleMouseEnter, handleMouseLeave } =
      useTooltipVisibility(show, showDelay, hideDelay, disabled);

    // Memoize class names for better performance
    const tooltipClasses = React.useMemo(() => {
      const baseClasses =
        "absolute z-50 overflow-hidden rounded-lg shadow-lg backdrop-blur-sm";
      const sizeClass = TOOLTIP_STYLES.size[size];
      const variantClass = TOOLTIP_STYLES.variant[variant];
      const positionClass = TOOLTIP_STYLES.position[position];

      // Only apply alignment classes for top/bottom positions
      const alignClass =
        position === "top" || position === "bottom"
          ? TOOLTIP_STYLES.align[align]
          : "";

      return twMerge(
        baseClasses,
        sizeClass,
        variantClass,
        positionClass,
        alignClass,
        className
      );
    }, [size, variant, position, align, className]);

    const arrowClasses = React.useMemo(() => {
      const borderClass = getArrowBorderStyles(position);
      return twMerge(
        "absolute w-2 h-2 rotate-45",
        TOOLTIP_STYLES.arrow[variant],
        borderClass
      );
    }, [variant, position]);

    const arrowStyles = React.useMemo(
      () => getArrowStyles(position),
      [position]
    );

    const animationVariants = React.useMemo(
      () => getAnimationVariants(position, animation),
      [position, animation]
    );

    if (!content) return <>{children}</>;

    return (
      <motion.div
        className="relative inline-block"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        whileHover={disabled ? {} : { scale: 1.02 }}
        transition={{ duration: 0.1 }}
      >
        {children}
        <AnimatePresence mode="wait">
          {shouldShow && (
            <motion.div
              ref={ref}
              className={tooltipClasses}
              role="tooltip"
              aria-hidden={!shouldShow}
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={animationVariants}
              transition={{
                duration: animationDuration,
                ease: "easeOut",
                ...(animation === "bounce" ? {} : {}),
              }}
              {...props}
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: animationDuration * 0.3 }}
              >
                {content}
              </motion.div>
              <motion.div
                className={arrowClasses}
                style={arrowStyles}
                aria-hidden="true"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  delay: animationDuration * 0.1,
                  duration: animationDuration * 0.8,
                  ease: "easeOut",
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }
);

Tooltip.displayName = "Tooltip";

export { Tooltip };
