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

export default function TermsPage() {
  const router = useRouter();
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleProceedToRegister = () => {
    if (acceptTerms) {
      router.push("/register?agreed=true");
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <h1 className="text-4xl font-bold text-indigo-900">tec-nova</h1>
          </Link>
          <h2 className="text-2xl font-bold text-gray-800">利用規約</h2>
          <p className="text-lg text-gray-600">施設利用に関する約束事</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge variant="destructive">重要</Badge>
              <CardTitle className="text-xl">参加にあたって</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="border-blue-200 bg-blue-50">
              <AlertTitle className="text-blue-800">
                テクノバの決まりごと
              </AlertTitle>
              <AlertDescription className="text-blue-700">
                みんなで楽しく安全に利用するための基本的なルールです。
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <ol className="list-decimal list-inside space-y-3 text-gray-700">
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
                  <strong>かならずスタッフに聞き</strong>ましょう。
                </li>
                <li className="leading-relaxed">
                  <strong>ケガにつながる機材</strong>
                  もあるので、スタッフの注意を聞いて<strong>安全に使い</strong>
                  ましょう。
                </li>
              </ol>
            </div>

            <Separator className="my-6" />

            <Alert className="border-amber-200 bg-amber-50">
              <AlertTitle className="text-amber-800">
                守ってほしいこと
              </AlertTitle>
              <AlertDescription className="text-amber-700">
                施設利用時の具体的な手順とルールです。
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <ol className="list-decimal list-inside space-y-3 text-gray-700">
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
                  <strong>スタッフに報告</strong>をし、
                  <strong>名札ケースを置いて</strong>帰ってください。
                </li>
                <li className="leading-relaxed">
                  遅い時間帯（<strong>小学生の場合は18時以降</strong>
                  ）に参加する際は、<strong>迎えに来てもらって</strong>
                  ください。
                </li>
                <li className="leading-relaxed">
                  トイレ以外で途中退室する（建物から出る）際は
                  <strong>スタッフに報告</strong>
                  してください（名札は置いていく）。
                </li>
                <li className="leading-relaxed">
                  トラブル防止のため、
                  <strong>スタッフと利用者のSNS等連絡先の交換を禁止</strong>
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

            <Separator className="my-6" />

            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">
                <strong>
                  これらの約束事を守って、みんなで楽しく安全にテクノバを利用しましょう！
                </strong>
                わからないことがあったら、いつでもスタッフに聞いてくださいね。
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* 利用規約同意セクション */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
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
                    className="text-lg cursor-pointer"
                  >
                    上記の利用規約を読み、内容に同意します
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                </div>
              </div>

              {!acceptTerms && (
                <Alert className="border-amber-200 bg-amber-50">
                  <AlertDescription className="text-amber-700">
                    利用規約に同意していただく必要があります。
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ナビゲーション */}
        <div className="space-y-4">
          <Separator />
          <div className="flex justify-center gap-4">
            <Link href="/">
              <Button variant="outline" size="lg">
                戻る
              </Button>
            </Link>
            <Button
              size="lg"
              className="bg-green-600 hover:bg-green-700"
              disabled={!acceptTerms}
              onClick={handleProceedToRegister}
            >
              登録へ進む
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
