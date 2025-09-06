import { ReactNode } from "react";

interface ContainerCardProps {
  children: ReactNode;
  className?: string;
}

export const ContainerCard = ({
  children,
  className = "",
}: ContainerCardProps) => {
  return (
    <div
      className={`w-full bg-container rounded-b-lg overflow-y-auto transition-colors duration-300 no-scrollbar gap-2 p-1 sm:p-2 ${className}`}
    >
      {children}
    </div>
  );
};
