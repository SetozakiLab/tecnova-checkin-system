import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsPage() {
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
            <CardTitle className="text-xl">ご利用にあたって</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                1. 施設利用について
              </h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>
                  施設を利用する際は、必ずチェックイン・チェックアウトをしてください
                </li>
                <li>保護者の方の許可を得てから利用してください</li>
                <li>他の利用者と仲良く過ごしましょう</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">2. 安全について</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>施設内では走らず、歩いて移動してください</li>
                <li>困ったことがあったら、すぐにメンターに相談してください</li>
                <li>体調が悪くなったら、無理をせずに休憩してください</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">
                3. 個人情報について
              </h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>登録された情報は、施設の運営管理のためにのみ使用します</li>
                <li>個人情報は適切に管理し、外部に漏らすことはありません</li>
                <li>
                  保護者の方からの問い合わせがあった場合にのみ、情報を提供する場合があります
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">4. 禁止事項</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>他の人の迷惑になる行為</li>
                <li>施設の設備を壊すこと</li>
                <li>危険な行為</li>
                <li>嘘の情報で登録すること</li>
              </ul>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-sm text-gray-700">
                これらの規約を守って、みんなで楽しく安全に施設を利用しましょう！
                わからないことがあったら、いつでもメンターに聞いてくださいね。
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ナビゲーション */}
        <div className="flex justify-center gap-4">
          <Link href="/">
            <Button variant="outline" size="lg">
              戻る
            </Button>
          </Link>
          <Link href="/register">
            <Button size="lg" className="bg-green-600 hover:bg-green-700">
              利用規約に同意して登録
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
