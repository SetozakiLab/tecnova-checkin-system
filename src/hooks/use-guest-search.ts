import { useState, useCallback } from "react";
import { useEnhancedApi } from "./use-enhanced-api";
import { GuestData } from "@/types/api";

interface UseGuestSearchReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: GuestData[];
  selectedGuest: GuestData | null;
  setSelectedGuest: (guest: GuestData | null) => void;
  loading: boolean;
  error: string;
  success: boolean;
  handleSearch: () => Promise<void>;
  reset: () => void;
  refetch: () => Promise<void>;
}

export function useGuestSearch(): UseGuestSearchReturn {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GuestData[]>([]);
  const [selectedGuest, setSelectedGuest] = useState<GuestData | null>(null);
  
  const { loading, error, success, execute, reset: resetApi, refetch } = useEnhancedApi<GuestData[]>({
    onSuccess: (results) => {
      setSearchResults(results);
      if (results.length === 1) {
        setSelectedGuest(results[0]);
      } else {
        setSelectedGuest(null);
      }
    },
    onError: () => {
      setSearchResults([]);
      setSelectedGuest(null);
    },
  });

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      return;
    }

    await execute(
      `/api/guests/search?q=${encodeURIComponent(searchQuery)}`
    );
  }, [searchQuery, execute]);

  const reset = useCallback(() => {
    setSearchQuery("");
    setSearchResults([]);
    setSelectedGuest(null);
    resetApi();
  }, [resetApi]);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    selectedGuest,
    setSelectedGuest,
    loading,
    error,
    success,
    handleSearch,
    reset,
    refetch,
  };
}
