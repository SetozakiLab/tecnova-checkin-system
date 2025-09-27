import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils"; 
import * as React from "react";

export interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingState({
  message = "読み込み中...",
  size = "lg",
  className,
  ...props
}: LoadingStateProps) {
  const skeletonSizes = {
    sm: "h-8",
    md: "h-16",
    lg: "h-24",
  };

  return (
    <div 
      className={cn("text-center py-12", className)}
      data-slot="loading-state"
      {...props}
    >
      <div className="flex flex-col items-center space-y-4">
        <Skeleton
          className={`w-24 ${skeletonSizes[size]} rounded-full mx-auto`}
        />
        <Skeleton className="h-4 w-32" />
        {message && (
          <p className="text-lg text-muted-foreground mt-2">{message}</p>
        )}
      </div>
    </div>
  );
}

// Dashboard用のスケルトンコンポーネント
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* 統計カード用のスケルトン */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-6 rounded-lg border">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>

      {/* テーブル用のスケルトン */}
      <div className="rounded-lg border">
        <div className="p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ゲストテーブル用のスケルトンコンポーネント
export function GuestsTableSkeleton() {
  return (
    <div className="rounded-lg border">
      <div className="p-6">
        <Skeleton className="h-6 w-40 mb-6" />
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
              <div className="flex space-x-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
