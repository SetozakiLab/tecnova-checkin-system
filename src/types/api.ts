// API レスポンスの型定義
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Array<{
      field: string;
      message: string;
    }>;
  };
  message?: string;
}

// ゲスト関連の型定義
export interface Guest {
  id: string;
  displayId: number;
  name: string;
  contact?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface GuestWithStatus extends Guest {
  isCurrentlyCheckedIn: boolean;
  currentCheckinId?: string | null;
  lastCheckinAt?: Date | null;
  totalVisits?: number;
  lastVisitAt?: Date | null;
}

export interface GuestSearchResult {
  id: string;
  displayId: number;
  name: string;
  isCurrentlyCheckedIn: boolean;
  lastCheckinAt?: Date | null;
}

// チェックイン記録の型定義
export interface CheckinRecord {
  id: string;
  guestId: string;
  checkinAt: Date;
  checkoutAt?: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CheckinRecordWithGuest extends CheckinRecord {
  guest: Guest;
}

export interface CheckinRecordWithDuration extends CheckinRecord {
  stayDuration?: string;
}

export interface CheckinRecordDetail extends CheckinRecord {
  guest: Guest;
  stayDuration?: string;
}

// ダッシュボード関連の型定義
export interface CurrentGuest {
  id: string;
  displayId: number;
  name: string;
  checkinAt: Date;
  stayDuration: string;
}

export interface TodayStats {
  date: string;
  totalVisitors: number;
  currentGuests: number;
  totalCheckins: number;
  totalCheckouts: number;
  averageStayTime: string;
  peakTime: string;
  peakCount: number;
}

// ページネーション関連の型定義
export interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

// WebSocket関連の型定義
export interface WebSocketMessage {
  type: "GUEST_CHECKED_IN" | "GUEST_CHECKED_OUT" | "CURRENT_GUESTS_UPDATE";
  data: Record<string, unknown>;
}

export interface GuestCheckedInMessage extends WebSocketMessage {
  type: "GUEST_CHECKED_IN";
  data: {
    guestId: string;
    guestName: string;
    checkinAt: Date;
  };
}

export interface GuestCheckedOutMessage extends WebSocketMessage {
  type: "GUEST_CHECKED_OUT";
  data: {
    guestId: string;
    guestName: string;
    checkoutAt: Date;
    stayDuration: string;
  };
}

export interface CurrentGuestsUpdateMessage extends WebSocketMessage {
  type: "CURRENT_GUESTS_UPDATE";
  data: {
    totalCount: number;
    guests: CurrentGuest[];
  };
}
