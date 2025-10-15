"use client";

import { ArrowUpRight, DoorClosed, DoorOpen, UserPlus } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useGuestSoundEffects } from "@/hooks/use-guest-sound-effects";
import { cn } from "@/lib/utils";

export default function GuestHomePage() {
  const { playClick } = useGuestSoundEffects();

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mx-auto flex w-full flex-1 flex-col gap-10 px-4 py-10 md:max-w-5xl md:px-6"
    >
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="flex flex-col gap-6 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <Badge variant="info" className="w-fit text-slate-600">
              はじめに
            </Badge>
            <div className="space-y-1">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                テクノバ ながさき へようこそ
              </h1>
              <CardDescription className="text-base text-slate-600">
                下のメニューから操作を選んで、手続きを行ってください。
              </CardDescription>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        {[
          {
            title: "はじめての方",
            description: "利用前に必ず規約をご確認ください。",
            href: "/terms",
            icon: UserPlus,
            iconWrapperClass: "border-blue-200 bg-blue-50 text-blue-700",
            buttonLabel: "利用規約を見る",
          },
          {
            title: "チェックイン",
            description: "施設に入場するときはこちら。",
            href: "/checkin",
            icon: DoorOpen,
            iconWrapperClass:
              "border-emerald-200 bg-emerald-50 text-emerald-700",
            buttonLabel: "入場手続きを行う",
          },
          {
            title: "チェックアウト",
            description: "お帰りの際はこちらから。",
            href: "/checkout",
            icon: DoorClosed,
            iconWrapperClass: "border-amber-200 bg-amber-50 text-amber-700",
            buttonLabel: "退場手続きを行う",
          },
        ].map(
          (
            {
              title,
              description,
              href,
              icon: Icon,
              iconWrapperClass,
              buttonLabel,
            },
            index,
          ) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.05 * index,
                duration: 0.3,
                ease: "easeOut",
              }}
            >
              <Link
                href={href}
                onClick={() => playClick()}
                className="group block h-full"
              >
                <Card className="flex h-full flex-col border-slate-200 shadow-sm transition-all duration-200 ease-out group-hover:-translate-y-1 group-hover:shadow-md">
                  <CardHeader className="space-y-4">
                    <div
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-lg border",
                        iconWrapperClass,
                      )}
                    >
                      <Icon className="h-5 w-5" aria-hidden />
                    </div>
                    <div className="space-y-2">
                      <CardTitle className="text-xl font-semibold text-slate-900">
                        {title}
                      </CardTitle>
                      <CardDescription className="text-sm text-slate-600">
                        {description}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="mt-auto space-y-4">
                    <Separator className="bg-slate-200" />
                    <Button
                      tabIndex={-1}
                      className="w-full justify-center gap-2 bg-slate-900 text-white group-hover:bg-slate-800"
                    >
                      {buttonLabel}
                      <ArrowUpRight className="h-4 w-4" aria-hidden />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ),
        )}
      </div>

      <div className="flex justify-center">
        <p className="text-xs text-slate-500">
          ゲスト専用ポータル - テクノバ管理システム
        </p>
      </div>
    </motion.section>
  );
}
