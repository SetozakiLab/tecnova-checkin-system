"use client";
import React, { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Loader2 } from "lucide-react";

const categories = ["STUDY", "MEETING", "EVENT", "PROJECT", "OTHER"] as const;

interface ActivityLogRow {
  id: string;
  guestId: string;
  category: string;
  description: string;
  timeslotStart: string; // ISO
}

interface GuestColumn {
  guestId: string;
  name?: string;
}

export default function ActivityLogPage() {
  const [date, setDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [logs, setLogs] = useState<ActivityLogRow[]>([]);
  const [currentGuests, setCurrentGuests] = useState<GuestColumn[]>([]);
  const [loading, setLoading] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<ActivityLogRow | null>(null);
  const [formGuestId, setFormGuestId] = useState("");
  const [formTime, setFormTime] = useState("00:00");
  const [formCategory, setFormCategory] = useState<string>("STUDY");
  const [formDescription, setFormDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");

  // 00:00 から 23:30 まで 30分刻み
  const timeSlots = useMemo(() => {
    const arr: string[] = [];
    for (let h = 0; h < 24; h++) {
      for (let m of [0, 30]) {
        arr.push(`${String(h).padStart(2, "0")}:${m === 0 ? "00" : "30"}`);
      }
    }
    return arr;
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [logsRes, guestsRes] = await Promise.all([
        fetch(`/api/admin/activity-logs?date=${date}`),
        fetch(`/api/checkins/current`), // 正しい現在チェックイン中ゲスト API
      ]);

      // 安全なJSONパース (非JSONの場合は空オブジェクト)
      async function safeJson(res: Response) {
        const ct = res.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
          try {
            return await res.json();
          } catch {
            return {};
          }
        }
        return {};
      }

      const logsJson = await safeJson(logsRes);
      const guestsJson = await safeJson(guestsRes);

      if (logsRes.ok) {
        const data =
          logsJson && typeof logsJson === "object" && "data" in logsJson
            ? ((logsJson as { data?: unknown }).data as ActivityLogRow[])
            : [];
        setLogs(Array.isArray(data) ? data : []);
      } else {
        console.warn("Failed to load logs", logsRes.status);
      }
      if (guestsRes.ok) {
        const rawGuests =
          guestsJson && typeof guestsJson === "object" && "data" in guestsJson
            ? ((guestsJson as { data?: unknown }).data as unknown[])
            : [];
        const mapped = rawGuests.filter(Boolean).map((g) => {
          const obj = g as {
            guestId?: string;
            id?: string;
            guestName?: string;
            name?: string;
          };
          return {
            guestId: obj.guestId || obj.id || "",
            name: obj.guestName || obj.name,
          };
        });
        setCurrentGuests(mapped);
      } else {
        console.warn("Failed to load current guests", guestsRes.status);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  function openNew(slot: string, guestId: string) {
    setEditing(null);
    setFormGuestId(guestId);
    setFormTime(slot);
    setFormCategory("STUDY");
    setFormDescription("");
    setError("");
    setSheetOpen(true);
  }

  function openEdit(log: ActivityLogRow) {
    const d = new Date(log.timeslotStart);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    setEditing(log);
    setFormGuestId(log.guestId);
    setFormTime(`${hh}:${mm}`);
    setFormCategory(log.category);
    setFormDescription(log.description);
    setError("");
    setSheetOpen(true);
  }

  function slotIso(dateStr: string, timeHHMM: string) {
    return new Date(`${dateStr}T${timeHHMM}:00+09:00`).toISOString();
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      const timestamp = slotIso(date, formTime);
      const res = await fetch("/api/admin/activity-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestId: formGuestId,
          category: formCategory,
          description: formDescription,
          timestamp,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error?.message || "保存失敗");
        return;
      }
      setSheetOpen(false);
      await fetchData();
    } catch {
      setError("通信エラー");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!editing) return;
    if (!(typeof window !== "undefined" && window.confirm("削除しますか?")))
      return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/activity-logs/${editing.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error?.message || "削除失敗");
        return;
      }
      setSheetOpen(false);
      await fetchData();
    } catch {
      setError("通信エラー");
    } finally {
      setSaving(false);
    }
  }

  // guestId+time でログ探索
  function findLog(guestId: string, slot: string) {
    return logs.find((l) => {
      const d = new Date(l.timeslotStart);
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      return l.guestId === guestId && `${hh}:${mm}` === slot;
    });
  }

  return (
    <AdminLayout title="活動ログ">
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex items-center justify-between space-y-0">
            <CardTitle className="text-lg">活動ログ (30分グリッド)</CardTitle>
            <div className="flex items-center gap-3">
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <Button size="sm" variant="outline" onClick={fetchData}>
                再読込
              </Button>
            </div>
          </CardHeader>
          <CardContent className="overflow-auto">
            <div className="min-w-[900px]">
              {/* ヘッダ行 */}
              <div
                className="grid"
                style={{
                  gridTemplateColumns: `100px repeat(${currentGuests.length}, 1fr)`,
                }}
              >
                <div className="text-xs font-semibold p-2 bg-muted sticky left-0 z-10">
                  Time
                </div>
                {currentGuests.map((g) => (
                  <div
                    key={g.guestId}
                    className="text-xs font-semibold p-2 bg-muted text-center truncate"
                    title={g.name || g.guestId}
                  >
                    {g.name || g.guestId.slice(0, 8)}
                  </div>
                ))}
              </div>
              <div className="max-h-[600px] overflow-y-auto border border-t-0 rounded-b-md">
                {loading && (
                  <div className="p-4 text-sm flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> 読み込み中...
                  </div>
                )}
                {!loading &&
                  timeSlots.map((slot) => (
                    <div
                      key={slot}
                      className="grid border-t"
                      style={{
                        gridTemplateColumns: `100px repeat(${currentGuests.length}, 1fr)`,
                      }}
                    >
                      <div className="text-xs p-1.5 bg-background sticky left-0 z-10 border-r font-mono">
                        {slot}
                      </div>
                      {currentGuests.map((g) => {
                        const log = findLog(g.guestId, slot);
                        return (
                          <button
                            key={g.guestId + slot}
                            onClick={() =>
                              log ? openEdit(log) : openNew(slot, g.guestId)
                            }
                            className={
                              "relative p-1.5 text-left text-[10px] border-r border-l last:border-r-0 min-h-[40px] group hover:bg-accent transition " +
                              (log ? "bg-primary/10" : "")
                            }
                          >
                            {log && (
                              <div className="space-y-1">
                                <div className="font-semibold text-[10px] tracking-tight">
                                  {log.category}
                                </div>
                                <div className="line-clamp-2 leading-snug">
                                  {log.description}
                                </div>
                              </div>
                            )}
                            {!log && (
                              <span className="opacity-40 group-hover:opacity-70">
                                ＋
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-[380px] sm:w-[420px]">
          <SheetHeader>
            <SheetTitle>{editing ? "活動ログ編集" : "活動ログ追加"}</SheetTitle>
          </SheetHeader>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1">ゲストID</label>
              <Input
                value={formGuestId}
                onChange={(e) => setFormGuestId(e.target.value)}
                readOnly={!!editing}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">
                時刻 (JST)
              </label>
              <Input
                type="time"
                value={formTime}
                onChange={(e) => setFormTime(e.target.value)}
                step={1800}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">カテゴリ</label>
              <Select
                value={formCategory}
                onValueChange={(v: string) => setFormCategory(v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">説明</label>
              <Textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                maxLength={100}
              />
              <div className="text-[10px] text-muted-foreground text-right">
                {formDescription.length}/100
              </div>
            </div>
            {error && <div className="text-xs text-destructive">{error}</div>}
          </div>
          <SheetFooter className="p-4">
            <div className="flex w-full gap-2">
              {editing && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={remove}
                  disabled={saving}
                  className="flex-1"
                >
                  削除
                </Button>
              )}
              <Button
                type="button"
                onClick={save}
                disabled={saving}
                className="flex-1"
              >
                {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                保存
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </AdminLayout>
  );
}
