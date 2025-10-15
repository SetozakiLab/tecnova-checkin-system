import { Check, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { ErrorState } from "@/components/shared/error-state";
import { Badge } from "@/components/ui/badge";
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
import { useGuestSoundEffects } from "@/hooks/use-guest-sound-effects";
import type { GuestData } from "@/types/api";

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
  const [hasSearched, setHasSearched] = useState(false);

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
    setHasSearched(true);
    await handleSearch();
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setHasSearched(false);
    }
  }, [searchQuery]);

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
      <CardContent className="flex flex-col gap-5 lg:max-h-[620px]">
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

        <div className="flex-1 space-y-3 lg:max-h-[440px] lg:overflow-y-auto lg:pr-1">
          {searchResults.length > 1 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium text-slate-600">
                検索結果
              </Label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {searchResults.map((guest) => (
                  <Card
                    key={guest.id}
                    className={`h-full cursor-pointer border-slate-200 transition-all ${
                      selectedGuest?.id === guest.id
                        ? "border-slate-400 bg-slate-100 shadow-sm"
                        : "hover:border-slate-300 hover:bg-slate-50"
                    }`}
                    onClick={() => {
                      playClick();
                      setSelectedGuest(guest);
                      onGuestSelect(guest);
                    }}
                  >
                    <CardContent className="flex h-full flex-col justify-between gap-3 p-4">
                      <div>
                        <p className="font-medium text-slate-900">
                          {guest.name}
                        </p>
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

          {hasSearched && !loading && searchResults.length === 0 && (
            <Card className="border-dashed border-slate-200 bg-white">
              <CardContent className="space-y-2 p-4 text-sm text-slate-600">
                <p>条件に一致するゲストが見つかりませんでした。</p>
                <p className="text-xs text-slate-500">
                  スペースや全角・半角の揺れがないかご確認ください。
                </p>
              </CardContent>
            </Card>
          )}

          {!hasSearched && searchResults.length === 0 && (
            <Card className="border-dashed border-slate-200 bg-slate-50">
              <CardContent className="space-y-2 p-4 text-sm text-slate-600">
                <p>ゲストを検索すると結果がここに表示されます。</p>
                <p className="text-xs text-slate-500">
                  ID、氏名の一部でも検索できます。
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
