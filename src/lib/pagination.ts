export interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

export function buildPagination(
  page: number,
  limit: number,
  totalCount: number
): PaginationInfo {
  return {
    page,
    limit,
    totalCount,
    totalPages: Math.max(1, Math.ceil(totalCount / limit)),
  };
}

export function coercePage(value: unknown, defaultValue = 1): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : defaultValue;
}

export function coerceLimit(
  value: unknown,
  defaultValue = 50,
  max = 100
): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return defaultValue;
  return Math.min(Math.floor(n), max);
}
