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
            <CardTitle className="text-xl">参加にあたって</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                テクノバの決まりごと
              </h3>
              <ol className="list-decimal list-inside space-y-1 text-gray-700">
                <li>
                  機材はゆずり合って大切に使い、使ったものは元の場所に片付けましょう。
                </li>
                <li>
                  ほかの人の作るものを大切にして、お互いのことを尊重しましょう。
                </li>
                <li>
                  ほかの人の作業をじゃましたり、ばかにしたりしないようにしましょう。
                </li>
                <li>
                  人を傷つける、差別する、怒らせるようなことはやめましょう。
                </li>
                <li>
                  ケンカはやめましょう。自分たちで解決できない問題が起こったら、大人に相談しましょう。
                </li>
                <li>
                  何かをダウンロードまたはアップロードするときは、かならずスタッフに聞きましょう。
                </li>
                <li>
                  ケガにつながる機材もあるので、スタッフの注意を聞いて安全に使いましょう。
                </li>
              </ol>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">守ってほしいこと</h3>
              <ol className="list-decimal list-inside space-y-1 text-gray-700">
                <li>
                  初回利用時に利用者カードをお渡しします。無くさないようにして、利用時は必ず持って来てください。
                </li>
                <li>利用する際は受付をして、名札を着用してください。</li>
                <li>
                  帰る際はアンケートに回答して、スタッフに報告をし、名札ケースを置いて帰ってください。
                </li>
                <li>
                  遅い時間帯（小学生の場合は18時以降）に参加する際は、迎えに来てもらってください。
                </li>
                <li>
                  トイレ以外で途中退室する（建物から出る）際はスタッフに報告してください（名札は置いていく）。
                </li>
                <li>
                  トラブル防止のため、スタッフと利用者のSNS等連絡先の交換を禁止します。
                </li>
                <li>SNSで他の人の姿や作品などを投稿しないでください。</li>
                <li>熱中症対策のために、飲み物を持参しましょう。</li>
              </ol>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-sm text-gray-700">
                これらの約束事を守って、みんなで楽しく安全にテクノバを利用しましょう！
                わからないことがあったら、いつでもスタッフに聞いてくださいね。
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
