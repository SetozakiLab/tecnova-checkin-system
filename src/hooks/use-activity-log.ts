import useSWR from "swr";
import { useCallback } from "react";

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
  } = useSWR<GuestColumn[]>(`/api/checkins/today?date=${date}`, fetcher, {
    revalidateOnFocus: false,
  });

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
