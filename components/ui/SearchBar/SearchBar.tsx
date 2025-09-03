import * as React from "react";
import { twMerge } from "tailwind-merge";
import { Input, type InputProps } from "@/components/ui/Input";
import { MinimalisticMagnifer } from "@solar-icons/react/ssr";

// Define the component's props
// It extends all standard InputProps and adds a prop for the icon
export interface SearchBarProps extends InputProps {
  containerClassName?: string;
}

const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  ({ className, containerClassName, ...props }, ref) => {
    return (
      <div
        className={twMerge(
          "relative flex w-full items-center",
          containerClassName
        )}
      >
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <MinimalisticMagnifer className="h-5 w-5 z-50 text-secondary/50 " />
        </div>
        <Input
          type="search"
          ref={ref}
          className={twMerge("pl-10", className)}
          {...props}
        />
      </div>
    );
  }
);

SearchBar.displayName = "SearchBar";

export { SearchBar };
