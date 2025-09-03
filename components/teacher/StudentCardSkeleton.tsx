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
        <div className="w-16 h-16 rounded-xl bg-background dark:bg-background/40" />

        <div className="flex-1 min-w-0">
          {/* Name skeleton */}
          <div className="h-5 w-3/4 bg-background dark:bg-background/70 rounded mb-2"></div>

          {/* Email skeleton */}
          <div className="h-4 w-full bg-background dark:bg-background/70 rounded mb-3"></div>

          {/* Next class info skeleton */}
          <div className="flex flex-row items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-background dark:bg-background/70"></div>
            <div className="h-4 w-1/2 bg-background dark:bg-background/70 rounded"></div>
          </div>
        </div>
      </div>
    </SkeletonLoader>
  );
};

export default StudentCardSkeleton;
