// Application: Dashboard Data Hook with Clean Architecture
// ダッシュボードデータ管理 - クリーンアーキテクチャ版

import { useState, useEffect, useCallback } from "react";
import { useCheckinManagement } from "@/infrastructure/container";
import { CheckinRecordWithGuest } from "@/domain/entities/checkin-record";
import { TodayStats } from "@/domain/repositories/checkin-record-repository";

interface UseDashboardDataReturn {
  currentGuests: CheckinRecordWithGuest[];
  todayStats: TodayStats | null;
  loading: boolean;
  isRefreshing: boolean;
  error: string;
  refetch: () => Promise<void>;
}

export function useDashboardData(): UseDashboardDataReturn {
  const checkinManagement = useCheckinManagement();
  
  const [currentGuests, setCurrentGuests] = useState<CheckinRecordWithGuest[]>([]);
  const [todayStats, setTodayStats] = useState<TodayStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      setError("");

      // Use Casesを使用してデータを取得
      const [guests, stats] = await Promise.all([
        checkinManagement.getCurrentGuests(),
        checkinManagement.getTodayStats(),
      ]);

      setCurrentGuests(guests);
      setTodayStats(stats);
    } catch (err) {
      console.error("Fetch data error:", err);
      setError(err instanceof Error ? err.message : "データの取得に失敗しました");
    } finally {
      if (isRefresh) {
        setIsRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  }, [checkinManagement]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefetch = useCallback(() => fetchData(true), [fetchData]);

  return {
    currentGuests,
    todayStats,
    loading,
    isRefreshing,
    error,
    refetch: handleRefetch,
  };
}