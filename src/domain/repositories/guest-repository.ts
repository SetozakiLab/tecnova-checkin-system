// Domain Repository Interface: Guest Repository
// ゲストデータアクセスの抽象化インターフェース

import { GuestEntity, GuestWithStatus } from "@/domain/entities/guest";
import { GradeValue } from "@/domain/value-objects/grade";

export interface GuestSearchParams {
  page: number;
  limit: number;
  name?: string;
  grade?: GradeValue;
  isCheckedIn?: boolean;
}

export interface GuestSearchResult {
  guests: GuestWithStatus[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateGuestParams {
  name: string;
  contact?: string;
  grade?: GradeValue;
}

export interface UpdateGuestParams {
  name?: string;
  contact?: string;
  grade?: GradeValue;
}

export interface IGuestRepository {
  /**
   * IDでゲストを検索
   */
  findById(id: string): Promise<GuestEntity | null>;

  /**
   * IDでゲストを検索（状態情報付き）
   */
  findByIdWithStatus(id: string): Promise<GuestWithStatus | null>;

  /**
   * 表示IDでゲストを検索
   */
  findByDisplayId(displayId: number): Promise<GuestEntity | null>;

  /**
   * 名前でゲストを検索（部分一致）
   */
  findByName(name: string): Promise<GuestEntity[]>;

  /**
   * ゲストリストを検索（ページネーション対応）
   */
  search(params: GuestSearchParams): Promise<GuestSearchResult>;

  /**
   * 現在チェックイン中のゲスト一覧を取得
   */
  findCurrentlyCheckedIn(): Promise<GuestWithStatus[]>;

  /**
   * ゲストを作成
   */
  create(params: CreateGuestParams): Promise<GuestEntity>;

  /**
   * ゲストを更新
   */
  update(id: string, params: UpdateGuestParams): Promise<GuestEntity>;

  /**
   * ゲストを削除（物理削除）
   */
  delete(id: string): Promise<void>;

  /**
   * 次の表示IDを取得
   */
  getNextDisplayId(): Promise<number>;

  /**
   * 総ゲスト数を取得
   */
  getTotalCount(): Promise<number>;
}