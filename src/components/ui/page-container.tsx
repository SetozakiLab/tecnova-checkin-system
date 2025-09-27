"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  gradient?: "blue" | "green" | "purple" | "orange" | "red" | "indigo";
  fullHeight?: boolean;
}

const gradientMap = {
  blue: "bg-gradient-to-br from-blue-50/80 via-indigo-50/60 to-cyan-50/80",
  green: "bg-gradient-to-br from-emerald-50/80 via-green-50/60 to-teal-50/80", 
  purple: "bg-gradient-to-br from-purple-50/80 via-violet-50/60 to-indigo-50/80",
  orange: "bg-gradient-to-br from-orange-50/80 via-amber-50/60 to-yellow-50/80",
  red: "bg-gradient-to-br from-rose-50/80 via-pink-50/60 to-red-50/80",
  indigo: "bg-gradient-to-br from-indigo-50/80 via-blue-50/60 to-slate-50/80",
};

export function PageContainer({ 
  children, 
  className, 
  gradient = "blue", 
  fullHeight = true 
}: PageContainerProps) {
  return (
    <div 
      className={cn(
        "flex items-center justify-center p-4 relative overflow-hidden",
        fullHeight ? "h-dvh min-h-screen" : "min-h-screen",
        gradientMap[gradient],
        className
      )}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/3 rounded-full blur-2xl animate-pulse delay-1000" />
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-accent/10 rounded-full blur-xl animate-pulse delay-500" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl">
        {children}
      </div>
    </div>
  );
}