import { useState, useEffect } from "react";
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
import { useGuestSearch } from "@/hooks/use-guest-search";
import { ErrorState } from "@/components/shared/error-state";
import { useGuestSoundEffects } from "@/hooks/use-guest-sound-effects";
import { GuestData } from "@/types/api";
import { Badge } from "@/components/ui/badge";
import { Check, Search } from "lucide-react";

interface GuestSearchProps {
  onGuestSelect: (guest: GuestData) => void;
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

  const { playClick } = useGuestSoundEffects();

  const [searchError, setSearchError] = useState("");

  // 検索結果が1件の場合に自動的に親コンポーネントに通知
  useEffect(() => {
    if (selectedGuest) {
      onGuestSelect(selectedGuest);
    }
  }, [selectedGuest, onGuestSelect]);

  const onSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchError("IDまたは名前を入力してください");
      return;
    }
    setSearchError("");
    playClick();
    await handleSearch();
  };

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-slate-200 p-2 text-slate-700">
            <Search className="h-4 w-4" aria-hidden />
          </span>
          <CardTitle className="text-lg font-semibold text-slate-900">
            ゲスト検索
          </CardTitle>
        </div>
        <CardDescription className="text-sm text-slate-500">
          IDまたは名前で検索してください
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <Label htmlFor="search" className="text-sm font-medium">
            検索キーワード
          </Label>
          <div className="mt-2 flex gap-2">
            <Input
              id="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="IDまたは名前を入力"
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
              disabled={loading}
            />
            <Button
              onClick={onSearch}
              disabled={loading || !searchQuery.trim()}
              className="min-w-[96px]"
            >
              {loading ? "検索中..." : "検索"}
            </Button>
          </div>
        </div>

        {(error || searchError) && (
          <ErrorState message={error || searchError} />
        )}

        {searchResults.length > 1 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-600">
              検索結果
            </Label>
            {searchResults.map((guest) => (
              <Card
                key={guest.id}
                className={`cursor-pointer border-slate-200 transition-colors ${
                  selectedGuest?.id === guest.id
                    ? "bg-slate-100"
                    : "hover:bg-slate-50"
                }`}
                onClick={() => {
                  playClick();
                  setSelectedGuest(guest);
                  onGuestSelect(guest);
                }}
              >
                <CardContent className="flex items-center justify-between gap-4 p-4">
                  <div>
                    <p className="font-medium text-slate-900">{guest.name}</p>
                    <p className="text-sm text-slate-600">
                      ID: {guest.displayId}
                    </p>
                  </div>
                  {selectedGuest?.id === guest.id && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1 text-slate-700"
                    >
                      <Check className="h-3 w-3" aria-hidden />
                      選択中
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {searchResults.length === 1 && (
          <Card className="border-slate-200 bg-slate-100">
            <CardContent className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="font-medium text-slate-900">
                  {searchResults[0].name}
                </p>
                <p className="text-sm text-slate-600">
                  ID: {searchResults[0].displayId}
                </p>
              </div>
              <Badge
                variant="secondary"
                className="flex items-center gap-1 text-slate-700"
              >
                <Check className="h-3 w-3" aria-hidden />
                選択中
              </Badge>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
