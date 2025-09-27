"use client";

import { useState } from "react";
import Link from "next/link";
import { GuestSearch } from "@/components/features/checkin/guest-search";
import { CheckinActions } from "@/components/features/checkin/checkin-actions";
import { ErrorState } from "@/components/shared/error-state";
import { GuestData } from "@/types/api";
import { useGuestSoundEffects } from "@/hooks/use-guest-sound-effects";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "motion/react";
import { ArrowLeft, Home, Users } from "lucide-react";

export default function CheckinPage() {
  const [selectedGuest, setSelectedGuest] = useState<GuestData | null>(null);
  const [error, setError] = useState("");
  const { playClick } = useGuestSoundEffects();

  const handleGuestSelect = (guest: GuestData) => {
    setSelectedGuest(guest);
    setError("");
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="mx-auto flex-1 px-4 py-10 md:w-full md:max-w-3xl md:px-6">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex h-full flex-col gap-8"
        >
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Link href="/" onClick={() => playClick()} className="block">
                  <h1 className="text-3xl font-semibold text-slate-900">
                    チェックイン
                  </h1>
                </Link>
                <p className="mt-3 text-sm text-slate-600">
                  お持ちのIDまたはお名前から入退場の手続きを進めます。
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:w-auto sm:flex-row">
                <Link href="/checkout" className="flex-1 sm:flex-none">
                  <Button
                    variant="secondary"
                    className="w-full min-w-[150px] justify-center gap-2 text-slate-700"
                    onClick={() => playClick()}
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden />
                    退場手続き
                  </Button>
                </Link>
                <Link href="/register" className="flex-1 sm:flex-none">
                  <Button
                    className="w-full min-w-[150px] justify-center gap-2 bg-slate-900 hover:bg-slate-800"
                    onClick={() => playClick()}
                  >
                    <Users className="h-4 w-4" aria-hidden />
                    新規登録
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
            className="flex flex-col gap-6"
          >
            <GuestSearch onGuestSelect={handleGuestSelect} />

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <ErrorState message={error} />
              </motion.div>
            )}

            {selectedGuest ? (
              <motion.div
                key={selectedGuest.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <CheckinActions guest={selectedGuest} />
              </motion.div>
            ) : (
              <Card className="border-dashed border-slate-200 bg-white/80 shadow-none">
                <CardContent className="flex items-center gap-3 px-6 py-8 text-slate-600">
                  <Users className="h-5 w-5" aria-hidden />
                  ゲストを検索して選択すると、ここに手続き内容が表示されます。
                </CardContent>
              </Card>
            )}
          </motion.div>

          <div className="flex justify-center pt-2">
            <Link href="/" onClick={() => playClick()}>
              <Button variant="ghost" className="gap-2 text-slate-600">
                <Home className="h-4 w-4" aria-hidden />
                ホームへ戻る
              </Button>
            </Link>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
