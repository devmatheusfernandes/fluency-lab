import React from "react";
import SkeletonLoader from "../Skeleton/SkeletonLoader";

interface ProgressStatusSkeletonProps {
  className?: string;
}

const ProgressStatusSkeleton: React.FC<ProgressStatusSkeletonProps> = ({}) => {
  return (
    <div>
      <SkeletonLoader
        variant="text"
        lines={1}
        className="skeleton-base h-6 rounded mb-4 w-1/3"
      />
      <div className="space-y-3">
        <SkeletonLoader
          variant="rect"
          className="skeleton-base h-12 w-full rounded"
        />
        <SkeletonLoader
          variant="rect"
          className="skeleton-base h-12 w-full rounded"
        />
      </div>
    </div>
  );
};

export default ProgressStatusSkeleton;
