// Common Components: Status Badge
// アプリケーション固有のステータス表示バッジ

import React, { type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium transition-colors",
  {
    variants: {
      status: {
        active: "bg-success/10 text-success border-success/20",
        inactive: "bg-muted text-muted-foreground border-border",
        pending: "bg-warning/10 text-warning border-warning/20",
        error: "bg-destructive/10 text-destructive border-destructive/20",
        info: "bg-info/10 text-info border-info/20",
      },
      size: {
        sm: "px-1.5 py-0.5 text-xs",
        md: "px-2 py-1 text-xs",
        lg: "px-3 py-1.5 text-sm",
      },
    },
    defaultVariants: {
      status: "inactive",
      size: "md",
    },
  }
);

export interface StatusBadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusBadgeVariants> {
  status: "active" | "inactive" | "pending" | "error" | "info";
  children: ReactNode;
}

export function StatusBadge({
  className,
  status,
  size,
  children,
  ...props
}: StatusBadgeProps) {
  return (
    <div
      className={cn(statusBadgeVariants({ status, size }), className)}
      {...props}
    >
      {/* Status indicator dot */}
      <div
        className={cn(
          "w-1.5 h-1.5 rounded-full",
          status === "active" && "bg-success",
          status === "inactive" && "bg-muted-foreground",
          status === "pending" && "bg-warning",
          status === "error" && "bg-destructive",
          status === "info" && "bg-info"
        )}
      />
      {children}
    </div>
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
      <StatusBadge status="inactive" size="sm">
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
    <StatusBadge status={getGradeStatus(grade)} size="sm">
      {grade}
    </StatusBadge>
  );
}
