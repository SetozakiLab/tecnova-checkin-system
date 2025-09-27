"use client";

import Image from "next/image";
import Link from "next/link";
import { Home, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useGuestSoundEffects } from "@/hooks/use-guest-sound-effects";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export function GuestHeader() {
  const { playClick } = useGuestSoundEffects();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 md:flex-row md:items-center md:justify-between md:px-6">
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <Link href="/" onClick={() => playClick()}>
              <Image
                src="/images/logo_tecnova.png"
                alt="テクノバ ロゴ"
                width={80}
                height={24}
                priority
                className="h-10 w-auto cursor-pointer"
              />
            </Link>
          </div>
          <Separator
            orientation="horizontal"
            className="h-px w-full bg-slate-200 md:hidden"
          />
          <Separator
            orientation="vertical"
            className="hidden h-12 w-px bg-slate-200 md:block"
          />
          <div className="flex flex-col gap-2 md:items-end">
            <p className="text-xs font-medium text-slate-500 md:text-sm ">
              <Badge variant="info" className="mr-2">
                共同実証事業
              </Badge>
              長崎市 DX推進課 × 長崎大学 瀬戸崎研究室
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild variant="outline" className="gap-2">
            <Link href="/" onClick={() => playClick()}>
              <Home className="h-4 w-4" aria-hidden />
              ホームへ戻る
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link href="/admin/login" onClick={() => playClick()}>
              <ShieldCheck className="h-4 w-4" aria-hidden />
              管理コンソール
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
