"use client";

import { Button } from "@/components/ui/button";
import { useGuestSoundEffects } from "@/hooks/use-guest-sound-effects";

export function RefreshButton() {
  const { playClick } = useGuestSoundEffects();

  const handleRefresh = () => {
    playClick();
    window.location.reload();
  };

  return (
    <Button
      onClick={handleRefresh}
      variant="outline"
      size="sm"
      data-slot="refresh-button"
    >
      更新
    </Button>
  );
}
