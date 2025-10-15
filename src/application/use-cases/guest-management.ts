// Application Use Case: Guest Management
// ゲスト管理に関するアプリケーションロジック

import {
  GuestDomainService,
  type GuestEntity,
  type GuestWithStatus,
} from "@/domain/entities/guest";
import type { ICheckinRecordRepository } from "@/domain/repositories/checkin-record-repository";
import type {
  CreateGuestParams,
  GuestSearchParams,
  IGuestRepository,
  UpdateGuestParams,
} from "@/domain/repositories/guest-repository";
import { Grade } from "@/domain/value-objects/grade";

export class GuestManagementUseCase {
  constructor(
    private readonly guestRepository: IGuestRepository,
    private readonly checkinRecordRepository: ICheckinRecordRepository,
  ) {}

  /**
   * ゲストを作成
   */
  async createGuest(
    params: CreateGuestParams,
  ): Promise<{ success: boolean; guest?: GuestEntity; error?: string }> {
    // ドメインバリデーション
    const nameValidation = GuestDomainService.validateName(params.name);
    if (!nameValidation.isValid) {
      return { success: false, error: nameValidation.error };
    }

    const contactValidation = GuestDomainService.validateContact(
      params.contact,
    );
    if (!contactValidation.isValid) {
      return { success: false, error: contactValidation.error };
    }

    // 学年バリデーション
    if (params.grade && !Grade.fromString(params.grade)) {
      return { success: false, error: "無効な学年が指定されています" };
    }

    try {
      const guest = await this.guestRepository.create(params);
      return { success: true, guest };
    } catch (error) {
      console.error("Create guest error:", error);
      return { success: false, error: "ゲストの作成に失敗しました" };
    }
  }

  /**
   * ゲストを更新
   */
  async updateGuest(
    id: string,
    params: UpdateGuestParams,
  ): Promise<{ success: boolean; guest?: GuestEntity; error?: string }> {
    // 既存ゲストの確認
    const existingGuest = await this.guestRepository.findById(id);
    if (!existingGuest) {
      return { success: false, error: "ゲストが見つかりません" };
    }

    // ドメインバリデーション
    if (params.name !== undefined) {
      const nameValidation = GuestDomainService.validateName(params.name);
      if (!nameValidation.isValid) {
        return { success: false, error: nameValidation.error };
      }
    }

    if (params.contact !== undefined) {
      const contactValidation = GuestDomainService.validateContact(
        params.contact,
      );
      if (!contactValidation.isValid) {
        return { success: false, error: contactValidation.error };
      }
    }

    if (params.grade && !Grade.fromString(params.grade)) {
      return { success: false, error: "無効な学年が指定されています" };
    }

    try {
      const updatedGuest = await this.guestRepository.update(id, params);
      return { success: true, guest: updatedGuest };
    } catch (error) {
      console.error("Update guest error:", error);
      return { success: false, error: "ゲストの更新に失敗しました" };
    }
  }

  /**
   * ゲストを削除
   */
  async deleteGuest(id: string): Promise<{ success: boolean; error?: string }> {
    // 既存ゲストの確認
    const existingGuest = await this.guestRepository.findByIdWithStatus(id);
    if (!existingGuest) {
      return { success: false, error: "ゲストが見つかりません" };
    }

    // チェックイン中の場合は削除不可
    if (existingGuest.isCurrentlyCheckedIn) {
      return {
        success: false,
        error: "チェックイン中のゲストは削除できません",
      };
    }

    try {
      await this.guestRepository.delete(id);
      return { success: true };
    } catch (error) {
      console.error("Delete guest error:", error);
      return { success: false, error: "ゲストの削除に失敗しました" };
    }
  }

  /**
   * ゲストを検索
   */
  async searchGuests(params: GuestSearchParams) {
    try {
      return await this.guestRepository.search(params);
    } catch (error) {
      console.error("Search guests error:", error);
      throw new Error("ゲストの検索に失敗しました");
    }
  }

  /**
   * ゲストを取得（詳細情報付き）
   */
  async getGuestWithStatus(id: string): Promise<GuestWithStatus | null> {
    try {
      return await this.guestRepository.findByIdWithStatus(id);
    } catch (error) {
      console.error("Get guest with status error:", error);
      return null;
    }
  }

  /**
   * 名前でゲストを検索（チェックイン画面用）
   */
  async findGuestsByName(name: string): Promise<GuestEntity[]> {
    if (!name || name.trim().length === 0) {
      return [];
    }

    try {
      return await this.guestRepository.findByName(name.trim());
    } catch (error) {
      console.error("Find guests by name error:", error);
      return [];
    }
  }

  /**
   * 表示IDでゲストを検索
   */
  async findGuestByDisplayId(displayId: number): Promise<GuestEntity | null> {
    try {
      return await this.guestRepository.findByDisplayId(displayId);
    } catch (error) {
      console.error("Find guest by display ID error:", error);
      return null;
    }
  }

  /** ゲスト詳細統計 */
  async getGuestDetailStats(guestId: string, days: number = 30) {
    try {
      const guest = await this.guestRepository.findByIdWithStatus(guestId);
      if (!guest) return null;
      const stats = await this.checkinRecordRepository.getGuestDetailStats(
        guestId,
        days,
      );
      return { guest, stats };
    } catch (error) {
      console.error("Get guest detail stats error:", error);
      return null;
    }
  }
}
