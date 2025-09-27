"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useGuestSoundEffects } from "@/hooks/use-guest-sound-effects";
import { PageContainer } from "@/components/ui/page-container";
import { FadeIn, SlideInLeft, ScaleIn } from "@/components/ui/motion";
import { ArrowLeft, FileText, CheckCircle, AlertTriangle, Info } from "lucide-react";

export default function TermsPage() {
  const router = useRouter();
  const [acceptTerms, setAcceptTerms] = useState(false);
  const { playClick, playSuccess } = useGuestSoundEffects();

  const handleProceedToRegister = () => {
    playClick();
    if (acceptTerms) {
      playSuccess();
      router.push("/register?agreed=true");
    }
  };
  
  return (
    <PageContainer gradient="green" fullHeight={false}>
      <div className="max-w-4xl mx-auto">
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
          </Link>
          
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-50 rounded-full flex items-center justify-center">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">利用規約</h2>
          </div>
          <p className="text-lg text-muted-foreground">施設利用に関する約束事</p>
        </FadeIn>

        <SlideInLeft delay={0.3} className="space-y-8">
          <Card className="border-2 border-green-200/50 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Badge variant="destructive" className="bg-gradient-to-r from-red-600 to-red-500">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  重要
                </Badge>
                <CardTitle className="text-xl">参加にあたって</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="border-blue-200/50 bg-gradient-to-r from-blue-50/80 to-cyan-50/80 backdrop-blur-sm">
                <Info className="h-4 w-4" />
                <AlertTitle className="text-blue-800">
                  テクノバの決まりごと
                </AlertTitle>
                <AlertDescription className="text-blue-700">
                  みんなで楽しく安全に利用するための基本的なルールです。
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <ol className="list-decimal list-inside space-y-4 text-foreground">
                  <li className="leading-relaxed text-base">
                    <strong>機材はゆずり合って大切に使い</strong>
                    、使ったものは元の場所に片付けましょう。
                  </li>
                  <li className="leading-relaxed text-base">
                    ほかの人の作るものを大切にして、
                    <strong>お互いのことを尊重</strong>しましょう。
                  </li>
                  <li className="leading-relaxed text-base">
                    ほかの人の作業をじゃましたり、
                    <strong>ばかにしたりしない</strong>ようにしましょう。
                  </li>
                  <li className="leading-relaxed text-base">
                    <strong>
                      人を傷つける、差別する、怒らせるようなことはやめ
                    </strong>
                    ましょう。
                  </li>
                  <li className="leading-relaxed text-base">
                    <strong>ケンカはやめ</strong>
                    ましょう。自分たちで解決できない問題が起こったら、
                    <strong>大人に相談</strong>しましょう。
                  </li>
                  <li className="leading-relaxed text-base">
                    何かをダウンロードまたはアップロードするときは、
                    <strong>かならずスタッフに聞き</strong>ましょう。
                  </li>
                  <li className="leading-relaxed text-base">
                    <strong>ケガにつながる機材</strong>
                    もあるので、スタッフの注意を聞いて<strong>安全に使い</strong>
                    ましょう。
                  </li>
                </ol>
              </div>

              <Separator className="my-8 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

              <Alert className="border-amber-200/50 bg-gradient-to-r from-amber-50/80 to-orange-50/80 backdrop-blur-sm">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle className="text-amber-800">
                  守ってほしいこと
                </AlertTitle>
                <AlertDescription className="text-amber-700">
                  施設利用時の具体的な手順とルールです。
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <ol className="list-decimal list-inside space-y-4 text-foreground">
                  <li className="leading-relaxed text-base">
                    初回利用時に<strong>利用者カード</strong>をお渡しします。
                    <strong>無くさないように</strong>して、利用時は
                    <strong>必ず持って来て</strong>ください。
                  </li>
                  <li className="leading-relaxed text-base">
                    利用する際は<strong>受付をして、名札を着用</strong>
                    してください。
                  </li>
                  <li className="leading-relaxed text-base">
                    帰る際は<strong>アンケートに回答</strong>して、
                    <strong>スタッフに報告</strong>をし、
                    <strong>名札ケースを置いて</strong>帰ってください。
                  </li>
                  <li className="leading-relaxed text-base">
                    遅い時間帯（<strong>小学生の場合は18時以降</strong>
                    ）に参加する際は、<strong>迎えに来てもらって</strong>
                    ください。
                  </li>
                  <li className="leading-relaxed text-base">
                    トイレ以外で途中退室する（建物から出る）際は
                    <strong>スタッフに報告</strong>
                    してください（名札は置いていく）。
                  </li>
                  <li className="leading-relaxed text-base">
                    トラブル防止のため、
                    <strong>スタッフと利用者のSNS等連絡先の交換を禁止</strong>
                    します。
                  </li>
                  <li className="leading-relaxed text-base">
                    <strong>SNSで他の人の姿や作品などを投稿しない</strong>
                    でください。
                  </li>
                  <li className="leading-relaxed text-base">
                    <strong>熱中症対策</strong>のために、
                    <strong>飲み物を持参</strong>しましょう。
                  </li>
                </ol>
              </div>

              <Separator className="my-8 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

              <Alert className="border-green-200/50 bg-gradient-to-r from-green-50/80 to-emerald-50/80 backdrop-blur-sm">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription className="text-green-800 text-base">
                  <strong>
                    これらの約束事を守って、みんなで楽しく安全にテクノバを利用しましょう！
                  </strong>
                  わからないことがあったら、いつでもスタッフに聞いてくださいね。
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Terms Agreement Section */}
          <ScaleIn delay={0.5}>
            <Card className="border-2 border-emerald-200/50 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardContent className="pt-8">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <Checkbox
                      id="acceptTerms"
                      checked={acceptTerms}
                      onCheckedChange={(checked) =>
                        setAcceptTerms(checked === true)
                      }
                      className="mt-1 border-primary/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor="acceptTerms"
                        className="text-lg cursor-pointer leading-relaxed"
                      >
                        上記の利用規約を読み、内容に同意します
                        <span className="text-red-500 ml-1">*</span>
                      </Label>
                    </div>
                  </div>

                  {!acceptTerms && (
                    <Alert className="border-amber-200/50 bg-gradient-to-r from-amber-50/80 to-orange-50/80 backdrop-blur-sm">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-amber-700">
                        利用規約に同意していただく必要があります。
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          </ScaleIn>

          {/* Navigation */}
          <FadeIn delay={0.7} className="space-y-6">
            <Separator className="bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/" className="flex-1 sm:flex-none">
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={() => playClick()}
                  className="w-full sm:w-auto border-primary/20 hover:bg-primary/5 px-8"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  戻る
                </Button>
              </Link>
              <Button
                size="lg"
                className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!acceptTerms}
                onClick={handleProceedToRegister}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                登録へ進む
              </Button>
            </div>
          </FadeIn>
        </SlideInLeft>
      </div>
    </PageContainer>
  );
}
