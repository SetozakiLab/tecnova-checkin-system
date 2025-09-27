// Common Components: Project Card
// プロジェクト表示用のカードコンポーネント

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserAvatarWithStatus } from "./user-avatar-with-status";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";
import { Clock, User, Calendar } from "lucide-react";
import * as React from "react";

export interface ProjectCardProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string;
  title: string;
  description?: string;
  guests: Array<{
    id: string;
    name: string;
    displayId: number;
    grade?: string | null;
    isActive: boolean;
    checkinAt: Date;
  }>;
  status: "active" | "inactive";
  onViewDetails?: (id: string) => void;
  onQuickAction?: (id: string) => void;
}

export function ProjectCard({
  id,
  title,
  description,
  guests,
  status,
  onViewDetails,
  onQuickAction,
  className,
  ...props
}: ProjectCardProps) {
  const activeGuests = guests.filter((guest) => guest.isActive);
  const totalGuests = guests.length;

  return (
    <Card 
      className={cn("hover:shadow-md transition-shadow", className)}
      data-slot="project-card"
      {...props}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-lg">{title}</CardTitle>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          <StatusBadge status={status}>
            {status === "active" ? "進行中" : "終了"}
          </StatusBadge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Project Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1">
              <User className="h-3 w-3 text-muted-foreground" />
              <span className="text-sm font-medium">{activeGuests.length}</span>
            </div>
            <p className="text-xs text-muted-foreground">現在参加</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span className="text-sm font-medium">{totalGuests}</span>
            </div>
            <p className="text-xs text-muted-foreground">総参加</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-sm font-medium">
                {activeGuests.length > 0 ? "進行中" : "終了"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">状態</p>
          </div>
        </div>

        {/* Active Guests List */}
        {activeGuests.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              現在の参加者 ({activeGuests.length}人)
            </h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {activeGuests.slice(0, 3).map((guest) => (
                <UserAvatarWithStatus
                  key={guest.id}
                  name={guest.name}
                  displayId={guest.displayId}
                  grade={guest.grade}
                  isActive={guest.isActive}
                  size="sm"
                  showStatus={false}
                  className="py-1"
                />
              ))}
              {activeGuests.length > 3 && (
                <p className="text-xs text-muted-foreground pl-11">
                  他 {activeGuests.length - 3} 人...
                </p>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {onViewDetails && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(id)}
              className="flex-1"
            >
              詳細を見る
            </Button>
          )}

          {onQuickAction && status === "active" && (
            <Button
              size="sm"
              onClick={() => onQuickAction(id)}
              className="flex-1"
            >
              管理
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
