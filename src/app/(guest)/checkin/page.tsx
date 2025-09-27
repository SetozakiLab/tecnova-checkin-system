"use client";

import { useState } from "react";
import Link from "next/link";
import { GuestSearch } from "@/components/features/checkin/guest-search";
import { CheckinActions } from "@/components/features/checkin/checkin-actions";
import { ErrorState } from "@/components/shared/error-state";
import { GuestData } from "@/types/api";
import { useGuestSoundEffects } from "@/hooks/use-guest-sound-effects";
import { PageContainer } from "@/components/ui/page-container";
import { FadeIn, SlideInLeft, ScaleIn } from "@/components/ui/motion";
import { ArrowLeft, UserCheck } from "lucide-react";

export default function CheckinPage() {
  const [selectedGuest, setSelectedGuest] = useState<GuestData | null>(null);
  const [error, setError] = useState("");
  const { playClick } = useGuestSoundEffects();

  const handleGuestSelect = (guest: GuestData) => {
    setSelectedGuest(guest);
    setError("");
  };

  return (
    <PageContainer gradient="blue">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <FadeIn delay={0.1} className="text-center mb-12">
          <Link
            href="/"
            className="inline-block mb-8 group transition-all duration-300 hover:scale-105"
            onClick={() => playClick()}
          >
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">
              tec-nova
            </h1>
            <p className="text-lg text-muted-foreground">入退場管理システム</p>
          </Link>
          
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center">
              <UserCheck className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">入退場手続き</h2>
          </div>
          <p className="text-muted-foreground">お名前を検索してチェックインしてください</p>
        </FadeIn>

        <div className="space-y-8">
          <SlideInLeft delay={0.3}>
            <GuestSearch onGuestSelect={handleGuestSelect} />
          </SlideInLeft>

          {error && (
            <ScaleIn delay={0.1}>
              <ErrorState message={error} />
            </ScaleIn>
          )}

          {selectedGuest && (
            <ScaleIn delay={0.2}>
              <CheckinActions guest={selectedGuest} />
            </ScaleIn>
          )}
        </div>

        {/* Footer */}
        <FadeIn delay={0.6} className="text-center mt-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
            onClick={() => playClick()}
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            トップページに戻る
          </Link>
        </FadeIn>
      </div>
    </PageContainer>
  );
}
