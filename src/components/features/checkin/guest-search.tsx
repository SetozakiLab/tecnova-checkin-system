import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGuestSearch } from "@/hooks/use-guest-search";
import { ErrorState } from "@/components/shared/error-state";

interface GuestSearchProps {
  onGuestSelect: (guest: any) => void;
}

export function GuestSearch({ onGuestSelect }: GuestSearchProps) {
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    selectedGuest,
    setSelectedGuest,
    loading,
    error,
    handleSearch,
  } = useGuestSearch();

  const [searchError, setSearchError] = useState("");

  // 検索結果が1件の場合に自動的に親コンポーネントに通知
  useEffect(() => {
    if (selectedGuest) {
      onGuestSelect(selectedGuest);
    }
  }, [selectedGuest, onGuestSelect]);

  const onSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchError("番号または名前を入力してください");
      return;
    }
    setSearchError("");
    await handleSearch();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>🔍 ゲスト検索</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="search">番号または名前</Label>
          <div className="flex space-x-2">
            <Input
              id="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="番号または名前を入力"
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
              disabled={loading}
            />
            <Button
              onClick={onSearch}
              disabled={loading || !searchQuery.trim()}
            >
              {loading ? "検索中..." : "検索"}
            </Button>
          </div>
        </div>

        {(error || searchError) && (
          <ErrorState message={error || searchError} />
        )}

        {searchResults.length > 1 && (
          <div className="space-y-2">
            <Label>検索結果</Label>
            {searchResults.map((guest) => (
              <Card
                key={guest.id}
                className={`cursor-pointer transition-colors ${
                  selectedGuest?.id === guest.id
                    ? "bg-blue-50 border-blue-300"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => {
                  setSelectedGuest(guest);
                  onGuestSelect(guest);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{guest.name}</p>
                      <p className="text-sm text-gray-600">
                        ID: {guest.displayId}
                      </p>
                    </div>
                    {selectedGuest?.id === guest.id && (
                      <div className="text-green-600 font-semibold">
                        ✓ 選択中
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {searchResults.length === 1 && (
          <Card className="bg-blue-50 border-blue-300">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{searchResults[0].name}</p>
                  <p className="text-sm text-gray-600">
                    ID: {searchResults[0].displayId}
                  </p>
                </div>
                <div className="text-green-600 font-semibold">✓ 選択中</div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
