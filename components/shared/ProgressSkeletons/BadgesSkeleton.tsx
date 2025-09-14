import React from "react";
import SkeletonLoader from "@/components/shared/Skeleton/SkeletonLoader";

interface BadgesSkeletonProps {
  className?: string;
}

const BadgesSkeleton: React.FC<BadgesSkeletonProps> = ({ className }) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className || ""}`}>
      {/* Circular badge skeleton */}
      <div className="bg-gray-300 dark:bg-gray-600 rounded-full w-[5.9rem] h-[5.9rem] flex items-center justify-center overflow-visible animate-pulse">
        <SkeletonLoader
          variant="rect"
          className="skeleton-base w-[5.3rem] h-[5.3rem] rounded-full"
        />
      </div>
      
      {/* Name skeleton */}
      <SkeletonLoader
        variant="text"
        lines={1}
        className="skeleton-base h-5 rounded mt-2 w-20"
      />
      
      {/* Link text skeleton */}
      <SkeletonLoader
        variant="text"
        lines={1}
        className="skeleton-base h-4 rounded mt-1 w-24"
      />
    </div>
  );
};

export default BadgesSkeleton;