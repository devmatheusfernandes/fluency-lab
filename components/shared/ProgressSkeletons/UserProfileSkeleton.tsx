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
        <SkeletonLoader
          variant="avatar"
          size="lg"
          className="rounded-2xl w-16 h-16"
        />
        <div className="flex flex-col items-start mt-0 sm:mt-2 space-y-1">
          <SkeletonLoader
            variant="text"
            lines={1}
            className="h-5 rounded w-32"
          />
          <SkeletonLoader
            variant="text"
            lines={1}
            className="h-4 rounded w-40"
          />
          <SkeletonLoader
            variant="text"
            lines={1}
            className="h-5 rounded w-16"
          />
        </div>
      </div>
      <SkeletonLoader variant="rect" className="w-10 h-10 rounded-lg" />
    </SkeletonLoader>
  );
};

export default UserProfileSkeleton;
