import { ClipboardList, DoorClosed, DoorOpen } from "lucide-react";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { useCheckinActions } from "@/hooks/use-checkin-actions";
import { useGuestSoundEffects } from "@/hooks/use-guest-sound-effects";
import type { GuestData } from "@/types/api";

interface CheckinActionsProps {
  guest: GuestData;
}

export function CheckinActions({ guest }: CheckinActionsProps) {
  const { loading, error, handleCheckin, handleCheckout } = useCheckinActions();
  const { playClick, playSuccess } = useGuestSoundEffects();

  const handleCheckinButtonClick = async () => {
    if (loading) return;
    playClick();

    try {
      const success = await handleCheckin(guest);
      if (success) {
        playSuccess();
      }
    } catch (error) {
      console.error("Check-in failed", error);
    }
  };

  const handleCheckoutButtonClick = async () => {
    if (loading) return;
    playClick();

    try {
      const success = await handleCheckout(guest);
      if (success) {
        playSuccess();
      }
    } catch (error) {
      console.error("Check-out failed", error);
    }
  };

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-slate-200 p-2 text-slate-700">
            <ClipboardList className="h-4 w-4" aria-hidden />
          </span>
          <CardTitle className="text-lg font-semibold text-slate-900">
            手続き
          </CardTitle>
        </div>
        <CardDescription className="text-sm text-slate-500">
          選択したゲストの入退場ステータス
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg">{guest.name}</h3>
              <p className="text-sm text-slate-600">ID: {guest.displayId}</p>
            </div>
            <StatusBadge
              status={guest.isCurrentlyCheckedIn ? "active" : "inactive"}
            >
              {guest.isCurrentlyCheckedIn ? "滞在中" : "退場済み"}
            </StatusBadge>
          </div>
        </div>

        {error && <ErrorState message={error} />}

        {guest.isCurrentlyCheckedIn ? (
          <div className="space-y-4 text-center">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-700">
                現在チェックイン中です
              </p>
            </div>
            <Button
              onClick={handleCheckoutButtonClick}
              disabled={loading}
              size="lg"
              className="w-full bg-slate-900 text-white transition-colors hover:bg-slate-800"
            >
              {loading ? "処理中..." : "チェックアウト"}
              <DoorOpen className="ml-2 h-4 w-4" aria-hidden />
            </Button>
          </div>
        ) : (
          <div className="space-y-4 text-center">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-700">
                現在退場中です
              </p>
            </div>
            <Button
              onClick={handleCheckinButtonClick}
              disabled={loading}
              size="lg"
              className="w-full bg-slate-900 text-white transition-colors hover:bg-slate-800"
            >
              {loading ? "処理中..." : "チェックイン"}
              <DoorClosed className="ml-2 h-4 w-4" aria-hidden />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
