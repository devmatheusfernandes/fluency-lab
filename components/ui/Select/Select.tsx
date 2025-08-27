import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { twMerge } from "tailwind-merge";
import { ArrowDown } from "@solar-icons/react/ssr";

// Define the component's props
export interface SelectProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root> {
  /**
   * If true, the select will have a red border to indicate an error.
   * @default false
   */
  hasError?: boolean;
  /**
   * The size of the select element.
   * @default 'base'
   */
  size?: "sm" | "base" | "lg";
}

export interface SelectOptionProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> {
  value: string;
  children: React.ReactNode;
}

const Select = ({ children, ...props }: SelectProps) => {
  return <SelectPrimitive.Root {...props}>{children}</SelectPrimitive.Root>;
};

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & {
    hasError?: boolean;
    size?: "sm" | "base" | "lg";
  }
>(({ className, hasError = false, size = "base", children, ...props }, ref) => {
  // Base classes for the select trigger with modern styling
  const baseClasses =
    "flex w-full hover:text-primary items-center justify-between rounded-2xl border-2 border-surface-0/60 hover:border-surface-0/80 focus:border-surface-0/50 focus:bg-surface-0/70 bg-surface-0/30 hover:bg-surface-0/50 backdrop-blur-xl text-base text-paragraph placeholder:text-placeholder focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ease-in-out focus:bg-white-30";

  // Size classes
  const sizeClasses = {
    sm: "h-10 px-3 py-2 text-sm",
    base: "h-12 px-4 py-3 text-base",
    lg: "h-14 px-5 py-4 text-lg",
  };

  // Classes to apply when there is an error
  const errorClasses =
    "border-error/10 hover:border-error/20 focus:bg-error/20 bg-error/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-error hover:border-error";

  return (
    <SelectPrimitive.Trigger
      ref={ref}
      className={twMerge(
        baseClasses,
        sizeClasses[size],
        hasError && errorClasses,
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ArrowDown
          weight="Broken"
          className="h-4 w-4 text-paragraph transition-transform duration-200 ease-in-out"
        />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
});

const SelectValue = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Value>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Value>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Value
    ref={ref}
    className={twMerge("text-paragraph", className)}
    {...props}
  />
));

const SelectPortal = SelectPrimitive.Portal;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPortal>
    <SelectPrimitive.Content
      ref={ref}
      className={twMerge(
        "relative z-50 min-w-[8rem] overflow-hidden rounded-2xl bg-surface-0/70 backdrop-blur-xl text-paragraph data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectPrimitive.Viewport
        className={twMerge(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPortal>
));

const SelectOption = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  SelectOptionProps
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={twMerge(
      "relative flex cursor-default select-none items-center rounded-xl px-3 py-2.5 text-base outline-none transition-all duration-200 ease-in-out focus:bg-primary/10 focus:text-primary hover:bg-surface-hover hover:text-paragraph data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={twMerge("-mx-1 my-1 h-px bg-surface-2", className)}
    {...props}
  />
));

Select.displayName = "Select";
SelectTrigger.displayName = "Select.Trigger";
SelectValue.displayName = "Select.Value";
SelectPortal.displayName = "Select.Portal";
SelectContent.displayName = "Select.Content";
SelectOption.displayName = "Select.Option";
SelectSeparator.displayName = "Select.Separator";

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectPortal,
  SelectContent,
  SelectOption,
  SelectSeparator,
};
