"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ApiResponse, GuestSearchResult } from "@/types/api";

export default function CheckinPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GuestSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // リアルタイム検索
  useEffect(() => {
    if (searchQuery.trim().length < 1) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/guests/search?q=${encodeURIComponent(searchQuery)}&limit=10`
        );
        const result: ApiResponse<GuestSearchResult[]> = await response.json();

        if (result.success && result.data) {
          setSearchResults(result.data);
        } else {
          setError(result.error?.message || "検索に失敗しました");
          setSearchResults([]);
        }
      } catch (err) {
        console.error("Search error:", err);
        setError("通信エラーが発生しました");
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms のデバウンス

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleGuestSelect = (guest: GuestSearchResult) => {
    router.push(`/checkin/${guest.id}`);
  };

  const formatLastCheckin = (date: Date | null) => {
    if (!date) return "初回利用";

    const lastCheckin = new Date(date);
    const now = new Date();
    const diffHours = Math.floor(
      (now.getTime() - lastCheckin.getTime()) / (1000 * 60 * 60)
    );

    if (diffHours < 24) {
      return `${diffHours}時間前`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}日前`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        {/* ヘッダー */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">誰ですか？</h1>
          <p className="text-gray-600">お名前またはIDで検索してください</p>
        </div>

        {/* 検索フォーム */}
        <Card>
          <CardHeader>
            <CardTitle>検索</CardTitle>
            <CardDescription>
              名前の一部またはIDを入力してください
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search">お名前またはID</Label>
              <Input
                id="search"
                placeholder="田中 または 250703001"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-lg p-3"
              />
            </div>

            {/* エラーメッセージ */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* ローディング */}
            {isLoading && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">検索中...</p>
              </div>
            )}

            {/* 検索結果 */}
            {searchResults.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">検索結果</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {searchResults.map((guest) => (
                    <Card
                      key={guest.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleGuestSelect(guest)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium text-lg">
                                {guest.name}
                              </h4>
                              <Badge variant="outline" className="text-xs">
                                ID: {guest.displayId}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>
                                最終利用:{" "}
                                {formatLastCheckin(guest.lastCheckinAt || null)}
                              </span>
                              {guest.isCurrentlyCheckedIn && (
                                <Badge className="bg-green-100 text-green-800">
                                  施設内
                                </Badge>
                              )}
                            </div>
                          </div>
                          <svg
                            className="w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* 検索結果なし */}
            {searchQuery.trim().length > 0 &&
              searchResults.length === 0 &&
              !isLoading &&
              !error && (
                <div className="text-center py-6 text-gray-500">
                  <svg
                    className="w-12 h-12 mx-auto mb-3 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <p>該当するメンバーが見つかりませんでした</p>
                  <p className="text-sm mt-1">
                    初回の方は{" "}
                    <Link
                      href="/register"
                      className="text-blue-600 hover:underline"
                    >
                      新規登録
                    </Link>{" "}
                    をお願いします
                  </p>
                </div>
              )}
          </CardContent>
        </Card>

        {/* 戻るボタン */}
        <div className="text-center">
          <Button variant="outline" asChild>
            <Link href="/">トップに戻る</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
