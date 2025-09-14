"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

interface SelectProps {
  value: string;
  onValueChange: (val: string) => void;
  children: React.ReactNode;
}

export function Select({ value, onValueChange, children }: SelectProps) {
  return (
    <div className="relative">
      {React.Children.map(children, (child) => child)}
    </div>
  );
}

export function SelectTrigger({ children }: { children: React.ReactNode }) {
  return (
    <div className={cn("h-9 px-3 flex items-center justify-between rounded-md border cursor-pointer text-sm")}>{children}</div>
  );
}

export function SelectValue() {
  return <span className="text-sm" />;
}

export function SelectContent({ children }: { children: React.ReactNode }) {
  return <div className="mt-2 border rounded-md p-1 bg-background shadow-md space-y-1">{children}</div>;
}

export function SelectItem({ value, children }: { value: string; children: React.ReactNode }) {
  return (
    <div data-value={value} className="px-2 py-1 rounded hover:bg-accent cursor-pointer text-sm">
      {children}
    </div>
  );
}
