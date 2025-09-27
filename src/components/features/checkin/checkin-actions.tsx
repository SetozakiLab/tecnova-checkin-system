import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LegacyStatusBadge as StatusBadge } from "@/components/ui/status-badge";
import { useCheckinActions } from "@/hooks/use-checkin-actions";
import { ErrorState } from "@/components/shared/error-state";
import { GuestData } from "@/types/api";

interface CheckinActionsProps {
  guest: GuestData;
}

export function CheckinActions({ guest }: CheckinActionsProps) {
  const { loading, error, handleCheckin, handleCheckout } = useCheckinActions();

  return (
    <Card>
      <CardHeader>
        <CardTitle>📝 チェックイン・チェックアウト</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-semibold text-lg">{guest.name}</h3>
              <p className="text-sm text-gray-600">ID: {guest.displayId}</p>
            </div>
            <StatusBadge isActive={!!guest.isCurrentlyCheckedIn} />
          </div>
        </div>

        {error && <ErrorState message={error} />}

        {guest.isCurrentlyCheckedIn ? (
          <div className="text-center space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-semibold">現在入場中です</p>
            </div>
            <Button
              onClick={() => handleCheckout(guest)}
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
              <p className="text-blue-800 font-semibold">現在退場中です</p>
            </div>
            <Button
              onClick={() => handleCheckin(guest)}
              disabled={loading}
              size="lg"
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              {loading ? "処理中..." : "🏢 チェックイン（入場）"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
