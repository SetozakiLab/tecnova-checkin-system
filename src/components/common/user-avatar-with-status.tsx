// Common Components: User Avatar with Status
// ゲスト情報と状態を表示するアバターコンポーネント

import type * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

export interface UserAvatarWithStatusProps
  extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  displayId?: number;
  grade?: string | null;
  isActive?: boolean;
  size?: "sm" | "md" | "lg";
  showStatus?: boolean;
  showGrade?: boolean;
}

export function UserAvatarWithStatus({
  name,
  displayId,
  grade,
  isActive = false,
  size = "md",
  showStatus = true,
  showGrade = true,
  className,
  ...props
}: UserAvatarWithStatusProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getSizeClasses = (size: "sm" | "md" | "lg") => {
    switch (size) {
      case "sm":
        return "w-8 h-8";
      case "md":
        return "w-10 h-10";
      case "lg":
        return "w-12 h-12";
    }
  };

  return (
    <div
      className={cn("flex items-center gap-3", className)}
      data-slot="user-avatar-with-status"
      {...props}
    >
      {/* Avatar with Status Indicator */}
      <div className="relative">
        <Avatar className={getSizeClasses(size)}>
          <AvatarImage src="" alt={name} />
          <AvatarFallback className="bg-primary/10 text-primary font-medium">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>

        {/* Active status indicator */}
        {isActive && (
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success border-2 border-background rounded-full" />
        )}
      </div>

      {/* Guest Information */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium text-sm text-foreground truncate">
            {name}
          </h4>
          {displayId && (
            <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              #{displayId}
            </span>
          )}
        </div>

        {/* Status and Grade Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {showStatus && (
            <StatusBadge status={isActive ? "active" : "inactive"} size="sm">
              {isActive ? "滞在中" : "退場済み"}
            </StatusBadge>
          )}

          {showGrade && grade && (
            <StatusBadge
              status={
                grade.startsWith("ES")
                  ? "info"
                  : grade.startsWith("JH")
                    ? "pending"
                    : "active"
              }
              size="sm"
            >
              {grade}
            </StatusBadge>
          )}
        </div>
      </div>
    </div>
  );
}
