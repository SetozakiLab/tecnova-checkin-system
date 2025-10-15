import useSWR, { type BareFetcher, type SWRConfiguration } from "swr";
import { baseSWRConfig, swrFetcher } from "@/lib/swr";

export interface TodayGuestItem {
  guestId: string;
  name?: string;
  displayId?: number;
  grade?: string | null;
}

export function useTodayGuests(date: string) {
  const key = `/api/checkins/today?date=${date}` as const;
  // 型特化 fetcher
  const fetcher: BareFetcher<TodayGuestItem[]> = (url: string) =>
    swrFetcher<TodayGuestItem[]>(url);
  const config: SWRConfiguration<
    TodayGuestItem[],
    unknown,
    BareFetcher<TodayGuestItem[]>
  > = {
    ...baseSWRConfig,
    fetcher,
  } as SWRConfiguration<
    TodayGuestItem[],
    unknown,
    BareFetcher<TodayGuestItem[]>
  >; // baseSWRConfig 部分型拡張
  const { data, error, isLoading, mutate } = useSWR<TodayGuestItem[]>(
    key,
    fetcher,
    config,
  );
  return {
    guests: data || [],
    isLoading,
    error,
    refresh: () => mutate(),
    mutate,
  };
}
