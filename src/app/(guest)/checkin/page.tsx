"use client";

import { useState } from "react";
import Link from "next/link";
import { GuestSearch } from "@/components/features/checkin/guest-search";
import { CheckinActions } from "@/components/features/checkin/checkin-actions";
import { ErrorState } from "@/components/shared/error-state";
import { GuestData } from "@/types/api";

export default function CheckinPage() {
  const [selectedGuest, setSelectedGuest] = useState<GuestData | null>(null);
  const [error, setError] = useState("");

  const handleGuestSelect = (guest: GuestData) => {
    setSelectedGuest(guest);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <h1 className="text-4xl font-bold text-indigo-800">tec-nova</h1>
            <p className="text-lg text-indigo-600">入退場管理システム</p>
          </Link>
          <h2 className="text-2xl font-bold text-gray-800">入退場手続き</h2>
        </div>

        <div className="space-y-6">
          <GuestSearch onGuestSelect={handleGuestSelect} />

          {error && <ErrorState message={error} />}

          {selectedGuest && <CheckinActions guest={selectedGuest} />}
        </div>

        {/* フッター */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            トップページに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
