// Domain Entity: Guest
// ゲストドメインエンティティ - ビジネスルールと不変条件を含む

import { GradeValue } from "@/domain/value-objects/grade";

export interface GuestEntity {
  readonly id: string;
  readonly displayId: number;
  readonly name: string;
  readonly contact?: string | null;
  readonly grade?: GradeValue | null;
  readonly createdAt: Date;
  readonly updatedAt?: Date;
}

export interface GuestWithStatus extends GuestEntity {
  readonly isCurrentlyCheckedIn: boolean;
  readonly currentCheckinId?: string | null;
  readonly lastCheckinAt?: Date | null;
  readonly totalVisits: number;
  readonly lastVisitAt?: Date | null;
}

// ドメインサービス: ゲスト関連のビジネスルール
export class GuestDomainService {
  /**
   * ゲスト名のバリデーション
   */
  static validateName(name: string): { isValid: boolean; error?: string } {
    if (!name || name.trim().length === 0) {
      return { isValid: false, error: "名前は必須です" };
    }
    if (name.length > 50) {
      return { isValid: false, error: "名前は50文字以内で入力してください" };
    }
    return { isValid: true };
  }

  /**
   * 連絡先のバリデーション
   */
  static validateContact(contact?: string): { isValid: boolean; error?: string } {
    if (!contact || contact.trim().length === 0) {
      return { isValid: true }; // 連絡先は任意
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contact)) {
      return { isValid: false, error: "有効なメールアドレスを入力してください" };
    }
    
    return { isValid: true };
  }

  /**
   * ゲストがチェックイン可能かどうかを判定
   */
  static canCheckin(guest: GuestWithStatus): { canCheckin: boolean; reason?: string } {
    if (guest.isCurrentlyCheckedIn) {
      return { canCheckin: false, reason: "既にチェックイン済みです" };
    }
    return { canCheckin: true };
  }

  /**
   * ゲストがチェックアウト可能かどうかを判定
   */
  static canCheckout(guest: GuestWithStatus): { canCheckout: boolean; reason?: string } {
    if (!guest.isCurrentlyCheckedIn) {
      return { canCheckout: false, reason: "チェックインしていません" };
    }
    return { canCheckout: true };
  }
}