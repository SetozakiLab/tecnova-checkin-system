import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  message,
  onRetry,
  className = "",
}: ErrorStateProps) {
  return (
    <div
      className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}
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
