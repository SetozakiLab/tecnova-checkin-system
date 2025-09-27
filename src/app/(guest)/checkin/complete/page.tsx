"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiResponse, GuestData } from "@/types/api";
import { useGuestSoundEffects } from "@/hooks/use-guest-sound-effects";
import { PageContainer } from "@/components/ui/page-container";
import { FadeIn, ScaleIn, Float } from "@/components/ui/motion";
import { Home, LogIn, LogOut, CheckCircle, AlertTriangle, Clock } from "lucide-react";

function CheckinCompleteContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type"); // 'checkin' or 'checkout'
  const guestId = searchParams.get("guestId");
  const [guest, setGuest] = useState<GuestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successSoundPlayed, setSuccessSoundPlayed] = useState(false);
  const { playClick, playSuccess } = useGuestSoundEffects();

  useEffect(() => {
    const fetchGuest = async () => {
      if (!guestId) {
        setError("ゲスト情報が見つかりません");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/guests/${guestId}`);
        const result: ApiResponse<GuestData> = await response.json();

        if (!result.success) {
          setError("ゲスト情報の取得に失敗しました");
          return;
        }

        setGuest(result.data!);
      } catch (err) {
        console.error("Fetch guest error:", err);
        setError("サーバーエラーが発生しました");
      } finally {
        setLoading(false);
      }
    };

    fetchGuest();
  }, [guestId]);

  useEffect(() => {
    if (!loading && guest && !error && !successSoundPlayed) {
      playSuccess();
      setSuccessSoundPlayed(true);
    }
  }, [guest, loading, error, successSoundPlayed, playSuccess]);

  // 10秒後に自動でホームに戻る
  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <PageContainer gradient="blue">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
          <p className="text-lg text-muted-foreground">読み込み中...</p>
        </div>
      </PageContainer>
    );
  }

  if (error || !guest) {
    return (
      <PageContainer gradient="red">
        <Card className="max-w-md mx-auto border-2 border-red-200/50 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-center gap-2 mb-2">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <CardTitle className="text-center text-red-700">エラー</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">{error}</p>
            <Link href="/">
              <Button variant="outline" onClick={() => playClick()} className="w-full">
                <Home className="h-4 w-4 mr-2" />
                ホームに戻る
              </Button>
            </Link>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  const isCheckin = type === "checkin";
  const gradient = isCheckin ? "green" : "orange";

  return (
    <PageContainer gradient={gradient}>
      <div className="max-w-2xl w-full">
        {/* Success Message */}
        <FadeIn delay={0.1} className="text-center mb-12">
          <Float floatHeight={8} duration={4}>
            <div
              className={`w-24 h-24 ${
                isCheckin 
                  ? "bg-gradient-to-br from-emerald-500 to-green-500" 
                  : "bg-gradient-to-br from-orange-500 to-amber-500"
              } rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl`}
            >
              {isCheckin ? (
                <LogIn className="h-12 w-12 text-white" />
              ) : (
                <LogOut className="h-12 w-12 text-white" />
              )}
            </div>
          </Float>
          
          <h1
            className={`text-4xl md:text-5xl font-bold mb-4 ${
              isCheckin ? "text-emerald-800" : "text-orange-800"
            }`}
          >
            {isCheckin ? "いらっしゃいませ！" : "お疲れ様でした！"}
          </h1>
          <p
            className={`text-2xl font-medium ${
              isCheckin ? "text-emerald-700" : "text-orange-700"
            }`}
          >
            {guest.name} さん
          </p>
        </FadeIn>

        <ScaleIn delay={0.3} className="mb-8">
          <Card className={`border-2 ${
            isCheckin ? "border-emerald-200/50" : "border-orange-200/50"
          } bg-white/80 backdrop-blur-sm shadow-lg`}>
            <CardContent className="pt-8">
              <div className="text-center space-y-6">
                {isCheckin ? (
                  <>
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <CheckCircle className="h-6 w-6 text-emerald-600" />
                      <p className="text-xl text-emerald-800 font-semibold">
                        チェックイン完了！
                      </p>
                    </div>
                    <p className="text-lg text-muted-foreground">
                      今日も楽しく過ごしてくださいね！
                    </p>
                    <div className="bg-gradient-to-r from-emerald-50/80 to-green-50/80 p-6 rounded-lg border border-emerald-200/50 backdrop-blur-sm">
                      <p className="text-emerald-800 leading-relaxed">
                        何か困ったことがあったら、<br />
                        すぐにメンターに相談してください
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <CheckCircle className="h-6 w-6 text-orange-600" />
                      <p className="text-xl text-orange-800 font-semibold">
                        チェックアウト完了！
                      </p>
                    </div>
                    <p className="text-lg text-muted-foreground">
                      今日はありがとうございました！また遊びに来てくださいね！
                    </p>
                    <div className="bg-gradient-to-r from-orange-50/80 to-amber-50/80 p-6 rounded-lg border border-orange-200/50 backdrop-blur-sm">
                      <p className="text-orange-800 leading-relaxed">
                        気をつけて帰ってください。<br />
                        また待っています！
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </ScaleIn>

        {/* Instructions for next time */}
        <ScaleIn delay={0.5} className="mb-8">
          <Card className="border-2 border-blue-200/50 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center space-y-6">
                <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  次回からは簡単！
                </h3>
                <div className="text-left space-y-4 max-w-md mx-auto">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                      1
                    </div>
                    <p className="text-base leading-relaxed pt-1">
                      あなたの番号 <strong className="text-primary">{guest.displayId}</strong> を
                      覚えておいてください
                    </p>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                      2
                    </div>
                    <p className="text-base leading-relaxed pt-1">
                      次回からは番号を入力するだけで大丈夫です
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScaleIn>

        {/* Navigation */}
        <FadeIn delay={0.7} className="flex flex-col sm:flex-row gap-4 mb-8">
          <Link href="/" className="flex-1">
            <Button
              variant="outline"
              size="lg"
              className="w-full border-primary/20 hover:bg-primary/5 transition-all duration-300"
              onClick={() => playClick()}
            >
              <Home className="h-4 w-4 mr-2" />
              ホームに戻る
            </Button>
          </Link>
          {isCheckin && (
            <Link href="/checkout" className="flex-1">
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => playClick()}
              >
                <LogOut className="h-4 w-4 mr-2" />
                チェックアウトする場合
              </Button>
            </Link>
          )}
        </FadeIn>

        {/* Auto redirect message */}
        <FadeIn delay={0.9} className="text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <p>10秒後に自動的にホームに戻ります</p>
          </div>
        </FadeIn>
      </div>
    </PageContainer>
  );
}

function LoadingFallback() {
  return (
    <PageContainer gradient="blue">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
        <p className="text-lg text-muted-foreground">読み込み中...</p>
      </div>
    </PageContainer>
  );
}

export default function CheckinCompletePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CheckinCompleteContent />
    </Suspense>
  );
}
