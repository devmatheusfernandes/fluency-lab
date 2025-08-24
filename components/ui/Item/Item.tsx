"use client";

import * as React from "react";
import { twMerge } from "tailwind-merge";
import { Text } from "@/components/ui/Text"; // Assuming you have a Text component

// --- Item Component ---

export interface ItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /** An optional icon to display at the start of the item. */
  icon?: React.ReactNode;
  /** An optional interactive element (e.g., Button, Switch) at the end. */
  action?: React.ReactNode;
}

const Item = React.forwardRef<HTMLDivElement, ItemProps>(
  ({ className, children, icon, action, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={twMerge(
          "flex w-full items-center gap-4 rounded-xl p-4 transition-colors hover:bg-surface-hover",
          className
        )}
        {...props}
      >
        {/* Icon Slot */}
        {icon && <div className="flex-shrink-0 text-subtitle">{icon}</div>}

        {/* Main Content Slot */}
        <div className="flex-1">
          <Text size="sm" weight="medium" className="text-paragraph">
            {children}
          </Text>
        </div>

        {/* Action Slot */}
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    );
  }
);
Item.displayName = "Item";

// --- SubItem Component ---

const SubItem = React.forwardRef<HTMLDivElement, ItemProps>(
  ({ className, children, icon, action, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={twMerge(
          // The key difference is the left padding for indentation
          "flex w-full items-center gap-4 rounded-xl p-4 pl-12 transition-colors hover:bg-surface-hover",
          className
        )}
        {...props}
      >
        {/* Icon Slot */}
        {icon && <div className="flex-shrink-0 text-subtitle">{icon}</div>}

        {/* Main Content Slot */}
        <div className="flex-1">
          <Text size="sm" className="text-subtitle">
            {children}
          </Text>
        </div>

        {/* Action Slot */}
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    );
  }
);
SubItem.displayName = "SubItem";

export { Item, SubItem };
