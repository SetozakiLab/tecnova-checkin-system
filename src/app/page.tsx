"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { useGuestSoundEffects } from "@/hooks/use-guest-sound-effects";
import { PageContainer } from "@/components/ui/page-container";
import { FadeIn, Stagger, StaggerItem, HoverLift } from "@/components/ui/motion";
import { UserPlus, LogIn, LogOut, Shield } from "lucide-react";

export default function HomePage() {
  const { playClick } = useGuestSoundEffects();

  return (
    <PageContainer gradient="blue" className="relative">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <FadeIn delay={0.1} className="text-center mb-16">
          <div className="relative">
            <Image
              src="/logo.png"
              alt="Tec-nova ロゴ"
              width={480}
              height={192}
              className="mx-auto mb-6 bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20"
              priority
            />
            <div className="space-y-3">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                入退場管理システム
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                施設利用のチェックイン・チェックアウトを<br className="hidden sm:block" />
                シンプル・安全・確実に管理
              </p>
            </div>
          </div>
        </FadeIn>

        {/* Main Menu */}
        <Stagger staggerDelay={0.15} className="grid md:grid-cols-3 gap-6 md:gap-8 mb-16">
          {/* First-time users */}
          <StaggerItem>
            <HoverLift>
              <Card className="h-full border-2 border-emerald-200/50 bg-white/80 backdrop-blur-sm hover:border-emerald-300/60 hover:shadow-xl transition-all duration-300 group">
                <Link href="/terms" onClick={() => playClick()}>
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <UserPlus className="h-8 w-8 text-emerald-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-emerald-800 group-hover:text-emerald-700 transition-colors">
                      初回利用の方
                    </CardTitle>
                    <CardDescription className="text-lg text-emerald-600">
                      利用規約の確認
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center space-y-4">
                    <p className="text-muted-foreground leading-relaxed">
                      初回の方は、利用規約を確認してから<br />
                      新規登録をお願いします
                    </p>
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8"
                      onClick={() => playClick()}
                    >
                      規約を確認する
                    </Button>
                  </CardContent>
                </Link>
              </Card>
            </HoverLift>
          </StaggerItem>

          {/* Check-in */}
          <StaggerItem>
            <HoverLift>
              <Card className="h-full border-2 border-blue-200/50 bg-white/80 backdrop-blur-sm hover:border-blue-300/60 hover:shadow-xl transition-all duration-300 group">
                <Link href="/checkin" onClick={() => playClick()}>
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <LogIn className="h-8 w-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-blue-800 group-hover:text-blue-700 transition-colors">
                      チェックイン
                    </CardTitle>
                    <CardDescription className="text-lg text-blue-600">
                      入場手続き
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center space-y-4">
                    <p className="text-muted-foreground leading-relaxed">
                      2回目以降の方は、こちらから<br />
                      入場手続きをしてください
                    </p>
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8"
                      onClick={() => playClick()}
                    >
                      チェックイン
                    </Button>
                  </CardContent>
                </Link>
              </Card>
            </HoverLift>
          </StaggerItem>

          {/* Check-out */}
          <StaggerItem>
            <HoverLift>
              <Card className="h-full border-2 border-orange-200/50 bg-white/80 backdrop-blur-sm hover:border-orange-300/60 hover:shadow-xl transition-all duration-300 group">
                <Link href="/checkout" onClick={() => playClick()}>
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <LogOut className="h-8 w-8 text-orange-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-orange-800 group-hover:text-orange-700 transition-colors">
                      チェックアウト
                    </CardTitle>
                    <CardDescription className="text-lg text-orange-600">
                      退場手続き
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center space-y-4">
                    <p className="text-muted-foreground leading-relaxed">
                      お帰りの方は、こちらから<br />
                      退場手続きをしてください
                    </p>
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8"
                      onClick={() => playClick()}
                    >
                      チェックアウト
                    </Button>
                  </CardContent>
                </Link>
              </Card>
            </HoverLift>
          </StaggerItem>
        </Stagger>

        {/* Admin Login */}
        <FadeIn delay={0.8} className="text-center">
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
            onClick={() => playClick()}
          >
            <Shield className="h-4 w-4 group-hover:text-primary transition-colors" />
            管理者ログイン
          </Link>
        </FadeIn>
      </div>
    </PageContainer>
  );
}
