// Application Use Case: Checkin Management
// チェックイン・チェックアウト管理に関するアプリケーションロジック

import {
  CheckinRecordDomainService,
  type CheckinRecordEntity,
  type CheckinRecordWithGuest,
} from "@/domain/entities/checkin-record";
import { GuestDomainService } from "@/domain/entities/guest";
import type {
  CheckinSearchParams,
  ICheckinRecordRepository,
  TodayStats,
} from "@/domain/repositories/checkin-record-repository";
import type { IGuestRepository } from "@/domain/repositories/guest-repository";

export class CheckinManagementUseCase {
  constructor(
    private readonly guestRepository: IGuestRepository,
    private readonly checkinRecordRepository: ICheckinRecordRepository,
  ) {}

  /**
   * チェックイン処理
   */
  async checkinGuest(guestId: string): Promise<{
    success: boolean;
    record?: CheckinRecordEntity;
    error?: string;
  }> {
    try {
      // ゲストの存在と状態を確認
      const guest = await this.guestRepository.findByIdWithStatus(guestId);
      if (!guest) {
        return { success: false, error: "ゲストが見つかりません" };
      }

      // チェックイン可能性をドメインロジックで判定
      const canCheckin = GuestDomainService.canCheckin(guest);
      if (!canCheckin.canCheckin) {
        return { success: false, error: canCheckin.reason };
      }

      // チェックイン記録作成
      const record = await this.checkinRecordRepository.create(guestId);
      return { success: true, record };
    } catch (error) {
      console.error("Checkin error:", error);
      return { success: false, error: "チェックインに失敗しました" };
    }
  }

  /**
   * チェックアウト処理
   */
  async checkoutGuest(guestId: string): Promise<{
    success: boolean;
    record?: CheckinRecordEntity;
    error?: string;
  }> {
    try {
      // アクティブなチェックイン記録を検索
      const activeRecord =
        await this.checkinRecordRepository.findActiveByGuestId(guestId);
      if (!activeRecord) {
        return {
          success: false,
          error: "アクティブなチェックイン記録が見つかりません",
        };
      }

      // チェックアウト可能性をドメインロジックで判定
      const canCheckout = CheckinRecordDomainService.canCheckout(activeRecord);
      if (!canCheckout.canCheckout) {
        return { success: false, error: canCheckout.reason };
      }

      // チェックアウト処理
      const updatedRecord = await this.checkinRecordRepository.checkout(
        activeRecord.id,
      );
      return { success: true, record: updatedRecord };
    } catch (error) {
      console.error("Checkout error:", error);
      return { success: false, error: "チェックアウトに失敗しました" };
    }
  }

  /**
   * 記録IDでチェックアウト処理
   */
  async checkoutByRecordId(recordId: string): Promise<{
    success: boolean;
    record?: CheckinRecordEntity;
    error?: string;
  }> {
    try {
      // チェックイン記録を取得
      const record = await this.checkinRecordRepository.findById(recordId);
      if (!record) {
        return { success: false, error: "チェックイン記録が見つかりません" };
      }

      // チェックアウト可能性をドメインロジックで判定
      const canCheckout = CheckinRecordDomainService.canCheckout(record);
      if (!canCheckout.canCheckout) {
        return { success: false, error: canCheckout.reason };
      }

      // チェックアウト処理
      const updatedRecord =
        await this.checkinRecordRepository.checkout(recordId);
      return { success: true, record: updatedRecord };
    } catch (error) {
      console.error("Checkout by record ID error:", error);
      return { success: false, error: "チェックアウトに失敗しました" };
    }
  }

  /**
   * 現在チェックイン中のゲスト一覧を取得
   */
  async getCurrentGuests(): Promise<CheckinRecordWithGuest[]> {
    try {
      // リポジトリで guestGrade / totalVisitCount / totalStayMinutes を拡張済み
      return await this.checkinRecordRepository.findCurrentCheckins();
    } catch (error) {
      console.error("Get current guests error:", error);
      return [];
    }
  }

  /**
   * チェックイン履歴を検索
   */
  async searchCheckinHistory(params: CheckinSearchParams) {
    try {
      return await this.checkinRecordRepository.search(params);
    } catch (error) {
      console.error("Search checkin history error:", error);
      throw new Error("チェックイン履歴の検索に失敗しました");
    }
  }

  /**
   * 今日の統計データを取得
   */
  async getTodayStats(): Promise<TodayStats> {
    try {
      return await this.checkinRecordRepository.getTodayStats();
    } catch (error) {
      console.error("Get today stats error:", error);
      return {
        totalCheckins: 0,
        currentGuests: 0,
        averageStayTime: 0,
      };
    }
  }

  /**
   * 指定期間の統計データを取得
   */
  async getStatsForPeriod(startDate: Date, endDate: Date): Promise<TodayStats> {
    try {
      return await this.checkinRecordRepository.getStatsForPeriod(
        startDate,
        endDate,
      );
    } catch (error) {
      console.error("Get stats for period error:", error);
      return {
        totalCheckins: 0,
        currentGuests: 0,
        averageStayTime: 0,
      };
    }
  }

  /**
   * チェックイン記録を削除（管理者のみ）
   */
  async deleteCheckinRecord(
    recordId: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const record = await this.checkinRecordRepository.findById(recordId);
      if (!record) {
        return { success: false, error: "チェックイン記録が見つかりません" };
      }

      await this.checkinRecordRepository.delete(recordId);
      return { success: true };
    } catch (error) {
      console.error("Delete checkin record error:", error);
      return { success: false, error: "チェックイン記録の削除に失敗しました" };
    }
  }

  /**
   * ゲストの来場統計を取得
   */
  async getGuestVisitStats(
    guestId: string,
  ): Promise<{ totalVisits: number; lastVisit: Date | null }> {
    try {
      const [totalVisits, lastVisit] = await Promise.all([
        this.checkinRecordRepository.getTotalVisitsByGuestId(guestId),
        this.checkinRecordRepository.getLastVisitByGuestId(guestId),
      ]);

      return { totalVisits, lastVisit };
    } catch (error) {
      console.error("Get guest visit stats error:", error);
      return { totalVisits: 0, lastVisit: null };
    }
  }
}
