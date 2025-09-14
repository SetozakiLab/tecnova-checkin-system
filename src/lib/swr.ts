import { PublicConfiguration } from "swr/_internal";

export const swrFetcher = async <T = unknown>(url: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  const json = await res.json();
  return (json?.data ?? json) as T;
};

export const baseSWRConfig: Partial<PublicConfiguration> = {
  fetcher: swrFetcher,
  revalidateOnFocus: false,
  dedupingInterval: 30_000, // 同一キー短時間重複防止
  refreshInterval: 60_000, // 1分毎に自動再取得
  shouldRetryOnError: true,
  errorRetryCount: 2,
};
