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

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        {/* タイトル */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            tec-nova へようこそ！
          </h1>
          <p className="text-lg text-gray-600">まずは以下からお選びください</p>
        </div>

        {/* メインカード */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* 新規登録カード */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/register">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                </div>
                <CardTitle className="text-xl">はじめての方</CardTitle>
                <CardDescription>新規登録をします</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" size="lg">
                  新規登録へ
                </Button>
              </CardContent>
            </Link>
          </Card>

          {/* 入退場カード */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/checkin">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                </div>
                <CardTitle className="text-xl">メンバーの方</CardTitle>
                <CardDescription>入退場手続きをします</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" size="lg" variant="outline">
                  入退場へ
                </Button>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* フッター */}
        <div className="text-center text-sm text-gray-500">
          <p>困ったときはスタッフにお声がけください</p>
        </div>
      </div>
    </div>
  );
}
