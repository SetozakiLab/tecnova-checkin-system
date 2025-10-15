"use client";
import { ChevronLeft, ChevronRight, Download, Loader2 } from "lucide-react";
import { useCallback, useId, useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  ACTIVITY_CATEGORIES,
  activityCategoryColorClasses,
  type activityCategoryLabels,
  formatActivityCategory,
} from "@/domain/activity-category";
import { formatGradeDisplay } from "@/domain/value-objects/grade";
import { useActivityLog } from "@/hooks/use-activity-log";
import { downloadCsv } from "@/lib/csv";
import { formatJST } from "@/lib/timezone";

const categories = ACTIVITY_CATEGORIES;

interface ActivityLogRow {
  id: string;
  guestId: string;
  categories: string[];
  description?: string;
  mentorNote?: string;
  timeslotStart: string;
}

export default function ActivityLogPage() {
  const scrollId = useId();
  const guestSelectId = useId();
  const timeInputId = useId();
  const categoryLabelId = useId();
  const descriptionId = useId();
  const mentorNoteId = useId();

  function shiftDate(base: string, delta: number) {
    // base: YYYY-MM-DD (JST想定) をUTC日付として安全にずらし ISO の最初10文字を返す
    // タイムゾーン差異で+/-2日飛ぶのを防ぐため常にUTC基準 00:00:00Z に固定
    const d = new Date(`${base}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + delta);
    return d.toISOString().slice(0, 10);
  }
  const [date, setDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10),
  );
  const {
    logs,
    guests: currentGuests,
    isLoading: loading,
    refresh,
  } = useActivityLog(date);
  const isToday = useMemo(
    () => new Date().toISOString().slice(0, 10) === date,
    [date],
  );
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<ActivityLogRow | null>(null);
  const [formGuestId, setFormGuestId] = useState("");
  const [formDisplayId, setFormDisplayId] = useState<number | undefined>();
  const [formTime, setFormTime] = useState("00:00");
  const [formCategories, setFormCategories] = useState<string[]>([]);
  const [formDescription, setFormDescription] = useState<string>("");
  const [formMentorNote, setFormMentorNote] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");

  const timeSlots = useMemo(() => {
    const arr: string[] = [];
    for (let h = 8; h <= 20; h++) {
      for (const m of [0, 30]) {
        if (h === 20 && m === 30) continue; // 20:30 不要
        arr.push(`${String(h).padStart(2, "0")}:${m === 0 ? "00" : "30"}`);
      }
    }
    return arr;
  }, []);

  // 現在スロット (今日のみ) 例: 14:05 => 14:00, 14:35 => 14:30
  const currentSlot = useMemo(() => {
    if (!isToday) return null;
    const now = new Date();
    const h = String(now.getHours()).padStart(2, "0");
    const m = now.getMinutes() < 30 ? "00" : "30";
    return `${h}:${m}`;
  }, [isToday]);

  // ゲスト滞在スロット集合を事前計算 (guestId -> Set(slot))
  const guestPresenceMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const g of currentGuests) {
      if (!g.checkinAt) continue;
      const start = new Date(g.checkinAt);
      const end = g.checkoutAt
        ? new Date(g.checkoutAt)
        : isToday
          ? new Date()
          : new Date(g.checkinAt); // 過去日でcheckoutAt無いケースは同一スロットのみ
      const slots = new Set<string>();
      const cursor = new Date(start);
      // 30分刻みで end まで
      while (cursor <= end) {
        const hh = String(cursor.getHours()).padStart(2, "0");
        const slot = `${hh}:${cursor.getMinutes() < 30 ? "00" : "30"}`;
        if (timeSlots.includes(slot)) slots.add(slot);
        // 30分進める
        cursor.setMinutes(cursor.getMinutes() + 30);
      }
      map.set(g.guestId, slots);
    }
    return map;
  }, [currentGuests, timeSlots, isToday]);

  // ログ存在スロット集合 (guestId -> Set(slot))
  const guestLoggedSlots = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const l of logs) {
      const d = new Date(l.timeslotStart);
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      const slot = `${hh}:${mm}`;
      if (!map.has(l.guestId)) map.set(l.guestId, new Set());
      map.get(l.guestId)?.add(slot);
    }
    return map;
  }, [logs]);

  // セル装飾クラス取得
  function getCellStateClasses(guestId: string, slot: string, hasLog: boolean) {
    const presence = guestPresenceMap.get(guestId);
    const logged = guestLoggedSlots.get(guestId);
    const isCurrent = currentSlot === slot;
    const isPresent = presence?.has(slot);
    const isLogged = logged?.has(slot) || hasLog;
    // 優先度: 現在スロット(枠) > 未記録滞在枠 > 滞在枠 > デフォルト
    if (isCurrent) return "bg-sky-100 dark:bg-sky-900/30";
    if (isPresent && !isLogged)
      return "bg-warning/30 dark:bg-warning/20 animate-pulse";
    if (isPresent) return "bg-primary/5";
    return "";
  }

  // 以前の fetchData/useEffect は SWR フックで置換

  function openNew(slot: string, guestId: string) {
    setEditing(null);
    setFormGuestId(guestId);
    const g = currentGuests.find((c) => c.guestId === guestId);
    setFormDisplayId(g?.displayId);
    setFormTime(slot);
    setFormCategories([]);
    setFormDescription("");
    setFormMentorNote("");
    setError("");
    setSheetOpen(true);
  }
  function openEdit(log: ActivityLogRow) {
    const d = new Date(log.timeslotStart);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    setEditing(log);
    setFormGuestId(log.guestId);
    const g = currentGuests.find((c) => c.guestId === log.guestId);
    setFormDisplayId(g?.displayId);
    setFormTime(`${hh}:${mm}`);
    setFormCategories(log.categories || []);
    setFormDescription(log.description || "");
    setFormMentorNote(log.mentorNote || "");
    setError("");
    setSheetOpen(true);
  }
  const slotIso = (dateStr: string, timeHHMM: string) =>
    new Date(`${dateStr}T${timeHHMM}:00+09:00`).toISOString();

  async function save() {
    setSaving(true);
    setError("");
    try {
      if (formDisplayId) {
        const found = currentGuests.find((g) => g.displayId === formDisplayId);
        if (found) setFormGuestId(found.guestId);
      }
      const timestamp = slotIso(date, formTime);
      const res = await fetch("/api/admin/activity-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestId: formGuestId,
          categories: formCategories,
          description: formDescription || undefined,
          mentorNote: formMentorNote || undefined,
          timestamp,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error?.message || "保存失敗");
        return;
      }
      setSheetOpen(false);
      await refresh();
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
      await refresh();
    } catch {
      setError("通信エラー");
    } finally {
      setSaving(false);
    }
  }
  function findLog(guestId: string, slot: string) {
    return logs.find((l) => {
      const d = new Date(l.timeslotStart);
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      return l.guestId === guestId && `${hh}:${mm}` === slot;
    });
  }

  const handleExportCsv = useCallback(() => {
    const headers = [
      "日時(JST)",
      "表示ID",
      "ゲスト名",
      "学年",
      "カテゴリ",
      "活動内容",
      "メンター対応",
    ];

    const rows = logs.map((log) => {
      const guest = currentGuests.find((g) => g.guestId === log.guestId);
      const categoryLabels = (log.categories || []).map((c) =>
        formatActivityCategory(c as keyof typeof activityCategoryLabels),
      );
      return [
        formatJST(log.timeslotStart, "yyyy-MM-dd HH:mm"),
        guest?.displayId ?? "",
        guest?.name ?? log.guestId,
        guest?.grade ? formatGradeDisplay(guest.grade) : "",
        categoryLabels.join(" / "),
        log.description ?? "",
        log.mentorNote ?? "",
      ];
    });

    downloadCsv(`activity_logs_${date}.csv`, headers, rows);
  }, [currentGuests, date, logs]);

  return (
    <AdminLayout title="活動ログ">
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex items-center justify-between space-y-0">
            <CardTitle className="text-lg">活動ログ</CardTitle>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    setDate(shiftDate(date, -1));
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <DatePicker
                  value={date}
                  onChange={(next) => {
                    if (next) {
                      setDate(next);
                    }
                  }}
                  clearable={false}
                  className="h-8 w-[140px]"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    const next = shiftDate(date, 1);
                    const todayStr = new Date().toISOString().slice(0, 10);
                    if (next <= todayStr) setDate(next);
                  }}
                  disabled={date === new Date().toISOString().slice(0, 10)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleExportCsv}
                disabled={logs.length === 0}
                className="flex items-center gap-1"
              >
                <Download className="h-4 w-4" />
                CSV出力
              </Button>
              <Button size="sm" variant="outline" onClick={refresh}>
                再読込
              </Button>
            </div>
          </CardHeader>
          <CardContent className="overflow-hidden">
            <div className="relative">
              {/* 横スクロール領域: 端までスクロールできるよう overflow-x-auto を明示 */}
              <div
                className="overflow-x-auto overflow-y-auto max-h-[70vh]"
                id={scrollId}
              >
                {currentGuests.length > 0 && (
                  <div
                    className="grid rounded-t-md border bg-muted/60 backdrop-blur supports-[backdrop-filter]:bg-muted/40 sticky top-0 z-30 min-w-max"
                    style={{
                      // 列幅調整: 時刻 140px, 各ゲスト 190px
                      gridTemplateColumns: `140px repeat(${currentGuests.length}, 190px)`,
                    }}
                  >
                    <div className="text-[11px] font-semibold p-2 sticky left-0 z-40 bg-muted/70 border-r w-[140px]">
                      時刻（30分刻み）
                    </div>
                    {currentGuests.map((g) => (
                      <div
                        key={g.guestId}
                        className="text-[11px] font-semibold p-2 text-center truncate border-l first:border-l-0 w-[190px]"
                        title={g.name || String(g.displayId) || g.guestId}
                      >
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="font-mono text-[10px] text-muted-foreground">
                            #{g.displayId ?? "-"}
                          </span>
                          <span className="truncate max-w-full">
                            {g.name || g.guestId.slice(0, 8)}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono leading-tight">
                            {formatGradeDisplay(g.grade)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div
                  className={`border ${
                    currentGuests.length > 0
                      ? "border-t-0 rounded-b-md"
                      : "rounded-md"
                  } shadow-sm min-h-[320px] flex flex-col`}
                >
                  {loading && (
                    <div className="p-4 text-sm flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> 読み込み中...
                    </div>
                  )}
                  {!loading && currentGuests.length > 0 && (
                    <div className="divide-y">
                      {timeSlots.map((slot) => (
                        <div
                          key={slot}
                          className="grid group/time-row odd:bg-background even:bg-muted/20 min-w-max"
                          style={{
                            gridTemplateColumns: `140px repeat(${currentGuests.length}, 190px)`,
                          }}
                        >
                          <div className="text-[10px] sm:text-xs px-2 py-2 sticky left-0 z-20 bg-background/95 font-mono border-r border-dashed group-hover/time-row:bg-accent/40 w-[140px]">
                            {slot}
                          </div>
                          {currentGuests.map((g) => {
                            const log = findLog(g.guestId, slot);
                            const cats = (log?.categories ||
                              []) as (keyof typeof activityCategoryLabels)[];
                            const stateClasses = getCellStateClasses(
                              g.guestId,
                              slot,
                              !!log,
                            );
                            return (
                              <button
                                type="button"
                                key={g.guestId + slot}
                                onClick={() =>
                                  isToday &&
                                  (log
                                    ? openEdit(log)
                                    : openNew(slot, g.guestId))
                                }
                                disabled={!isToday}
                                className={`relative text-left min-h-[46px] sm:min-h-[54px] border-l first:border-l-0 px-2 py-1.5 focus:outline-none focus-visible:ring-2 ring-offset-2 ring-primary/40 transition-colors w-[190px] ${stateClasses} ${
                                  isToday
                                    ? "hover:bg-accent/30 cursor-pointer"
                                    : "opacity-60 cursor-not-allowed"
                                }`}
                              >
                                {log ? (
                                  <div className="h-full flex flex-col gap-1">
                                    <div className="flex flex-wrap gap-1">
                                      {cats.map((c) => (
                                        <span
                                          key={c}
                                          className={`inline-flex items-center rounded-md border px-1 py-0.5 text-[9px] font-medium leading-tight ${activityCategoryColorClasses[c]}`}
                                          title={formatActivityCategory(c)}
                                        >
                                          {formatActivityCategory(c)}
                                        </span>
                                      ))}
                                    </div>
                                    {(log.description || log.mentorNote) && (
                                      <span className="text-[10px] leading-snug line-clamp-2 break-words text-muted-foreground">
                                        {(log.description || "") +
                                          (log.mentorNote
                                            ? ` / M:${log.mentorNote}`
                                            : "")}
                                      </span>
                                    )}
                                  </div>
                                ) : isToday ? (
                                  <span className="opacity-30 group-hover/time-row:opacity-60 text-[11px] flex items-center justify-center h-full font-medium">
                                    ＋
                                  </span>
                                ) : null}
                                <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-muted/10 opacity-0 group-hover/time-row:opacity-100 transition" />
                                <span className="pointer-events-none absolute inset-0 border border-transparent group-hover/time-row:border-border/60 rounded-sm" />
                              </button>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  )}
                  {!loading && currentGuests.length === 0 && (
                    <div className="flex flex-1 items-center justify-center p-10 text-center text-sm text-muted-foreground">
                      <div className="space-y-2">
                        <p className="font-medium">来場者記録がありません</p>
                        <p className="text-xs leading-relaxed">
                          {isToday
                            ? "本日はまだチェックインがありません。"
                            : "この日付にはチェックイン履歴がありません。"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Sheet open={sheetOpen && isToday} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-[380px] sm:w-[420px]">
          <SheetHeader>
            <SheetTitle>{editing ? "活動ログ編集" : "活動ログ追加"}</SheetTitle>
          </SheetHeader>
          <div className="p-4 space-y-4">
            <div>
              <label
                htmlFor={guestSelectId}
                className="block text-xs font-medium mb-1"
              >
                ゲスト (表示ID)
              </label>
              <Select
                value={formDisplayId ? String(formDisplayId) : undefined}
                onValueChange={(v) => {
                  const num = Number(v);
                  setFormDisplayId(num);
                  const g = currentGuests.find((cg) => cg.displayId === num);
                  if (g) setFormGuestId(g.guestId);
                }}
                disabled={!!editing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="選択" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {currentGuests.map((g) => (
                    <SelectItem key={g.guestId} value={String(g.displayId)}>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-mono text-[11px]">
                          #{g.displayId}
                        </span>
                        <span className="text-[11px] opacity-80 truncate">
                          {g.name}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label
                htmlFor={timeInputId}
                className="block text-xs font-medium mb-1"
              >
                時刻 (JST)
              </label>
              <Input
                id={timeInputId}
                type="time"
                value={formTime}
                onChange={(e) => setFormTime(e.target.value)}
                step={1800}
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor={categoryLabelId}
                className="block text-xs font-medium"
              >
                カテゴリ(複数選択)
              </label>
              <div id={categoryLabelId} className="flex flex-wrap gap-1">
                {categories.map((c) => {
                  const active = formCategories.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() =>
                        setFormCategories((prev) =>
                          prev.includes(c)
                            ? prev.filter((x) => x !== c)
                            : [...prev, c],
                        )
                      }
                      className={`px-2 py-0.5 rounded-md border text-[10px] font-medium transition ${
                        active
                          ? activityCategoryColorClasses[
                              c as keyof typeof activityCategoryColorClasses
                            ]
                          : "bg-muted hover:bg-accent/40"
                      }`}
                    >
                      {formatActivityCategory(
                        c as keyof typeof activityCategoryLabels,
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label
                htmlFor={descriptionId}
                className="block text-xs font-medium mb-1"
              >
                活動内容(任意)
              </label>
              <Textarea
                id={descriptionId}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                maxLength={100}
              />
              <div className="text-[10px] text-muted-foreground text-right">
                {formDescription.length}/100
              </div>
            </div>
            <div>
              <label
                htmlFor={mentorNoteId}
                className="block text-xs font-medium mb-1"
              >
                メンター対応(任意)
              </label>
              <Textarea
                id={mentorNoteId}
                value={formMentorNote}
                onChange={(e) => setFormMentorNote(e.target.value)}
                maxLength={200}
              />
              <div className="text-[10px] text-muted-foreground text-right">
                {formMentorNote.length}/200
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
