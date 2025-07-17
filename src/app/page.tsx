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

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <Image
            src="/logo.png"
            alt="tec-nova"
            width={400}
            height={160}
            className="mx-auto mb-4 bg-white rounded-lg p-8"
          />
          <p className="text-xl text-indigo-700 mb-2">入退場管理システム</p>
          <p className="text-lg text-gray-600">
            施設利用のチェックイン・チェックアウト
          </p>
        </div>

        {/* メインメニュー */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* はじめての方 */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-green-200 hover:border-green-400">
            <Link href="/terms">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">👋</span>
                </div>
                <CardTitle className="text-2xl text-green-800">
                  初回利用の方
                </CardTitle>
                <CardDescription className="text-lg">
                  利用規約の確認
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4">
                  初回の方は、利用規約を確認してから登録をお願いします
                </p>
                <Button
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  規約を確認する
                </Button>
              </CardContent>
            </Link>
          </Card>

          {/* メンバーの方 */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-blue-200 hover:border-blue-400">
            <Link href="/checkin">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🏠</span>
                </div>
                <CardTitle className="text-2xl text-blue-800">
                  メンバーの方
                </CardTitle>
                <CardDescription className="text-lg">
                  入退場手続き
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4">
                  登録済みの方は、こちらから入退場の手続きをしてください
                </p>
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  入退場手続き
                </Button>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* 管理者ログイン */}
        <div className="text-center">
          <Link
            href="/admin/login"
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            管理者ログイン
          </Link>
        </div>
      </div>
    </div>
  );
}
