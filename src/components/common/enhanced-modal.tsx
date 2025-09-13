import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "./enhanced-button";
import { AlertTriangle, CheckCircle, XCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface BaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function BaseModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: BaseModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-md", className)}>
        {title && (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}
        {children}
      </DialogContent>
    </Dialog>
  );
}

interface ConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  variant?: "default" | "destructive" | "warning";
  loading?: boolean;
}

export function ConfirmModal({
  open,
  onOpenChange,
  title = "確認",
  description = "この操作を実行しますか？",
  confirmText = "実行",
  cancelText = "キャンセル",
  onConfirm,
  onCancel,
  variant = "default",
  loading = false,
}: ConfirmModalProps) {
  const icons = {
    default: <Info className="h-5 w-5 text-blue-500" />,
    destructive: <XCircle className="h-5 w-5 text-destructive" />,
    warning: <AlertTriangle className="h-5 w-5 text-orange-500" />,
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    onOpenChange(false);
  };

  const handleConfirm = async () => {
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error("Confirm action failed:", error);
    }
  };

  return (
    <BaseModal 
      open={open} 
      onOpenChange={onOpenChange}
      className="sm:max-w-lg"
    >
      <div className="flex items-start gap-4">
        {icons[variant]}
        <div className="flex-1">
          <DialogHeader className="text-left">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription className="mt-2">
              {description}
            </DialogDescription>
          </DialogHeader>
        </div>
      </div>
      
      <DialogFooter className="flex gap-2 mt-6">
        <Button
          variant="outline"
          onClick={handleCancel}
          disabled={loading}
        >
          {cancelText}
        </Button>
        <LoadingButton
          variant={variant === "destructive" ? "destructive" : "default"}
          onClick={handleConfirm}
          loading={loading}
        >
          {confirmText}
        </LoadingButton>
      </DialogFooter>
    </BaseModal>
  );
}

interface FormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  onSubmit: (e: React.FormEvent) => void | Promise<void>;
  submitText?: string;
  cancelText?: string;
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FormModal({
  open,
  onOpenChange,
  title,
  description,
  onSubmit,
  submitText = "保存",
  cancelText = "キャンセル",
  loading = false,
  children,
  className,
}: FormModalProps) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(e);
    } catch (error) {
      console.error("Form submission failed:", error);
    }
  };

  return (
    <BaseModal 
      open={open} 
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      className={className}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {children}
        
        <DialogFooter className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <LoadingButton
            type="submit"
            loading={loading}
          >
            {submitText}
          </LoadingButton>
        </DialogFooter>
      </form>
    </BaseModal>
  );
}

interface AlertModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  variant?: "success" | "error" | "warning" | "info";
  buttonText?: string;
}

export function AlertModal({
  open,
  onOpenChange,
  title,
  message,
  variant = "info",
  buttonText = "OK",
}: AlertModalProps) {
  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <XCircle className="h-5 w-5 text-destructive" />,
    warning: <AlertTriangle className="h-5 w-5 text-orange-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
  };

  return (
    <BaseModal open={open} onOpenChange={onOpenChange}>
      <div className="flex items-start gap-4">
        {icons[variant]}
        <div className="flex-1">
          <DialogHeader className="text-left">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription className="mt-2">
              {message}
            </DialogDescription>
          </DialogHeader>
        </div>
      </div>
      
      <DialogFooter className="mt-6">
        <Button onClick={() => onOpenChange(false)}>
          {buttonText}
        </Button>
      </DialogFooter>
    </BaseModal>
  );
}