import { useState, useCallback } from "react";
import { useApi } from "./use-api";
import { GuestData } from "@/types/api";

interface UseGuestSearchReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: GuestData[];
  selectedGuest: GuestData | null;
  setSelectedGuest: (guest: GuestData | null) => void;
  loading: boolean;
  error: string;
  handleSearch: () => Promise<void>;
  reset: () => void;
}

export function useGuestSearch(): UseGuestSearchReturn {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GuestData[]>([]);
  const [selectedGuest, setSelectedGuest] = useState<GuestData | null>(null);
  const { loading, error, execute, reset: resetApi } = useApi<GuestData[]>();

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      return;
    }

    const result = await execute(
      `/api/guests/search?q=${encodeURIComponent(searchQuery)}`
    );

    if (result) {
      setSearchResults(result);
      if (result.length === 1) {
        setSelectedGuest(result[0]);
      } else {
        setSelectedGuest(null);
      }
    } else {
      setSearchResults([]);
      setSelectedGuest(null);
    }
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
    handleSearch,
    reset,
  };
}
