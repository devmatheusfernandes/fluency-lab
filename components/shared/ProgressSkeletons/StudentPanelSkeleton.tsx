import React from "react";
import { Container } from "@/components/ui/Container";
import { SubContainer } from "@/components/ui/SubContainer";
import SkeletonLoader from "@/components/shared/Skeleton/SkeletonLoader";

// Skeleton component for the student panel
const StudentPanelSkeleton = () => (
  <div className="w-full flex flex-col sm:flex-row gap-4">
    {/* Notebooks card skeleton */}
    <SubContainer className="w-full min-h-[300px]">
      <div className="flex flex-col gap-3">
        {/* Search bar skeleton */}
        <SkeletonLoader
          variant="rect"
          className="skeleton-base h-10 rounded-lg mb-4"
        />

        {/* Notebook items skeletons */}
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className="skeleton-base flex flex-row items-start justify-between rounded-lg overflow-hidden p-4"
          >
            <div className="flex-1 space-y-2">
              <SkeletonLoader
                variant="text"
                lines={1}
                className="skeleton-sub h-5 rounded w-3/4"
              />
              <SkeletonLoader
                variant="text"
                lines={1}
                className="skeleton-sub h-3 rounded w-1/2"
              />
            </div>
            <SkeletonLoader
              variant="circle"
              className="skeleton-sub h-5 w-5 rounded"
            />
          </div>
        ))}
      </div>
    </SubContainer>

    {/* Tasks card skeleton */}
    <SubContainer className="min-h-[300px] w-full">
      <div className="flex flex-col gap-3">
        {/* Header with progress bar skeleton */}
        <div className="flex justify-between items-center mb-2">
          <SkeletonLoader
            variant="text"
            lines={1}
            className="skeleton-base h-6 rounded w-1/4"
          />
          <SkeletonLoader
            variant="text"
            lines={1}
            className="skeleton-base h-6 rounded w-10"
          />
        </div>
        <SkeletonLoader
          variant="text"
          lines={1}
          className="skeleton-base h-4 rounded w-full mb-4"
        />

        {/* Task input skeleton */}
        <SkeletonLoader
          variant="rect"
          className="skeleton-base h-12 rounded-lg mb-4"
        />

        {/* Task items skeletons */}
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className="skeleton-base flex items-center justify-between p-3 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <SkeletonLoader
                variant="circle"
                className="skeleton-sub h-5 w-5 rounded"
              />
              <SkeletonLoader
                variant="text"
                lines={1}
                className="skeleton-sub h-5 rounded w-32"
              />
            </div>
            <div className="flex space-x-2">
              <SkeletonLoader
                variant="circle"
                className="skeleton-sub h-5 w-5 rounded"
              />
              <SkeletonLoader
                variant="circle"
                className="skeleton-sub h-5 w-5 rounded"
              />
            </div>
          </div>
        ))}
      </div>
    </SubContainer>
  </div>
);

export default StudentPanelSkeleton;
