"use client";

import { useEffect, useState } from "react";
// TODO: shadcn/uiのTableコンポーネントなどをインポート

async function getGuests() {
  const res = await fetch("/api/admin/guests");
  const data = await res.json();
  return data.data.guests;
}

export default function GuestManagementPage() {
  const [guests, setGuests] = useState([]);

  useEffect(() => {
    getGuests().then(setGuests);
  }, []);

  return (
    <div>
      <h1>ゲスト管理画面</h1>
      {/* TODO: shadcn/uiのTableを使ってゲスト一覧を表示 */}
      <pre>{JSON.stringify(guests, null, 2)}</pre>
    </div>
  );
}
