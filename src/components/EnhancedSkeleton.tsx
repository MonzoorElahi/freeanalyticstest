"use client";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
  animation?: "pulse" | "wave" | "none";
}

export function Skeleton({
  className = "",
  variant = "rectangular",
  width,
  height,
  animation = "pulse",
}: SkeletonProps) {
  const baseClasses = "bg-gray-200 dark:bg-gray-700";
  const animationClasses = {
    pulse: "animate-pulse",
    wave: "animate-shimmer",
    none: "",
  };

  const variantClasses = {
    text: "rounded h-4",
    circular: "rounded-full",
    rectangular: "rounded-lg",
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === "number" ? `${width}px` : width;
  if (height) style.height = typeof height === "number" ? `${height}px` : height;

  return (
    <>
      <div
        className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
        style={style}
      />
      {animation === "wave" && (
        <style jsx>{`
          @keyframes shimmer {
            0% {
              background-position: -1000px 0;
            }
            100% {
              background-position: 1000px 0;
            }
          }
          .animate-shimmer {
            animation: shimmer 2s infinite linear;
            background: linear-gradient(
              to right,
              #e5e7eb 4%,
              #f3f4f6 25%,
              #e5e7eb 36%
            );
            background-size: 1000px 100%;
          }
          .dark .animate-shimmer {
            background: linear-gradient(
              to right,
              #374151 4%,
              #4b5563 25%,
              #374151 36%
            );
          }
        `}</style>
      )}
    </>
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-start justify-between mb-4">
        <Skeleton variant="circular" width={48} height={48} />
        <Skeleton width={60} height={24} />
      </div>
      <Skeleton variant="text" className="mb-2" width="40%" />
      <Skeleton variant="text" width="60%" height={32} className="mb-2" />
      <Skeleton variant="text" width="50%" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <Skeleton variant="text" width="40%" height={24} className="mb-6" />
      <div className="space-y-3">
        {[100, 80, 90, 70, 85, 95, 75].map((width, i) => (
          <div key={i} className="flex items-end gap-2">
            <Skeleton width={`${width}%`} height={Math.random() * 100 + 50} />
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-between">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <Skeleton key={i} variant="text" width={40} />
        ))}
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="text" width="70%" />
          ))}
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-6 py-4">
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((j) => (
                <Skeleton key={j} variant="text" width={`${60 + Math.random() * 30}%`} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Skeleton width={200} height={32} />
        <div className="flex gap-3">
          <Skeleton width={100} height={40} />
          <Skeleton width={100} height={40} />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      {/* Table */}
      <TableSkeleton />
    </div>
  );
}
