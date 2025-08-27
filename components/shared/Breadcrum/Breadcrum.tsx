"use client";
import * as React from "react";
import { twMerge } from "tailwind-merge";
import { Siderbar } from "@solar-icons/react/ssr";
import { ThemeToggle } from "@/components/features/ThemeToggle";

type BreadcrumbItem = {
  label: string;
  href: string;
};

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  onToggleSidebar?: () => void;
}

const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ items, className, onToggleSidebar }, ref) => {
    const currentItem =
      items && items.length > 0 ? items[items.length - 1] : null;

    if (!currentItem) {
      return null;
    }

    return (
      <nav
        ref={ref}
        aria-label="Breadcrumb"
        className={twMerge(
          "flex items-center justify-between w-full text-sm bg-surface-1 rounded-t-lg py-1 px-3",
          className
        )}
      >
        {onToggleSidebar && (
          <Siderbar
            weight="Bold"
            className="hidden sm:block text-primary hover:text-placeholder/50 duration-300 ease-in-out transition-all cursor-pointer w-6.5 h-6.5"
            onClick={onToggleSidebar}
          />
        )}
        <span
          className="font-semibold text-md text-paragraph"
          aria-current="page"
        >
          {currentItem.label}
        </span>
        <ThemeToggle />
      </nav>
    );
  }
);

Breadcrumb.displayName = "Breadcrumb";

export default Breadcrumb;
