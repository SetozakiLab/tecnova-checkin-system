import { useCallback } from "react";
import { useEnhancedApi } from "./use-enhanced-api";
import { useNavigation } from "./use-navigation";
import { GuestData, CheckinData } from "@/types/api";

interface UseCheckinActionsReturn {
  loading: boolean;
  error: string;
  success: boolean;
  handleCheckin: (guest: GuestData) => Promise<void>;
  handleCheckout: (guest: GuestData) => Promise<void>;
  reset: () => void;
}

export function useCheckinActions(): UseCheckinActionsReturn {
  const { navigateToCheckinComplete } = useNavigation();
  const { loading, error, success, execute, reset } = useEnhancedApi<CheckinData>({
    onSuccess: () => {
      // Success callback can be used for analytics or notifications
    },
    onError: (error) => {
      console.error("Checkin/Checkout action failed:", error);
    },
  });

  const handleCheckin = useCallback(
    async (guest: GuestData) => {
      const result = await execute(`/api/guests/${guest.id}/checkin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (result) {
        navigateToCheckinComplete("checkin", guest.id);
      }
    },
    [execute, navigateToCheckinComplete]
  );

  const handleCheckout = useCallback(
    async (guest: GuestData) => {
      const result = await execute(`/api/guests/${guest.id}/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (result) {
        navigateToCheckinComplete("checkout", guest.id);
      }
    },
    [execute, navigateToCheckinComplete]
  );

  return {
    loading,
    error,
    success,
    handleCheckin,
    handleCheckout,
    reset,
  };
}
