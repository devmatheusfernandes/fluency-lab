import React from "react";
import SkeletonLoader from "@/components/shared/Skeleton/SkeletonLoader";

interface StudentCardSkeletonProps {
  className?: string;
}

const StudentCardSkeleton: React.FC<StudentCardSkeletonProps> = ({
  className = "",
}) => {
  return (
    <SkeletonLoader className={`rounded-2xl p-4 ${className}`}>
      <div className="flex items-center space-x-4">
        {/* Avatar skeleton */}
        <SkeletonLoader variant="avatar" size="lg" />

        <div className="flex-1 min-w-0 space-y-2">
          {/* Name skeleton */}
          <SkeletonLoader
            variant="text"
            lines={1}
            className="h-5 w-3/4 rounded"
          />

          {/* Email skeleton */}
          <SkeletonLoader
            variant="text"
            lines={1}
            className="h-4 w-full rounded"
          />

          {/* Next class info skeleton */}
          <div className="flex flex-row items-center gap-2">
            <SkeletonLoader variant="circle" className="w-5 h-5" />
            <SkeletonLoader
              variant="text"
              lines={1}
              className="h-4 w-1/2 rounded"
            />
          </div>
        </div>
      </div>
    </SkeletonLoader>
  );
};

export default StudentCardSkeleton;
