import * as React from "react";
import { twMerge } from "tailwind-merge";

// --- Main Card Wrapper ---
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={twMerge("rounded-lg p-4 bg-surface-2 text-paragraph", className)}
    {...props}
  />
));
Card.displayName = "Card";

// --- Card Header ---
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={twMerge("flex flex-col space-y-1.5 pl-6 pt-6 pb-3", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

// --- Card Title (using your Heading component) ---
const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={twMerge(
      "text-2xl font-semibold leading-none tracking-tight text-title",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

// --- Card Description ---
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={twMerge(
      "text-sm text-muted-foreground text-paragraph opacity-70",
      className
    )}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

// --- Card Content ---
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={twMerge("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

// --- Card Footer ---
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={twMerge("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
};
