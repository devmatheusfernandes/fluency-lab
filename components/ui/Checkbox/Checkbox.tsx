"use client"; // Required for Radix UI components

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { motion } from "framer-motion";
import { twMerge } from "tailwind-merge";

// Animated check icon component with Framer Motion
const CheckIcon = () => (
  <motion.svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-4 h-4"
    initial={{ scale: 0.5, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ duration: 0.2, ease: "backOut" }}
  >
    <motion.polyline
      points="20 6 9 17 4 12"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.4, ease: "easeInOut", delay: 0.1 }}
      style={{
        strokeDasharray: 1,
      }}
    />
  </motion.svg>
);

const Checkbox = React.forwardRef<
  React.ComponentRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <motion.div transition={{ duration: 0.15 }}>
      <CheckboxPrimitive.Root
        ref={ref}
        className={twMerge(
          "peer h-6 w-6 shrink-0 rounded-lg border-2 border-surface-2 ring-offset-background",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "transition-all duration-200 ease-in-out",
          "data-[state=checked]:bg-primary data-[state=checked]:text-primary-text data-[state=checked]:border-primary",
          "hover:border-primary/80 hover:shadow-sm",
          className
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
          <CheckIcon />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    </motion.div>
  );
});
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
