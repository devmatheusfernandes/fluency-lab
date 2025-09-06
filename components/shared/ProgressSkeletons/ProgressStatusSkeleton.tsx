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
      <SkeletonLoader
        variant="text"
        lines={1}
        className="h-6 rounded mb-4 w-1/3"
      />
      <div className="space-y-3">
        <SkeletonLoader variant="rect" className="h-12 rounded" />
        <SkeletonLoader variant="rect" className="h-12 rounded" />
      </div>
    </SkeletonLoader>
  );
};

export default ProgressStatusSkeleton;
