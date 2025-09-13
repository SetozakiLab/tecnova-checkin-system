import { useState, useEffect } from "react";
import { CheckinRecord } from "@/types/api";

interface TodayStats {
  totalCheckins: number;
  currentGuests: number;
  averageStayTime: number;
}

interface UseDashboardDataReturn {
  currentGuests: CheckinRecord[];
  todayStats: TodayStats | null;
  loading: boolean;
  isRefreshing: boolean;
  error: string;
  refetch: () => Promise<void>;
}

export function useDashboardData(): UseDashboardDataReturn {
  const [currentGuests, setCurrentGuests] = useState<CheckinRecord[]>([]);
  const [todayStats, setTodayStats] = useState<TodayStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      setError("");

      const [guestsResponse, statsResponse] = await Promise.all([
        fetch("/api/admin/dashboard/current-guests"),
        fetch("/api/admin/dashboard/today-stats"),
      ]);

      const [guestsResult, statsResult] = await Promise.all([
        guestsResponse.json(),
        statsResponse.json(),
      ]);

      if (!guestsResult.success) {
        setError("現在の滞在者データの取得に失敗しました");
        return;
      }

      if (!statsResult.success) {
        setError("統計データの取得に失敗しました");
        return;
      }

      setCurrentGuests(guestsResult.data);
      setTodayStats(statsResult.data);
    } catch (err) {
      console.error("Fetch data error:", err);
      setError("データの取得に失敗しました");
    } finally {
      if (isRefresh) {
        setIsRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefetch = () => fetchData(true);

  return {
    currentGuests,
    todayStats,
    loading,
    isRefreshing,
    error,
    refetch: handleRefetch,
  };
}
