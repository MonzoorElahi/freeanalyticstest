"use client";

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className = "", style }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
      style={style}
    />
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="w-12 h-12 rounded-lg" />
        <Skeleton className="w-20 h-6 rounded-full" />
      </div>
      <Skeleton className="w-24 h-4 mb-2" />
      <Skeleton className="w-32 h-8 mb-2" />
      <Skeleton className="w-28 h-3" />
    </div>
  );
}

export function ChartSkeleton() {
  // Fixed heights to avoid hydration mismatch (no Math.random())
  const barHeights = [65, 45, 78, 52, 38, 71, 43, 82, 55, 48, 62, 70];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <Skeleton className="w-48 h-6 mb-6" />
      <div className="h-80 flex items-end justify-between gap-2">
        {barHeights.map((height, i) => (
          <Skeleton
            key={i}
            className="flex-1"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <Skeleton className="w-48 h-6" />
      </div>
      <div className="p-4 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="w-12 h-4" />
            <Skeleton className="flex-1 h-4" />
            <Skeleton className="w-24 h-4" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="w-64 h-8 mb-2" />
          <Skeleton className="w-48 h-4" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="w-32 h-10 rounded-lg" />
          <Skeleton className="w-32 h-10 rounded-lg" />
          <Skeleton className="w-24 h-10 rounded-lg" />
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>

      {/* Secondary metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>

      {/* Charts */}
      <ChartSkeleton />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    </div>
  );
}
