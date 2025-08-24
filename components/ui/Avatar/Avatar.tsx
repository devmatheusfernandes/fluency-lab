"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { twMerge } from "tailwind-merge";

// --- Main Avatar Component (Root) ---
const Avatar = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> & {
    /** Optional status indicator for the avatar. */
    status?: "online" | "offline";
  }
>(({ className, status, children, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={twMerge(
      "relative flex h-16 w-16 shrink-0 overflow-hidden rounded-2xl shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl",
      className
    )}
    {...props}
  >
    {children}
    {/* Render the status badge if the status prop is provided */}
    {status && (
      <span
        className={twMerge(
          "absolute bottom-1 right-1 block h-4 w-4 rounded-full border-2 border-background ring-1 ring-background",
          status === "online" && "bg-green-500",
          status === "offline" && "bg-subtitle"
        )}
        aria-label={status === "online" ? "Online" : "Offline"}
      />
    )}
  </AvatarPrimitive.Root>
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

// --- Styled Image (No changes) ---
const AvatarImage = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={twMerge("aspect-square h-full w-full object-cover", className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

// --- Styled Fallback (No changes) ---
const AvatarFallback = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={twMerge(
      "flex h-full w-full items-center justify-center rounded-2xl bg-surface-1 text-subtitle border-2 border-surface-2 font-semibold text-lg",
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback };
