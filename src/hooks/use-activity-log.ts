import useSWR from "swr";
import { useCallback, useMemo } from "react";

interface ActivityLogRow {
  id: string;
  guestId: string;
  categories: string[];
  description?: string;
  mentorNote?: string;
  timeslotStart: string;
}

interface GuestColumn {
  guestId: string;
  name?: string;
  displayId?: number;
  grade?: string | null;
  checkinAt?: string | null;
  checkoutAt?: string | null;
  isActive?: boolean;
}

interface UseActivityLogResult {
  logs: ActivityLogRow[];
  guests: GuestColumn[];
  isLoading: boolean;
  error?: string;
  refresh: () => void;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Fetch failed");
  const json = await res.json();
  return json?.data ?? [];
};

export function useActivityLog(date: string): UseActivityLogResult {
  // YYYY-MM-DD で今日か判定
  const isToday = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    return date === todayStr;
  }, [date]);
  const {
    data: logsData,
    isLoading: loadingLogs,
    error: errorLogs,
    mutate: mutateLogs,
  } = useSWR<ActivityLogRow[]>(
    `/api/admin/activity-logs?date=${date}`,
    fetcher,
    { revalidateOnFocus: false }
  );
  const {
    data: guestsData,
    isLoading: loadingGuests,
    error: errorGuests,
    mutate: mutateGuests,
  } = useSWR<GuestColumn[]>(
    isToday
      ? `/api/checkins/today?date=${date}`
      : `/api/checkins/by-date?date=${date}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  const refresh = useCallback(() => {
    mutateLogs();
    mutateGuests();
  }, [mutateLogs, mutateGuests]);

  return {
    logs: logsData || [],
    guests: guestsData || [],
    isLoading: loadingLogs || loadingGuests,
    error: errorLogs?.message || errorGuests?.message,
    refresh,
  };
}
