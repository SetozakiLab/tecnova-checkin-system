// Common Components: Metric Card
// ダッシュボード用の統計表示カード

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import * as React from "react";

export interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  variant?: "default" | "success" | "warning" | "info";
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
  className,
  ...props
}: MetricCardProps) {
  const getVariantStyles = (variant: MetricCardProps["variant"]) => {
    switch (variant) {
      case "success":
        return {
          card: "border-success/20 bg-success/5",
          value: "text-success",
          icon: "text-success",
        };
      case "warning":
        return {
          card: "border-warning/20 bg-warning/5",
          value: "text-warning",
          icon: "text-warning",
        };
      case "info":
        return {
          card: "border-info/20 bg-info/5",
          value: "text-info",
          icon: "text-info",
        };
      default:
        return {
          card: "",
          value: "text-foreground",
          icon: "text-muted-foreground",
        };
    }
  };

  const styles = getVariantStyles(variant);

  return (
    <Card 
      className={cn(styles.card, className)} 
      data-slot="metric-card"
      {...props}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <Icon className={cn("h-4 w-4", styles.icon)} />
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className={cn("text-3xl font-bold", styles.value)}>
            {value}
          </div>
          
          {subtitle && (
            <p className="text-xs text-muted-foreground">
              {subtitle}
            </p>
          )}
          
          {trend && (
            <div className="flex items-center text-xs">
              <span
                className={cn(
                  "font-medium",
                  trend.isPositive !== false ? "text-success" : "text-destructive"
                )}
              >
                {trend.isPositive !== false ? "+" : ""}{trend.value}
              </span>
              <span className="text-muted-foreground ml-1">
                {trend.label}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Pre-configured metric cards for common use cases
export function CurrentGuestsCard({ count }: { count: number }) {
  return (
    <MetricCard
      title="現在の滞在者数"
      value={count}
      subtitle="人"
      variant="success"
    />
  );
}

export function TodayCheckinsCard({ count }: { count: number }) {
  return (
    <MetricCard
      title="今日のチェックイン数"
      value={count}
      subtitle="回"
      variant="info"
    />
  );
}

export function AverageStayTimeCard({ minutes }: { minutes: number }) {
  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}分`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}時間${remainingMinutes}分` : `${hours}時間`;
  };

  return (
    <MetricCard
      title="平均滞在時間"
      value={formatTime(minutes)}
      variant="default"
    />
  );
}