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
  React.ComponentRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & {
    hasError?: boolean;
    size?: "sm" | "base" | "lg";
  }
>(({ className, hasError = false, size = "base", children, ...props }, ref) => {
  // Modern base classes with glass morphism and enhanced styling
  const baseClasses =
    "flex w-full items-center justify-between card-base backdrop-blur-sm  text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-white dark:hover:bg-gray-800 focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 dark:focus-visible:ring-blue-400/20 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ease-in-out shadow-sm hover:shadow-md";

  // Size classes with improved spacing
  const sizeClasses = {
    sm: "h-9 px-3 py-2 text-sm gap-2",
    base: "h-10 px-4 py-2.5 text-sm gap-2",
    lg: "h-12 px-5 py-3 text-base gap-3",
  };

  // Enhanced error classes with modern error styling
  const errorClasses =
    "border-red-300 dark:border-red-700 bg-red-50/80 dark:bg-red-950/20 hover:border-red-400 dark:hover:border-red-600 focus:border-red-500 dark:focus:border-red-400 focus:bg-red-50 dark:focus:bg-red-950/30 focus-visible:ring-red-500/20 dark:focus-visible:ring-red-400/20";

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
      <div className="flex-1 text-left truncate">{children}</div>
      <SelectPrimitive.Icon asChild>
        <ArrowDown
          weight="Broken"
          className={twMerge(
            "shrink-0 text-gray-500 dark:text-gray-400 transition-transform duration-200 ease-in-out",
            size === "sm" && "h-3 w-3",
            size === "base" && "h-4 w-4",
            size === "lg" && "h-5 w-5"
          )}
        />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
});

const SelectValue = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Value>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Value>
>(({ className, placeholder, ...props }, ref) => (
  <SelectPrimitive.Value
    ref={ref}
    className={twMerge("text-gray-900 dark:text-white truncate", className)}
    placeholder={
      <span className="text-gray-500 dark:text-gray-400">{placeholder}</span>
    }
    {...props}
  />
));

const SelectPortal = SelectPrimitive.Portal;

const SelectContent = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPortal>
    <SelectPrimitive.Content
      ref={ref}
      className={twMerge(
        "relative z-50 min-w-[8rem] max-h-96 overflow-y-scroll no-scrollbar rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md shadow-lg text-gray-900 dark:text-white data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <div className="p-1">
        <SelectPrimitive.Viewport
          className={twMerge(
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]",
            position === "popper" && "h-auto"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
      </div>
    </SelectPrimitive.Content>
  </SelectPortal>
));

const SelectOption = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Item>,
  SelectOptionProps
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={twMerge(
      "relative flex cursor-default select-none items-center rounded-md px-3 py-2 text-sm font-medium outline-none transition-all duration-150 ease-in-out hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white focus:bg-blue-50 dark:focus:bg-blue-950/50 focus:text-blue-900 dark:focus:text-blue-100 data-[state=checked]:bg-blue-100 dark:data-[state=checked]:bg-blue-950/50 data-[state=checked]:text-blue-900 dark:data-[state=checked]:text-blue-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <SelectPrimitive.ItemText className="flex-1 truncate">
      {children}
    </SelectPrimitive.ItemText>
    <SelectPrimitive.ItemIndicator className="ml-2 flex h-4 w-4 items-center justify-center">
      <svg
        className="h-3 w-3 text-blue-600 dark:text-blue-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={3}
          d="M5 13l4 4L19 7"
        />
      </svg>
    </SelectPrimitive.ItemIndicator>
  </SelectPrimitive.Item>
));

const SelectLabel = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={twMerge(
      "px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider",
      className
    )}
    {...props}
  />
));

const SelectSeparator = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={twMerge("my-1 h-px bg-gray-200 dark:bg-gray-700", className)}
    {...props}
  />
));

const SelectGroup = SelectPrimitive.Group;

Select.displayName = "Select";
SelectTrigger.displayName = "Select.Trigger";
SelectValue.displayName = "Select.Value";
SelectPortal.displayName = "Select.Portal";
SelectContent.displayName = "Select.Content";
SelectOption.displayName = "Select.Option";
SelectLabel.displayName = "Select.Label";
SelectSeparator.displayName = "Select.Separator";
SelectGroup.displayName = "Select.Group";

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectPortal,
  SelectContent,
  SelectOption,
  SelectLabel,
  SelectSeparator,
  SelectGroup,
};
