// Application: Checkin Actions Hook with Clean Architecture
// チェックイン・チェックアウト処理 - クリーンアーキテクチャ版

import { useState, useCallback } from "react";
import { useCheckinManagement } from "@/infrastructure/container";
import { CheckinRecordEntity } from "@/domain/entities/checkin-record";

interface UseCheckinActionsReturn {
  loading: boolean;
  error: string;
  checkinGuest: (guestId: string) => Promise<{ success: boolean; record?: CheckinRecordEntity; error?: string }>;
  checkoutGuest: (guestId: string) => Promise<{ success: boolean; record?: CheckinRecordEntity; error?: string }>;
  checkoutByRecordId: (recordId: string) => Promise<{ success: boolean; record?: CheckinRecordEntity; error?: string }>;
  clearError: () => void;
}

export function useCheckinActions(): UseCheckinActionsReturn {
  const checkinManagement = useCheckinManagement();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const checkinGuest = useCallback(async (guestId: string) => {
    try {
      setLoading(true);
      setError("");
      
      const result = await checkinManagement.checkinGuest(guestId);
      
      if (!result.success && result.error) {
        setError(result.error);
      }
      
      return result;
    } catch (err) {
      console.error("Checkin error:", err);
      const errorMessage = err instanceof Error ? err.message : "チェックインに失敗しました";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [checkinManagement]);

  const checkoutGuest = useCallback(async (guestId: string) => {
    try {
      setLoading(true);
      setError("");
      
      const result = await checkinManagement.checkoutGuest(guestId);
      
      if (!result.success && result.error) {
        setError(result.error);
      }
      
      return result;
    } catch (err) {
      console.error("Checkout error:", err);
      const errorMessage = err instanceof Error ? err.message : "チェックアウトに失敗しました";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [checkinManagement]);

  const checkoutByRecordId = useCallback(async (recordId: string) => {
    try {
      setLoading(true);
      setError("");
      
      const result = await checkinManagement.checkoutByRecordId(recordId);
      
      if (!result.success && result.error) {
        setError(result.error);
      }
      
      return result;
    } catch (err) {
      console.error("Checkout by record ID error:", err);
      const errorMessage = err instanceof Error ? err.message : "チェックアウトに失敗しました";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [checkinManagement]);

  const clearError = useCallback(() => {
    setError("");
  }, []);

  return {
    loading,
    error,
    checkinGuest,
    checkoutGuest,
    checkoutByRecordId,
    clearError,
  };
}