// Domain Entity: CheckinRecord
// チェックイン記録ドメインエンティティ

export interface CheckinRecordEntity {
  readonly id: string;
  readonly guestId: string;
  readonly checkinAt: Date;
  readonly checkoutAt?: Date | null;
  readonly isActive: boolean;
}

export interface CheckinRecordWithGuest extends CheckinRecordEntity {
  readonly guestName: string;
  readonly guestDisplayId: number;
  // 学年（任意）
  readonly guestGrade?: string | null;
  // 累計訪問回数（本レコードを含む）
  readonly totalVisitCount?: number;
  // 累計滞在合計(分) ※チェックアウト済み訪問 + 進行中は現在時刻まで加算
  readonly totalStayMinutes?: number;
}

// ドメインサービス: チェックイン記録関連のビジネスルール
export class CheckinRecordDomainService {
  /**
   * 滞在時間を計算（分単位）
   */
  static calculateStayDuration(record: CheckinRecordEntity): number | null {
    if (!record.checkoutAt) {
      // チェックアウトしていない場合は現在時刻との差分
      return Math.floor(
        (Date.now() - record.checkinAt.getTime()) / (1000 * 60),
      );
    }

    return Math.floor(
      (record.checkoutAt.getTime() - record.checkinAt.getTime()) / (1000 * 60),
    );
  }

  /**
   * 滞在時間を人間が読みやすい形式に変換
   */
  static formatStayDuration(durationMinutes: number | null): string {
    if (durationMinutes === null) return "不明";

    if (durationMinutes < 60) {
      return `${durationMinutes}分`;
    }

    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    if (minutes === 0) {
      return `${hours}時間`;
    }

    return `${hours}時間${minutes}分`;
  }

  /**
   * チェックイン記録がアクティブかどうかを判定
   */
  static isActive(record: CheckinRecordEntity): boolean {
    return record.isActive && !record.checkoutAt;
  }

  /**
   * チェックアウト可能かどうかを判定
   */
  static canCheckout(record: CheckinRecordEntity): {
    canCheckout: boolean;
    reason?: string;
  } {
    if (!record.isActive) {
      return { canCheckout: false, reason: "非アクティブな記録です" };
    }

    if (record.checkoutAt) {
      return { canCheckout: false, reason: "既にチェックアウト済みです" };
    }

    return { canCheckout: true };
  }

  /**
   * 現在の滞在時間を取得（分単位）
   */
  static getCurrentStayDuration(record: CheckinRecordEntity): number {
    if (record.checkoutAt) {
      return Math.floor(
        (record.checkoutAt.getTime() - record.checkinAt.getTime()) /
          (1000 * 60),
      );
    }

    return Math.floor((Date.now() - record.checkinAt.getTime()) / (1000 * 60));
  }
}
