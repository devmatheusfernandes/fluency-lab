import { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export const Container = ({ children, className = "" }: ContainerProps) => {
  return (
    <div
      className={`w-full bg-container rounded-b-lg transition-colors duration-300 overflow-y-scroll no-scrollbar gap-2 p-3 ${className}`}
    >
      {children}
    </div>
  );
};
