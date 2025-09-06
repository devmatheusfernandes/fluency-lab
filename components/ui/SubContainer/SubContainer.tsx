import * as React from "react";
import { twMerge } from "tailwind-merge";
import { motion, HTMLMotionProps } from "framer-motion";

export interface SubContainerProps extends HTMLMotionProps<"div"> {
  variant?: "default" | "elevated" | "outlined";
}

const MotionDiv = motion.div;

const SubContainer = React.forwardRef<HTMLDivElement, SubContainerProps>(
  ({ className, variant, ...props }, ref) => (
    <MotionDiv
      ref={ref}
      className={twMerge(
        "w-full transition-all duration-200 ease-in-out bg-gray-200/70 dark:bg-gray-700/20 shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700 p-2 sm:p-4 rounded-xl overflow-y-scroll no-scrollbar",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      {...props}
    />
  )
);

SubContainer.displayName = "SubContainer";

export { SubContainer };
