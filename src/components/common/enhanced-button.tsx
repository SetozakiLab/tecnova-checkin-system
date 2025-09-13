import * as React from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { VariantProps } from "class-variance-authority";

interface LoadingButtonProps
  extends React.ComponentProps<typeof Button>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  loadingText?: string;
  loadingIcon?: React.ReactNode;
}

export const LoadingButton = React.forwardRef<
  HTMLButtonElement,
  LoadingButtonProps
>(({ loading = false, loadingText, loadingIcon, children, disabled, className, ...props }, ref) => {
  return (
    <Button
      ref={ref}
      disabled={disabled || loading}
      className={cn(className)}
      {...props}
    >
      {loading && (
        loadingIcon || <Loader2 className="h-4 w-4 animate-spin" />
      )}
      {loading ? (loadingText || "読み込み中...") : children}
    </Button>
  );
});

LoadingButton.displayName = "LoadingButton";

interface ConfirmButtonProps extends LoadingButtonProps {
  confirmMessage?: string;
  onConfirm?: () => void | Promise<void>;
  requireConfirmation?: boolean;
}

export const ConfirmButton = React.forwardRef<
  HTMLButtonElement,
  ConfirmButtonProps
>(({ 
  confirmMessage = "この操作を実行しますか？",
  onConfirm,
  requireConfirmation = true,
  onClick,
  ...props 
}, ref) => {
  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (requireConfirmation) {
      const confirmed = window.confirm(confirmMessage);
      if (!confirmed) {
        return;
      }
    }

    if (onConfirm) {
      await onConfirm();
    }

    if (onClick) {
      onClick(e);
    }
  };

  return (
    <LoadingButton
      ref={ref}
      onClick={handleClick}
      {...props}
    />
  );
});

ConfirmButton.displayName = "ConfirmButton";

interface IconButtonProps extends LoadingButtonProps {
  icon: React.ReactNode;
  label?: string;
  showLabel?: boolean;
}

export const IconButton = React.forwardRef<
  HTMLButtonElement,
  IconButtonProps
>(({ icon, label, showLabel = false, children, ...props }, ref) => {
  return (
    <LoadingButton
      ref={ref}
      size={showLabel ? "default" : "icon"}
      {...props}
    >
      {icon}
      {showLabel && (label || children)}
    </LoadingButton>
  );
});

IconButton.displayName = "IconButton";