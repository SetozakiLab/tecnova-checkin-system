"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiResponse, GuestData } from "@/types/api";
import { PageContainer } from "@/components/ui/page-container";
import { FadeIn, ScaleIn, Float } from "@/components/ui/motion";
import { CheckCircle, Home, LogIn, AlertTriangle, User, CreditCard } from "lucide-react";

function RegisterCompleteContent() {
  const searchParams = useSearchParams();
  const guestId = searchParams.get("guestId");
  const [guest, setGuest] = useState<GuestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  if (loading) {
    return (
      <PageContainer gradient="green">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-600 border-t-transparent mx-auto mb-6"></div>
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
              <Button variant="outline" className="w-full">
                <Home className="h-4 w-4 mr-2" />
                ホームに戻る
              </Button>
            </Link>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer gradient="green">
      <div className="max-w-2xl w-full">
        {/* Success Message */}
        <FadeIn delay={0.1} className="text-center mb-12">
          <Float floatHeight={8} duration={4}>
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
          </Float>
          
          <h1 className="text-4xl md:text-5xl font-bold text-emerald-800 mb-4">登録完了！</h1>
          <p className="text-xl text-emerald-700">登録が完了しました</p>
        </FadeIn>

        {/* User Information */}
        <ScaleIn delay={0.3} className="mb-8">
          <Card className="border-2 border-emerald-200/50 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-center gap-2">
                <User className="h-5 w-5 text-emerald-600" />
                <CardTitle className="text-center">あなたの情報</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 p-6 rounded-lg border-2 border-blue-200/50 backdrop-blur-sm">
                <div className="text-center space-y-3">
                  <div className="flex items-center justify-center gap-2">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    <p className="text-sm text-blue-700 font-medium">あなたの番号</p>
                  </div>
                  <p className="text-4xl font-bold text-blue-800">
                    {guest.displayId}
                  </p>
                  <p className="text-sm text-blue-700 font-medium">
                    この番号を覚えておいてください！
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 bg-gradient-to-r from-emerald-50/50 to-green-50/50 rounded-lg border border-emerald-200/30">
                  <p className="text-sm text-muted-foreground mb-1">お名前</p>
                  <p className="text-xl font-semibold text-foreground">{guest.name}</p>
                </div>
                {guest.contact && (
                  <div className="p-4 bg-gradient-to-r from-emerald-50/50 to-green-50/50 rounded-lg border border-emerald-200/30">
                    <p className="text-sm text-muted-foreground mb-1">メールアドレス</p>
                    <p className="text-xl text-foreground">{guest.contact}</p>
                  </div>
                )}
              </div>
            </CardContent>

          </Card>
        </ScaleIn>

        {/* Instructions */}
        <ScaleIn delay={0.5} className="mb-8">
          <Card className="border-2 border-blue-200/50 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="pt-6">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-center flex items-center justify-center gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  次は何をすればいいの？
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                      1
                    </div>
                    <p className="text-base leading-relaxed pt-1">
                      入退場画面であなたの番号または名前を入力してください
                    </p>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                      2
                    </div>
                    <p className="text-base leading-relaxed pt-1">
                      「チェックイン」ボタンを押して入場の手続きをしてください
                    </p>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                      3
                    </div>
                    <p className="text-base leading-relaxed pt-1">
                      帰る時は「チェックアウト」ボタンを押すのを忘れずに！
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScaleIn>

        {/* Navigation */}
        <FadeIn delay={0.7} className="flex flex-col sm:flex-row gap-4">
          <Link href="/" className="flex-1">
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full border-primary/20 hover:bg-primary/5 transition-all duration-300"
            >
              <Home className="h-4 w-4 mr-2" />
              ホームに戻る
            </Button>
          </Link>
          <Link href="/checkin" className="flex-1">
            <Button 
              size="lg" 
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <LogIn className="h-4 w-4 mr-2" />
              今すぐチェックイン
            </Button>
          </Link>
        </FadeIn>
      </div>
    </PageContainer>
  );
}

function LoadingFallback() {
  return (
    <PageContainer gradient="green">
      <Card className="w-full max-w-md mx-auto border-2 border-emerald-200/50 bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader className="text-center">
          <Skeleton className="h-8 w-48 mx-auto mb-2" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <Skeleton className="h-24 w-24 rounded-full mx-auto" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-40 mx-auto" />
              <Skeleton className="h-4 w-32 mx-auto" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Skeleton className="h-4 w-16 mb-1" />
                <Skeleton className="h-6 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className="h-6 w-full" />
              </div>
            </div>
            <div>
              <Skeleton className="h-4 w-12 mb-1" />
              <Skeleton className="h-6 w-full" />
            </div>
          </div>
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    </PageContainer>
  );
}

export default function RegisterCompletePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <RegisterCompleteContent />
    </Suspense>
  );
}
