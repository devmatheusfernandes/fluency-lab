"use client";

import * as React from "react";
import { twMerge } from "tailwind-merge";
import { HomeAngle } from "@solar-icons/react/ssr";

// Define the shape of a single breadcrumb item
type BreadcrumbItem = {
  label: string;
  href: string;
};

// Define the props for the main component
export interface BreadcrumbProps {
  /** An array of items to display in the breadcrumb trail. */
  items: BreadcrumbItem[];
  /** Optional additional class names for the container. */
  className?: string;
}

const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ items, className }, ref) => {
    if (!items || items.length === 0) {
      return null;
    }

    return (
      <nav
        ref={ref}
        aria-label="Breadcrumb"
        className={twMerge("text-sm", className)}
      >
        <ol className="flex flex-wrap items-center gap-2">
          {items.map((item, index) => {
            const isLastItem = index === items.length - 1;

            return (
              <li key={item.href} className="flex items-center gap-2">
                {/* Render the link or text */}
                {isLastItem ? (
                  <span
                    className="font-semibold text-paragraph"
                    aria-current="page"
                  >
                    {item.label}
                  </span>
                ) : (
                  <a
                    href={item.href}
                    className="flex items-center gap-1.5 text-subtitle hover:text-primary transition-colors"
                  >
                    {/* Add a home icon for the first item */}
                    {index === 0 && <HomeAngle className="h-4 w-4" />}
                    <span>{item.label}</span>
                  </a>
                )}

                {/* Render a separator, but not for the last item */}
                {!isLastItem && (
                  <span className="text-subtitle/50 select-none">/</span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }
);

Breadcrumb.displayName = "Breadcrumb";

export default Breadcrumb;
