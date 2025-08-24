import { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export const Container = ({ children, className = "" }: ContainerProps) => {
  return (
    <div
      className={`flex flex-col gap-2 min-w-screen min-h-screen h-full p-2 bg-container transition-colors duration-300 ${className}`}
    >
      {children}
    </div>
  );
};
