import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { LoadingButton } from "./enhanced-button";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  loading?: boolean;
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  loading = false,
  className,
}: StatCardProps) {
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-5 w-5 rounded" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-3 w-24" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className={cn(
            "flex items-center text-xs mt-2",
            trend.isPositive ? "text-green-600" : "text-red-600"
          )}>
            <span className="font-medium">
              {trend.isPositive ? "+" : ""}{trend.value}%
            </span>
            <span className="text-muted-foreground ml-1">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ActionCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  loading?: boolean;
  error?: string;
  className?: string;
}

export function ActionCard({
  title,
  description,
  children,
  actions,
  loading = false,
  error,
  className,
}: ActionCardProps) {
  return (
    <Card className={cn(error && "border-destructive bg-destructive/5", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-destructive text-sm">{error}</div>
        ) : loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

interface ListCardProps {
  title: string;
  description?: string;
  items: Array<{
    id: string;
    title: string;
    subtitle?: string;
    content?: React.ReactNode;
    actions?: React.ReactNode;
  }>;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  loading?: boolean;
  error?: string;
  className?: string;
}

export function ListCard({
  title,
  description,
  items,
  emptyMessage = "アイテムがありません",
  emptyIcon,
  loading = false,
  error,
  className,
}: ListCardProps) {
  if (loading) {
    return (
      <ActionCard title={title} description={description} loading={true} className={className}>
        <div />
      </ActionCard>
    );
  }

  if (error) {
    return (
      <ActionCard title={title} description={description} error={error} className={className}>
        <div />
      </ActionCard>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {emptyIcon && <div className="mb-2 flex justify-center">{emptyIcon}</div>}
            <p>{emptyMessage}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex-1">
                  <h4 className="font-medium">{item.title}</h4>
                  {item.subtitle && (
                    <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                  )}
                  {item.content && <div className="mt-2">{item.content}</div>}
                </div>
                {item.actions && (
                  <div className="flex gap-2 ml-4">{item.actions}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface FormCardProps {
  title: string;
  description?: string;
  onSubmit: (e: React.FormEvent) => void | Promise<void>;
  submitText?: string;
  children: React.ReactNode;
  loading?: boolean;
  error?: string;
  className?: string;
}

export function FormCard({
  title,
  description,
  onSubmit,
  submitText = "保存",
  children,
  loading = false,
  error,
  className,
}: FormCardProps) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(e);
    } catch (error) {
      console.error("Form submission failed:", error);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="text-destructive text-sm bg-destructive/5 border border-destructive/20 rounded p-3">
              {error}
            </div>
          )}
          {children}
        </CardContent>
        <CardFooter>
          <LoadingButton type="submit" loading={loading}>
            {submitText}
          </LoadingButton>
        </CardFooter>
      </form>
    </Card>
  );
}