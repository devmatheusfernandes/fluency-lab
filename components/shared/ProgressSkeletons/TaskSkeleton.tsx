import React from "react";
import SkeletonLoader from "@/components/shared/Skeleton/SkeletonLoader";

interface TaskSkeletonProps {
  className?: string;
}

const TaskSkeleton: React.FC<TaskSkeletonProps> = ({ className }) => {
  return (
    <div
      className={`flex items-center p-3 rounded-lg border border-input/50 ${className || ""}`}
    >
      <SkeletonLoader variant="circle" className="mr-3 h-5 w-5 skeleton-base" />
      <div className="flex-1">
        <SkeletonLoader
          variant="text"
          lines={1}
          className="skeleton-base h-4 rounded w-full"
        />
      </div>
      <SkeletonLoader variant="circle" className="ml-2 h-5 w-5 skeleton-base" />
    </div>
  );
};

export default TaskSkeleton;
