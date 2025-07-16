"use client";

import { Button } from "@/components/ui/button";

export function RefreshButton() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <Button onClick={handleRefresh} variant="outline" size="sm">
      更新
    </Button>
  );
}
