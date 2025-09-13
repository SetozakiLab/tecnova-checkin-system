// Application: Guest Management Hook with Clean Architecture
// ゲスト管理 - クリーンアーキテクチャ版

import { useState, useCallback } from "react";
import { useGuestManagement as useGuestManagementContainer } from "@/infrastructure/container";
import { GuestWithStatus } from "@/domain/entities/guest";
import { GuestSearchParams } from "@/domain/repositories/guest-repository";
import { CreateGuestParams, UpdateGuestParams } from "@/domain/repositories/guest-repository";

interface UseGuestManagementReturn {
  guests: GuestWithStatus[];
  loading: boolean;
  error: string;
  totalCount: number;
  totalPages: number;
  currentPage: number;
  searchGuests: (params: GuestSearchParams) => Promise<void>;
  createGuest: (params: CreateGuestParams) => Promise<{ success: boolean; error?: string }>;
  updateGuest: (id: string, params: UpdateGuestParams) => Promise<{ success: boolean; error?: string }>;
  deleteGuest: (id: string) => Promise<{ success: boolean; error?: string }>;
  findGuestsByName: (name: string) => Promise<GuestWithStatus[]>;
}

export function useGuestManagement(): UseGuestManagementReturn {
  const guestManagement = useGuestManagementContainer();
  
  const [guests, setGuests] = useState<GuestWithStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const searchGuests = useCallback(async (params: GuestSearchParams) => {
    try {
      setLoading(true);
      setError("");
      
      const result = await guestManagement.searchGuests(params);
      
      setGuests(result.guests);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
      setCurrentPage(result.page);
    } catch (err) {
      console.error("Search guests error:", err);
      setError(err instanceof Error ? err.message : "ゲストの検索に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [guestManagement]);

  const createGuest = useCallback(async (params: CreateGuestParams) => {
    try {
      setError("");
      const result = await guestManagement.createGuest(params);
      
      if (result.success) {
        // 現在のページを再読み込み
        await searchGuests({ page: currentPage, limit: 10 });
      }
      
      return { success: result.success, error: result.error };
    } catch (err) {
      console.error("Create guest error:", err);
      const errorMessage = err instanceof Error ? err.message : "ゲストの作成に失敗しました";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [guestManagement, searchGuests, currentPage]);

  const updateGuest = useCallback(async (id: string, params: UpdateGuestParams) => {
    try {
      setError("");
      const result = await guestManagement.updateGuest(id, params);
      
      if (result.success) {
        // 現在のページを再読み込み
        await searchGuests({ page: currentPage, limit: 10 });
      }
      
      return { success: result.success, error: result.error };
    } catch (err) {
      console.error("Update guest error:", err);
      const errorMessage = err instanceof Error ? err.message : "ゲストの更新に失敗しました";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [guestManagement, searchGuests, currentPage]);

  const deleteGuest = useCallback(async (id: string) => {
    try {
      setError("");
      const result = await guestManagement.deleteGuest(id);
      
      if (result.success) {
        // 現在のページを再読み込み
        await searchGuests({ page: currentPage, limit: 10 });
      }
      
      return { success: result.success, error: result.error };
    } catch (err) {
      console.error("Delete guest error:", err);
      const errorMessage = err instanceof Error ? err.message : "ゲストの削除に失敗しました";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [guestManagement, searchGuests, currentPage]);

  const findGuestsByName = useCallback(async (name: string): Promise<GuestWithStatus[]> => {
    try {
      setError("");
      const foundGuests = await guestManagement.findGuestsByName(name);
      
      // GuestEntity[]をGuestWithStatus[]に変換（簡易版）
      // 実際のアプリでは、個別にゲスト詳細を取得する必要がある場合がある
      const guestsWithStatus: GuestWithStatus[] = await Promise.all(
        foundGuests.map(async (guest) => {
          const guestWithStatus = await guestManagement.getGuestWithStatus(guest.id);
          return guestWithStatus || {
            ...guest,
            isCurrentlyCheckedIn: false,
            totalVisits: 0,
            lastVisitAt: null,
            lastCheckinAt: null,
          };
        })
      );
      
      return guestsWithStatus;
    } catch (err) {
      console.error("Find guests by name error:", err);
      setError(err instanceof Error ? err.message : "ゲストの検索に失敗しました");
      return [];
    }
  }, [guestManagement]);

  return {
    guests,
    loading,
    error,
    totalCount,
    totalPages,
    currentPage,
    searchGuests,
    createGuest,
    updateGuest,
    deleteGuest,
    findGuestsByName,
  };
}