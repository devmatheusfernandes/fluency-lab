import React from "react";
import SkeletonLoader from "@/components/shared/Skeleton/SkeletonLoader";

interface ProgressStatusSkeletonProps {
  className?: string;
}

const ProgressStatusSkeleton: React.FC<ProgressStatusSkeletonProps> = ({
  className = "",
}) => {
  return (
    <SkeletonLoader>
      <div className="h-6 bg-background dark:bg-container/80 rounded mb-4 w-1/3"></div>
      <div className="space-y-3">
        <div className="h-12 bg-background dark:bg-container/80 rounded"></div>
        <div className="h-12 bg-background dark:bg-container/80 rounded"></div>
      </div>
    </SkeletonLoader>
  );
};

export default ProgressStatusSkeleton;
