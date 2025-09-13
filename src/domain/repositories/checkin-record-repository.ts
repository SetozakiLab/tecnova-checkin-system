// Domain Repository Interface: CheckinRecord Repository
// チェックイン記録データアクセスの抽象化インターフェース

import {
  CheckinRecordEntity,
  CheckinRecordWithGuest,
} from "@/domain/entities/checkin-record";

export interface CheckinSearchParams {
  page: number;
  limit: number;
  startDate?: Date;
  endDate?: Date;
  guestId?: string;
  guestName?: string;
  isActive?: boolean;
}

export interface CheckinSearchResult {
  records: CheckinRecordWithGuest[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TodayStats {
  totalCheckins: number;
  currentGuests: number;
  averageStayTime: number;
}

export interface GuestDailyStatItem {
  date: string; // YYYY-MM-DD (JST)
  visitCount: number;
  stayMinutes: number; // 合計滞在分
}

export interface GuestDetailStats {
  guestId: string;
  totalVisitCount: number;
  totalStayMinutes: number;
  lastVisitAt: Date | null;
  isCurrentlyCheckedIn: boolean;
  daily: GuestDailyStatItem[]; // 直近30日
}

export interface ICheckinRecordRepository {
  /**
   * IDでチェックイン記録を検索
   */
  findById(id: string): Promise<CheckinRecordEntity | null>;

  /**
   * ゲストIDでアクティブなチェックイン記録を検索
   */
  findActiveByGuestId(guestId: string): Promise<CheckinRecordEntity | null>;

  /**
   * 現在チェックイン中の記録一覧を取得
   */
  findCurrentCheckins(): Promise<CheckinRecordWithGuest[]>;

  /**
   * チェックイン記録を検索（ページネーション対応）
   */
  search(params: CheckinSearchParams): Promise<CheckinSearchResult>;

  /**
   * 今日の統計データを取得
   */
  getTodayStats(): Promise<TodayStats>;

  /**
   * 指定期間の統計データを取得
   */
  getStatsForPeriod(startDate: Date, endDate: Date): Promise<TodayStats>;

  /**
   * チェックイン記録を作成
   */
  create(guestId: string): Promise<CheckinRecordEntity>;

  /**
   * チェックアウト処理
   */
  checkout(id: string): Promise<CheckinRecordEntity>;

  /**
   * チェックイン記録を削除（物理削除）
   */
  delete(id: string): Promise<void>;

  /**
   * ゲストの総来場回数を取得
   */
  getTotalVisitsByGuestId(guestId: string): Promise<number>;

  /**
   * ゲストの最後の来場日時を取得
   */
  getLastVisitByGuestId(guestId: string): Promise<Date | null>;

  /** 直近N日 (デフォルト30) の日次集計を取得 */
  getGuestDailyStats(
    guestId: string,
    days?: number
  ): Promise<GuestDailyStatItem[]>;

  /** 個別ゲスト詳細統計(集約) */
  getGuestDetailStats(
    guestId: string,
    days?: number
  ): Promise<GuestDetailStats>;
}
