import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import * as React from "react";

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({
  message,
  onRetry,
  className,
  ...props
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "bg-red-50 border border-red-200 rounded-lg p-6",
        className
      )}
      data-slot="error-state"
      {...props}
    >
      <p className="text-red-700 mb-4">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          再試行
        </Button>
      )}
    </div>
  );
}
