"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useGuestSoundEffects } from "@/hooks/use-guest-sound-effects";
import { motion } from "motion/react";
import { ArrowLeft, Home, ShieldCheck } from "lucide-react";

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
    <div className="flex flex-1 flex-col">
      <div className="mx-auto flex-1 px-4 py-10 md:max-w-4xl md:px-6">
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
                    利用規約
                  </h1>
                </Link>
                <p className="mt-3 text-sm text-slate-600">
                  施設を安全に利用するための大切な約束ごとです。
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:w-auto sm:flex-row">
                <Link href="/" className="flex-1 sm:flex-none">
                  <Button
                    variant="ghost"
                    className="w-full min-w-[150px] justify-center gap-2 text-slate-600"
                    onClick={() => playClick()}
                  >
                    <Home className="h-4 w-4" aria-hidden />
                    トップへ
                  </Button>
                </Link>
                <Link href="/checkin" className="flex-1 sm:flex-none">
                  <Button
                    variant="secondary"
                    className="w-full min-w-[150px] justify-center gap-2 text-slate-700"
                    onClick={() => playClick()}
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden />
                    入退場へ
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-slate-900">
                <ShieldCheck className="h-5 w-5" aria-hidden />
                <CardTitle className="text-lg font-semibold">
                  参加にあたって
                </CardTitle>
              </div>
              <Badge variant="secondary" className="text-slate-600">
                重要
              </Badge>
            </CardHeader>
            <CardContent className="space-y-6 px-6 pb-8 pt-4">
              <Alert className="border-slate-200 bg-white">
                <AlertTitle className="text-slate-900">
                  テクノバの決まりごと
                </AlertTitle>
                <AlertDescription className="text-slate-600">
                  みんなで楽しく安全に利用するための基本的なルールです。
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <ol className="list-decimal list-inside space-y-3 text-slate-700">
                  <li className="leading-relaxed">
                    <strong>機材はゆずり合って大切に使い</strong>
                    、使ったものは元の場所に片付けましょう。
                  </li>
                  <li className="leading-relaxed">
                    ほかの人の作るものを大切にして、
                    <strong>お互いのことを尊重</strong>しましょう。
                  </li>
                  <li className="leading-relaxed">
                    ほかの人の作業をじゃましたり、
                    <strong>ばかにしたりしない</strong>ようにしましょう。
                  </li>
                  <li className="leading-relaxed">
                    <strong>
                      人を傷つける、差別する、怒らせるようなことはやめ
                    </strong>
                    ましょう。
                  </li>
                  <li className="leading-relaxed">
                    <strong>ケンカはやめ</strong>
                    ましょう。自分たちで解決できない問題が起こったら、
                    <strong>大人に相談</strong>しましょう。
                  </li>
                  <li className="leading-relaxed">
                    何かをダウンロードまたはアップロードするときは、
                    <strong>かならずメンターに聞き</strong>ましょう。
                  </li>
                  <li className="leading-relaxed">
                    <strong>ケガにつながる機材</strong>
                    もあるので、メンターの注意を聞いて
                    <strong>安全に使い</strong>
                    ましょう。
                  </li>
                </ol>
              </div>

              <Separator />

              <Alert className="border-slate-200 bg-white">
                <AlertTitle className="text-slate-900">
                  守ってほしいこと
                </AlertTitle>
                <AlertDescription className="text-slate-600">
                  施設利用時の具体的な手順とルールです。
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <ol className="list-decimal list-inside space-y-3 text-slate-700">
                  <li className="leading-relaxed">
                    初回利用時に<strong>利用者カード</strong>をお渡しします。
                    <strong>無くさないように</strong>して、利用時は
                    <strong>必ず持って来て</strong>ください。
                  </li>
                  <li className="leading-relaxed">
                    利用する際は<strong>受付をして、名札を着用</strong>
                    してください。
                  </li>
                  <li className="leading-relaxed">
                    帰る際は<strong>アンケートに回答</strong>して、
                    <strong>メンターに報告</strong>をし、
                    <strong>名札ケースを置いて</strong>帰ってください。
                  </li>
                  <li className="leading-relaxed">
                    遅い時間帯（<strong>小学生の場合は18時以降</strong>
                    ）に参加する際は、<strong>迎えに来てもらって</strong>
                    ください。
                  </li>
                  <li className="leading-relaxed">
                    トイレ以外で途中退室する（建物から出る）際は
                    <strong>メンターに報告</strong>
                    してください（名札は置いていく）。
                  </li>
                  <li className="leading-relaxed">
                    トラブル防止のため、
                    <strong>メンターと利用者のSNS等連絡先の交換を禁止</strong>
                    します。
                  </li>
                  <li className="leading-relaxed">
                    <strong>SNSで他の人の姿や作品などを投稿しない</strong>
                    でください。
                  </li>
                  <li className="leading-relaxed">
                    <strong>熱中症対策</strong>のために、
                    <strong>飲み物を持参</strong>しましょう。
                  </li>
                </ol>
              </div>

              <Separator />

              <Alert className="border-slate-200 bg-slate-50">
                <AlertDescription className="text-slate-700">
                  <strong>
                    これらの約束事を守って、みんなで楽しく安全にテクノバを利用しましょう！
                  </strong>
                  わからないことがあったら、いつでもメンターに聞いてくださいね。
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-900">
                利用規約への同意
              </CardTitle>
              <CardDescription className="text-sm text-slate-600">
                登録手続きに進む前に、内容をご確認ください。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-6 pb-6 pt-2">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="acceptTerms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) =>
                    setAcceptTerms(checked === true)
                  }
                />
                <div>
                  <Label
                    htmlFor="acceptTerms"
                    className="cursor-pointer text-sm font-medium text-slate-700"
                  >
                    上記の利用規約を読み、内容に同意します
                    <span className="ml-1 text-rose-500">*</span>
                  </Label>
                </div>
              </div>

              {!acceptTerms && (
                <Alert className="border-slate-200 bg-slate-50">
                  <AlertDescription className="text-sm text-slate-600">
                    利用規約に同意していただく必要があります。
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Separator />
            <div className="flex justify-center gap-4">
              <Link href="/">
                <Button variant="outline" size="lg" onClick={() => playClick()}>
                  戻る
                </Button>
              </Link>
              <Button
                size="lg"
                className="bg-slate-900 hover:bg-slate-800"
                disabled={!acceptTerms}
                onClick={handleProceedToRegister}
              >
                登録へ進む
              </Button>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
