"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiResponse, GuestData, CheckinData } from "@/types/api";

export default function CheckinPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GuestData[]>([]);
  const [selectedGuest, setSelectedGuest] = useState<GuestData | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError("番号または名前を入力してください");
      return;
    }

    try {
      setSearchLoading(true);
      setError("");
      setSearchResults([]);
      setSelectedGuest(null);

      const response = await fetch(
        `/api/guests/search?q=${encodeURIComponent(searchQuery)}`
      );
      const result: ApiResponse<GuestData[]> = await response.json();

      if (!result.success) {
        setError(result.error?.message || "検索に失敗しました");
        return;
      }

      if (result.data!.length === 0) {
        setError("見つかりませんでした。番号または名前を確認してください");
        return;
      }

      setSearchResults(result.data!);
      if (result.data!.length === 1) {
        setSelectedGuest(result.data![0]);
      }
    } catch (err) {
      console.error("Search error:", err);
      setError("サーバーエラーが発生しました");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleCheckin = async () => {
    if (!selectedGuest) return;

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`/api/guests/${selectedGuest.id}/checkin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const result: ApiResponse<CheckinData> = await response.json();

      if (!result.success) {
        setError(result.error?.message || "チェックインに失敗しました");
        return;
      }

      // 完了ページに遷移
      router.push(`/checkin/complete?type=checkin&guestId=${selectedGuest.id}`);
    } catch (err) {
      console.error("Checkin error:", err);
      setError("サーバーエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!selectedGuest) return;

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`/api/guests/${selectedGuest.id}/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const result: ApiResponse<CheckinData> = await response.json();

      if (!result.success) {
        setError(result.error?.message || "チェックアウトに失敗しました");
        return;
      }

      // 完了ページに遷移
      router.push(
        `/checkin/complete?type=checkout&guestId=${selectedGuest.id}`
      );
    } catch (err) {
      console.error("Checkout error:", err);
      setError("サーバーエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <h1 className="text-4xl font-bold text-indigo-900">tec-nova</h1>
          </Link>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">入退場管理</h2>
          <p className="text-lg text-gray-600">施設の入場・退場手続き</p>
        </div>

        {/* 検索セクション */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl text-center">
              登録情報の検索
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="search" className="text-lg">
                  あなたの番号または名前を入力してください
                </Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="250704001 または 田中太郎"
                    className="text-lg p-4 h-12"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleSearch();
                      }
                    }}
                    disabled={searchLoading}
                  />
                  <Button
                    onClick={handleSearch}
                    disabled={searchLoading}
                    className="px-8 h-12"
                  >
                    {searchLoading ? "検索中..." : "検索"}
                  </Button>
                </div>
              </div>

              {/* エラーメッセージ */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 text-center">{error}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 検索結果 */}
        {searchResults.length > 1 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">
                該当するお名前を選択してください
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {searchResults.map((guest) => (
                  <button
                    key={guest.id}
                    onClick={() => setSelectedGuest(guest)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                      selectedGuest?.id === guest.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-lg">{guest.name}</p>
                        <p className="text-gray-600">番号: {guest.displayId}</p>
                      </div>
                      {guest.isCurrentlyCheckedIn && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                          在室中
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 選択されたゲストのアクション */}
        {selectedGuest && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl text-center">
                {selectedGuest.name} さん
              </CardTitle>
              <p className="text-center text-gray-600">
                番号: {selectedGuest.displayId}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedGuest.isCurrentlyCheckedIn ? (
                  <div className="text-center space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-green-800 font-semibold">
                        現在入場中です
                      </p>
                    </div>
                    <Button
                      onClick={handleCheckout}
                      disabled={loading}
                      size="lg"
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
                    >
                      {loading ? "処理中..." : "🚪 チェックアウト（退場）"}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-blue-800 font-semibold">
                        現在退場中です
                      </p>
                    </div>
                    <Button
                      onClick={handleCheckin}
                      disabled={loading}
                      size="lg"
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      {loading ? "処理中..." : "🏠 チェックイン（入場）"}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ナビゲーション */}
        <div className="text-center">
          <Link href="/">
            <Button variant="outline" size="lg">
              ホームに戻る
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
