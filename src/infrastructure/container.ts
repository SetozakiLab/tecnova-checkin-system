// Infrastructure: Dependency Injection Container
// クリーンアーキテクチャの依存関係を管理

import { CheckinManagementUseCase } from "@/application/use-cases/checkin-management";
import { GuestManagementUseCase } from "@/application/use-cases/guest-management";
import type { ICheckinRecordRepository } from "@/domain/repositories/checkin-record-repository";
import type { IGuestRepository } from "@/domain/repositories/guest-repository";
import { PrismaCheckinRecordRepository } from "@/infrastructure/repositories/prisma-checkin-record-repository";
import { PrismaGuestRepository } from "@/infrastructure/repositories/prisma-guest-repository";

// シングルトンコンテナクラス
class DIContainer {
  private static instance: DIContainer;

  // Repository instances
  private _guestRepository?: IGuestRepository;
  private _checkinRecordRepository?: ICheckinRecordRepository;

  // Use Case instances
  private _guestManagementUseCase?: GuestManagementUseCase;
  private _checkinManagementUseCase?: CheckinManagementUseCase;

  private constructor() {}

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  // Repository getters
  get guestRepository(): IGuestRepository {
    if (!this._guestRepository) {
      this._guestRepository = new PrismaGuestRepository();
    }
    return this._guestRepository;
  }

  get checkinRecordRepository(): ICheckinRecordRepository {
    if (!this._checkinRecordRepository) {
      this._checkinRecordRepository = new PrismaCheckinRecordRepository();
    }
    return this._checkinRecordRepository;
  }

  // Use Case getters
  get guestManagementUseCase(): GuestManagementUseCase {
    if (!this._guestManagementUseCase) {
      this._guestManagementUseCase = new GuestManagementUseCase(
        this.guestRepository,
        this.checkinRecordRepository,
      );
    }
    return this._guestManagementUseCase;
  }

  get checkinManagementUseCase(): CheckinManagementUseCase {
    if (!this._checkinManagementUseCase) {
      this._checkinManagementUseCase = new CheckinManagementUseCase(
        this.guestRepository,
        this.checkinRecordRepository,
      );
    }
    return this._checkinManagementUseCase;
  }

  // テスト用のリセット機能
  reset(): void {
    this._guestRepository = undefined;
    this._checkinRecordRepository = undefined;
    this._guestManagementUseCase = undefined;
    this._checkinManagementUseCase = undefined;
  }
}

// エクスポート用のヘルパー関数
export const container = DIContainer.getInstance();

export const useGuestManagement = () => container.guestManagementUseCase;
export const useCheckinManagement = () => container.checkinManagementUseCase;
