// Infrastructure: Server-side Data Access
// サーバーサイドでの使用に適したデータアクセス関数

import type { GradeValue } from "@/domain/value-objects/grade";
import { container } from "@/infrastructure/container";

/**
 * サーバーコンポーネント用のデータ取得関数
 * これらの関数はサーバーサイドでのみ使用可能
 */

export async function getServerTodayStats() {
  const checkinManagement = container.checkinManagementUseCase;
  return await checkinManagement.getTodayStats();
}

export async function getServerCurrentGuests() {
  const checkinManagement = container.checkinManagementUseCase;
  return await checkinManagement.getCurrentGuests();
}

export async function getServerGuestSearch(params: {
  page: number;
  limit: number;
  name?: string;
  grade?: GradeValue;
}) {
  const guestManagement = container.guestManagementUseCase;
  return await guestManagement.searchGuests(params);
}

export async function getServerCheckinHistory(params: {
  page: number;
  limit: number;
  startDate?: Date;
  endDate?: Date;
  guestId?: string;
  guestName?: string;
}) {
  const checkinManagement = container.checkinManagementUseCase;
  return await checkinManagement.searchCheckinHistory(params);
}

export async function getServerGuestDetailStats(
  guestId: string,
  days: number = 30,
) {
  const guestManagement = container.guestManagementUseCase;
  return await guestManagement.getGuestDetailStats(guestId, days);
}
