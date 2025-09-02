import React from "react";

interface SkeletonLoaderProps {
  className?: string;
  children?: React.ReactNode;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  className = "",
  children,
}) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {children ? (
        children
      ) : (
        <div className="h-4 bg-background dark:bg-container/80 rounded"></div>
      )}
    </div>
  );
};

{
  /* USAR bg-background dark:bg-container/80 COMO CORES*/
}

export default SkeletonLoader;
