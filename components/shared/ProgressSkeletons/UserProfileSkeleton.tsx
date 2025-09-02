import React from "react";
import SkeletonLoader from "@/components/shared/Skeleton/SkeletonLoader";

interface UserProfileSkeletonProps {
  className?: string;
}

const UserProfileSkeleton: React.FC<UserProfileSkeletonProps> = ({
  className = "",
}) => {
  return (
    <SkeletonLoader
      className={`flex flex-row justify-between items-center w-full ${className}`}
    >
      <div className="flex flex-row items-center sm:items-start gap-2">
        <div className="w-16 h-16 rounded-2xl bg-background dark:bg-container/80" />
        <div className="flex flex-col items-start mt-0 sm:mt-2">
          <div className="h-5 w-32 bg-background dark:bg-container/80 rounded mb-1"></div>
          <div className="h-4 w-40 bg-background dark:bg-container/80 rounded mb-1"></div>
          <div className="h-5 w-16 bg-background dark:bg-container/80 rounded"></div>
        </div>
      </div>
      <div className="w-10 h-10 rounded-lg bg-background dark:bg-container/80"></div>
    </SkeletonLoader>
  );
};

export default UserProfileSkeleton;
