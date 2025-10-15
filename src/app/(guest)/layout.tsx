"use client";

import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { GuestHeader } from "@/components/features";

type GuestLayoutProps = {
  children: ReactNode;
};

export default function GuestLayout({ children }: GuestLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-[100dvh] flex-col bg-slate-100 text-slate-900">
      <GuestHeader />
      <AnimatePresence initial={false} mode="wait">
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex flex-1 flex-col"
        >
          {children}
        </motion.main>
      </AnimatePresence>
    </div>
  );
}
