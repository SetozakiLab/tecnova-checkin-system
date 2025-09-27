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

export default function HomePage() {
  const { playClick } = useGuestSoundEffects();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <Image
            src="/logo.png"
            alt="Tec-nova ロゴ"
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
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* はじめての方 */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-green-200">
            <Link href="/terms" onClick={() => playClick()}>
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">👋</span>
                </div>
                <CardTitle className="text-2xl font-bold text-green-800">
                  初回利用の方
                </CardTitle>
                <CardDescription className="text-lg">
                  利用規約の確認
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4">
                  初回の方は、利用規約を確認してから新規登録をお願いします
                </p>
                <Button
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => playClick()}
                >
                  規約を確認する
                </Button>
              </CardContent>
            </Link>
          </Card>

          {/* メンバーの方 */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-blue-200">
            <Link href="/checkin" onClick={() => playClick()}>
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🏠</span>
                </div>
                <CardTitle className="text-2xl font-bold">
                  チェックイン
                </CardTitle>
                <CardDescription className="text-lg">
                  入場手続き
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4">
                  2回目以降の方は、こちらから入場手続きをしてください
                </p>
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => playClick()}
                >
                  チェックイン
                </Button>
              </CardContent>
            </Link>
          </Card>

          {/* チェックアウト */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-red-200">
            <Link href="/checkout" onClick={() => playClick()}>
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🚪</span>
                </div>
                <CardTitle className="text-2xl font-bold">
                  チェックアウト
                </CardTitle>
                <CardDescription className="text-lg">
                  退場手続き
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4">
                  お帰りの方は、こちらから退場手続きをしてください
                </p>
                <Button
                  size="lg"
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => playClick()}
                >
                  チェックアウト
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
            onClick={() => playClick()}
          >
            管理者ログイン
          </Link>
        </div>
      </div>
    </div>
  );
}
