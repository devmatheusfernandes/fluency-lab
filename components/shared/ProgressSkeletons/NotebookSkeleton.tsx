import React from "react";

// Skeleton component for notebook items
const NotebookSkeleton = () => (
  <div className="flex flex-row items-start justify-between rounded-lg overflow-hidden p-4 skeleton-base animate-pulse">
    <div className="flex-1">
      <div className="h-5 skeleton-base rounded w-3/4 mb-2"></div>
      <div className="h-3 skeleton-base rounded w-1/2"></div>
    </div>
    <div className="h-5 w-5 skeleton-base rounded"></div>
  </div>
);

export default NotebookSkeleton;