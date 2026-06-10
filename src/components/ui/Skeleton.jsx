import React from 'react';

export function Skeleton({ className = '' }) {
  return (
    <div className={`bg-surface-elevated animate-pulse rounded ${className}`} />
  );
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2.5 ${className}`}>
      {Array(lines)
        .fill(0)
        .map((_, idx) => (
          <Skeleton
            key={idx}
            className={`h-4 ${
              idx === lines - 1 && lines > 1 ? 'w-2/3' : 'w-full'
            }`}
          />
        ))}
    </div>
  );
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`glass-card p-6 space-y-4 ${className}`}>
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-xl" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <SkeletonText lines={2} />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4, className = '' }) {
  return (
    <div className={`glass-card overflow-hidden ${className}`}>
      <div className="px-6 py-4 border-b border-border bg-surface-card flex space-x-4">
        {Array(cols)
          .fill(0)
          .map((_, idx) => (
            <Skeleton key={idx} className="h-5 flex-1" />
          ))}
      </div>
      <div className="divide-y divide-border px-6 py-2">
        {Array(rows)
          .fill(0)
          .map((_, rIdx) => (
            <div key={rIdx} className="py-4.5 flex space-x-4">
              {Array(cols)
                .fill(0)
                .map((_, cIdx) => (
                  <Skeleton
                    key={cIdx}
                    className={`h-4 flex-1 ${
                      cIdx === 0 ? 'w-1/4' : 'w-full'
                    }`}
                  />
                ))}
            </div>
          ))}
      </div>
    </div>
  );
}

export function SkeletonStat({ className = '' }) {
  return (
    <div className={`glass-card p-6 flex flex-col justify-between h-32 ${className}`}>
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-8 w-2/3 mt-2" />
        </div>
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
      <Skeleton className="h-3 w-1/3 mt-4" />
    </div>
  );
}
