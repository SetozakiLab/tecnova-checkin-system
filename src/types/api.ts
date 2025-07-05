export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: Array<{
      field: string;
      message: string;
    }>;
  };
}

export interface PaginationData {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

export interface GuestData {
  id: string;
  displayId: number;
  name: string;
  contact?: string | null;
  isCurrentlyCheckedIn?: boolean;
  currentCheckinId?: string | null;
  lastCheckinAt?: string | null;
  totalVisits?: number;
  lastVisitAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface CheckinRecordData {
  id: string;
  guestId: string;
  guestName?: string;
  guest?: GuestData;
  checkinAt: string;
  checkoutAt?: string | null;
  stayDuration?: string;
  isActive: boolean;
}

export interface CheckinData {
  id: string;
  guestId: string;
  guestName: string;
  guestDisplayId: number;
  checkinAt: string;
  checkoutAt?: string | null;
  isActive: boolean;
}

export interface CheckinRecord {
  id: string;
  guestId: string;
  guestName: string;
  guestDisplayId: number;
  checkinAt: string;
  checkoutAt?: string | null;
  isActive: boolean;
  duration?: number | null;
}
