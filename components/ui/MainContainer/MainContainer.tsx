import { ReactNode } from "react";

interface MainContainerProps {
  children: ReactNode;
  className?: string;
}

export const MainContainer = ({
  children,
  className = "",
}: MainContainerProps) => {
  return (
    <div
      className={`w-full  rounded-b-lg transition-colors duration-300 overflow-y-scroll no-scrollbar gap-2 p-1 sm:p-2 ${className}`}
    >
      {children}
    </div>
  );
};
