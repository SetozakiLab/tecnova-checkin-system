import * as React from "react";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

// Enhanced status badge with indicator dots and semantic status types
const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium transition-colors rounded-md border",
  {
    variants: {
      status: {
        active: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800",
        inactive: "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800",
        pending: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800",
        error: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800",
        info: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
      },
      size: {
        sm: "px-1.5 py-0.5 text-xs gap-1",
        md: "px-2 py-1 text-xs gap-1.5",
        lg: "px-3 py-1.5 text-sm gap-2",
      },
    },
    defaultVariants: {
      status: "inactive",
      size: "md",
    },
  }
);

export interface StatusBadgeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children">,
    VariantProps<typeof statusBadgeVariants> {
  status: "active" | "inactive" | "pending" | "error" | "info";
  children: React.ReactNode;
  showIndicator?: boolean;
}

export function StatusBadge({
  className,
  status,
  size,
  children,
  showIndicator = true,
  ...props
}: StatusBadgeProps) {
  return (
    <div
      className={cn(statusBadgeVariants({ status, size }), className)}
      {...props}
    >
      {showIndicator && (
        <div
          className={cn(
            "w-1.5 h-1.5 rounded-full flex-shrink-0",
            status === "active" && "bg-green-500",
            status === "inactive" && "bg-gray-400",
            status === "pending" && "bg-yellow-500",
            status === "error" && "bg-red-500",
            status === "info" && "bg-blue-500"
          )}
        />
      )}
      {children}
    </div>
  );
}

// Legacy compatible component for gradual migration
export interface LegacyStatusBadgeProps {
  isActive: boolean;
  activeText?: string;
  inactiveText?: string;
  className?: string;
}

export function LegacyStatusBadge({
  isActive,
  activeText = "滞在中",
  inactiveText = "退場済み",
  className,
}: LegacyStatusBadgeProps) {
  return (
    <StatusBadge 
      status={isActive ? "active" : "inactive"} 
      className={className}
      showIndicator={false}
    >
      {isActive ? activeText : inactiveText}
    </StatusBadge>
  );
}

// Specific status badges for the application
export function CheckinStatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <StatusBadge status={isActive ? "active" : "inactive"}>
      {isActive ? "チェックイン中" : "チェックアウト済み"}
    </StatusBadge>
  );
}

export function GradeStatusBadge({ grade }: { grade?: string | null }) {
  if (!grade) {
    return (
      <StatusBadge status="inactive" size="sm" showIndicator={false}>
        学年未設定
      </StatusBadge>
    );
  }

  // 学年レベルに応じてスタイルを変更
  const getGradeStatus = (grade: string): "info" | "pending" | "active" => {
    if (grade.startsWith("ES")) return "info"; // 小学生
    if (grade.startsWith("JH")) return "pending"; // 中学生
    return "active"; // 高校生
  };

  return (
    <StatusBadge status={getGradeStatus(grade)} size="sm" showIndicator={false}>
      {grade}
    </StatusBadge>
  );
}