import * as React from "react";
import { twMerge } from "tailwind-merge";

export interface SubContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional sub-container variant for different styles */
  variant?: "default" | "elevated" | "outlined";
}

const SubContainer = React.forwardRef<HTMLDivElement, SubContainerProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={twMerge(
        "w-full bg-surface-1 p-4 sm:p-6 rounded-b-lg",
        className
      )}
      {...props}
    />
  )
);

SubContainer.displayName = "SubContainer";

export { SubContainer };
