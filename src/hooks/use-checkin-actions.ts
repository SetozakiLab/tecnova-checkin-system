import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "./use-api";
import { GuestData, CheckinData } from "@/types/api";

interface UseCheckinActionsReturn {
  loading: boolean;
  error: string;
  handleCheckin: (guest: GuestData) => Promise<boolean>;
  handleCheckout: (guest: GuestData) => Promise<boolean>;
}

export function useCheckinActions(): UseCheckinActionsReturn {
  const router = useRouter();
  const { loading, error, execute } = useApi<CheckinData>();

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
        router.push(`/checkin/complete?type=checkin&guestId=${guest.id}`);
        return true;
      }

      return false;
    },
    [execute, router]
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
        router.push(`/checkin/complete?type=checkout&guestId=${guest.id}`);
        return true;
      }

      return false;
    },
    [execute, router]
  );

  return {
    loading,
    error,
    handleCheckin,
    handleCheckout,
  };
}
