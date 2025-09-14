import React from "react";
import SkeletonLoader from "@/components/shared/Skeleton/SkeletonLoader";

// Enhanced skeleton with modern shimmer effect
const ClassSkeleton = () => (
  <div className="group relative overflow-hidden rounded-xl p-4 lg:p-6 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-gray-200/20 dark:via-gray-400/10 to-transparent"></div>
    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-3">
          <SkeletonLoader
            variant="text"
            lines={1}
            className="h-3 rounded-full w-24"
          />
          <SkeletonLoader
            variant="text"
            lines={1}
            className="h-2 rounded-full w-16"
          />
        </div>
        <SkeletonLoader
          variant="text"
          lines={1}
          className="h-6 rounded-lg w-28"
        />
      </div>
      <div className="flex items-center gap-3">
        <SkeletonLoader variant="rect" className="h-9 w-36 rounded-lg" />
        <SkeletonLoader variant="circle" className="h-9 w-9" />
      </div>
    </div>
  </div>
);

export default ClassSkeleton;