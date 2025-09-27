"use client";

import { useState } from "react";
import { AdminLayout } from "@/components/admin-layout";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ACTIVITY_CATEGORIES,
  activityCategoryLabels,
  formatActivityCategory,
  type ActivityCategory,
} from "@/domain/activity-category";
import {
  GRADE_DEFINITIONS,
  formatGradeDisplay,
} from "@/domain/value-objects/grade";
import { downloadCsv } from "@/lib/csv";
import { formatJST } from "@/lib/timezone";
import type {
  ActivityLogExportRow,
  GuestExportRow,
  GradeValue,
} from "@/types/api";
import { Loader2 } from "lucide-react";

function toDateInputValue(base: Date): string {
  const date = new Date(base);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

function getOffsetDate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toDateInputValue(date);
}

type GuestExportStatus = "ALL" | "CHECKED_IN" | "CHECKED_OUT";

export default function AdminExportsPage() {
  const [activityStartDate, setActivityStartDate] = useState(() =>
    getOffsetDate(-6)
  );
  const [activityEndDate, setActivityEndDate] = useState(() =>
    getOffsetDate(0)
  );
  const [activityCategories, setActivityCategories] = useState<
    ActivityCategory[]
  >([]);
  const [activityIncludeGrade, setActivityIncludeGrade] = useState(true);
  const [activityIncludeContact, setActivityIncludeContact] = useState(false);
  const [activityIncludeDescription, setActivityIncludeDescription] =
    useState(true);
  const [activityIncludeMentorNote, setActivityIncludeMentorNote] =
    useState(true);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState("");
  const [activityInfo, setActivityInfo] = useState("");

  const [guestKeyword, setGuestKeyword] = useState("");
  const [guestGrades, setGuestGrades] = useState<GradeValue[]>([]);
  const [guestStatus, setGuestStatus] = useState<GuestExportStatus>("ALL");
  const [guestRegisteredStart, setGuestRegisteredStart] = useState("");
  const [guestRegisteredEnd, setGuestRegisteredEnd] = useState("");
  const [guestMinVisits, setGuestMinVisits] = useState("");
  const [guestIncludeGrade, setGuestIncludeGrade] = useState(true);
  const [guestIncludeContact, setGuestIncludeContact] = useState(false);
  const [guestIncludeRegisteredAt, setGuestIncludeRegisteredAt] =
    useState(true);
  const [guestIncludeStats, setGuestIncludeStats] = useState(true);
  const [guestLoading, setGuestLoading] = useState(false);
  const [guestError, setGuestError] = useState("");
  const [guestInfo, setGuestInfo] = useState("");

  const toggleActivityCategory = (
    value: ActivityCategory,
    checked: boolean
  ) => {
    setActivityCategories((prev) =>
      checked
        ? prev.includes(value)
          ? prev
          : [...prev, value]
        : prev.filter((item) => item !== value)
    );
  };

  const toggleGuestGrade = (value: GradeValue, checked: boolean) => {
    setGuestGrades((prev) =>
      checked
        ? prev.includes(value)
          ? prev
          : [...prev, value]
        : prev.filter((item) => item !== value)
    );
  };

  const resetActivityFeedback = () => {
    setActivityError("");
    setActivityInfo("");
  };

  const resetGuestFeedback = () => {
    setGuestError("");
    setGuestInfo("");
  };

  const handleActivityExport = async () => {
    resetActivityFeedback();
    if (activityStartDate > activityEndDate) {
      setActivityError("終了日は開始日以降の日付を指定してください");
      return;
    }

    setActivityLoading(true);
    try {
      const response = await fetch("/api/admin/export/activity-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: activityStartDate,
          endDate: activityEndDate,
          categories:
            activityCategories.length > 0 ? activityCategories : undefined,
        }),
      });
      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error?.message || "CSV出力に失敗しました");
      }
      const rows = (json.data || []) as ActivityLogExportRow[];
      if (rows.length === 0) {
        setActivityInfo("該当データがありません");
        return;
      }

      const headers: string[] = ["日時(JST)", "表示ID", "ゲスト名"];
      if (activityIncludeGrade) headers.push("学年");
      if (activityIncludeContact) headers.push("連絡先");
      headers.push("カテゴリ");
      if (activityIncludeDescription) headers.push("活動内容");
      if (activityIncludeMentorNote) headers.push("メンター対応");

      const csvRows = rows.map((row) => {
        const values: (string | number | boolean | null | undefined)[] = [
          formatJST(row.timeslotStart, "yyyy-MM-dd HH:mm"),
          row.guestDisplayId ?? "",
          row.guestName,
        ];
        if (activityIncludeGrade) {
          values.push(row.guestGrade ? formatGradeDisplay(row.guestGrade) : "");
        }
        if (activityIncludeContact) {
          values.push(row.guestContact ?? "");
        }
        values.push(
          (row.categories || [])
            .map((category) =>
              formatActivityCategory(category as ActivityCategory)
            )
            .join(" / ")
        );
        if (activityIncludeDescription) {
          values.push(row.description ?? "");
        }
        if (activityIncludeMentorNote) {
          values.push(row.mentorNote ?? "");
        }
        return values;
      });

      const filename = `activity_logs_${activityStartDate}_${activityEndDate}.csv`;
      downloadCsv(filename, headers, csvRows);
      setActivityInfo(`${rows.length}件の活動ログを出力しました`);
    } catch (error) {
      setActivityError(
        error instanceof Error ? error.message : "CSV出力に失敗しました"
      );
    } finally {
      setActivityLoading(false);
    }
  };

  const handleGuestExport = async () => {
    resetGuestFeedback();
    if (
      guestRegisteredStart &&
      guestRegisteredEnd &&
      guestRegisteredStart > guestRegisteredEnd
    ) {
      setGuestError("登録日の終了日は開始日以降の日付を指定してください");
      return;
    }
    const trimmedVisits = guestMinVisits.trim();
    const minVisits = trimmedVisits
      ? Number.parseInt(trimmedVisits, 10)
      : undefined;
    if (minVisits !== undefined && (Number.isNaN(minVisits) || minVisits < 0)) {
      setGuestError("訪問回数は0以上の整数で入力してください");
      return;
    }

    setGuestLoading(true);
    try {
      const response = await fetch("/api/admin/export/guests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword: guestKeyword.trim() || undefined,
          grades: guestGrades.length > 0 ? guestGrades : undefined,
          status: guestStatus,
          registeredStart: guestRegisteredStart || undefined,
          registeredEnd: guestRegisteredEnd || undefined,
          minTotalVisits: minVisits,
          includeVisitStats: guestIncludeStats,
        }),
      });
      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error?.message || "CSV出力に失敗しました");
      }
      const rows = (json.data || []) as GuestExportRow[];
      if (rows.length === 0) {
        setGuestInfo("該当データがありません");
        return;
      }

      const headers: string[] = ["表示ID", "名前"];
      if (guestIncludeGrade) headers.push("学年");
      if (guestIncludeContact) headers.push("連絡先");
      headers.push("ステータス");
      if (guestIncludeStats) {
        headers.push("訪問回数", "最終訪問日時", "累計滞在時間(分)");
      }
      if (guestIncludeRegisteredAt) headers.push("登録日時");

      const csvRows = rows.map((row) => {
        const values: (string | number | boolean | null | undefined)[] = [
          row.displayId,
          row.name,
        ];
        if (guestIncludeGrade) {
          values.push(row.grade ? formatGradeDisplay(row.grade) : "");
        }
        if (guestIncludeContact) {
          values.push(row.contact ?? "");
        }
        values.push(row.isCurrentlyCheckedIn ? "滞在中" : "退場");
        if (guestIncludeStats) {
          values.push(row.totalVisits ?? 0);
          values.push(
            row.lastVisitAt
              ? formatJST(row.lastVisitAt, "yyyy-MM-dd HH:mm")
              : ""
          );
          values.push(row.totalStayMinutes != null ? row.totalStayMinutes : "");
        }
        if (guestIncludeRegisteredAt) {
          values.push(formatJST(row.createdAt, "yyyy-MM-dd HH:mm"));
        }
        return values;
      });

      const timestamp = formatJST(new Date().toISOString(), "yyyyMMdd_HHmmss");
      const filename = `guests_${timestamp}.csv`;
      downloadCsv(filename, headers, csvRows);
      setGuestInfo(`${rows.length}件のゲスト情報を出力しました`);
    } catch (error) {
      setGuestError(
        error instanceof Error ? error.message : "CSV出力に失敗しました"
      );
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <AdminLayout title="CSV出力">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>活動ログ CSV</CardTitle>
              <CardDescription>
                指定期間・カテゴリで活動ログを抽出し、任意の列構成でエクスポートします。
              </CardDescription>
            </div>
            <CardAction>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setActivityCategories(ACTIVITY_CATEGORIES.slice())
                  }
                >
                  全カテゴリ選択
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActivityCategories([])}
                >
                  選択リセット
                </Button>
              </div>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-xs font-semibold text-muted-foreground uppercase">
                抽出期間
              </Label>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="activity-start">開始日</Label>
                  <Input
                    id="activity-start"
                    type="date"
                    value={activityStartDate}
                    max={activityEndDate}
                    onChange={(event) =>
                      setActivityStartDate(event.target.value)
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="activity-end">終了日</Label>
                  <Input
                    id="activity-end"
                    type="date"
                    value={activityEndDate}
                    min={activityStartDate}
                    onChange={(event) => setActivityEndDate(event.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold text-muted-foreground uppercase">
                カテゴリ
              </Label>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {ACTIVITY_CATEGORIES.map((category) => {
                  const checked = activityCategories.includes(category);
                  return (
                    <label
                      key={category}
                      className="flex items-center gap-2 rounded-md border border-border/60 bg-card/40 px-3 py-2 text-sm"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(value) =>
                          toggleActivityCategory(category, value === true)
                        }
                      />
                      <span>{activityCategoryLabels[category]}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold text-muted-foreground uppercase">
                含める項目
              </Label>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={activityIncludeGrade}
                    onCheckedChange={(value) =>
                      setActivityIncludeGrade(value === true)
                    }
                  />
                  <span>学年</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={activityIncludeContact}
                    onCheckedChange={(value) =>
                      setActivityIncludeContact(value === true)
                    }
                  />
                  <span>連絡先</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={activityIncludeDescription}
                    onCheckedChange={(value) =>
                      setActivityIncludeDescription(value === true)
                    }
                  />
                  <span>活動内容</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={activityIncludeMentorNote}
                    onCheckedChange={(value) =>
                      setActivityIncludeMentorNote(value === true)
                    }
                  />
                  <span>メンター対応メモ</span>
                </label>
              </div>
            </div>

            {activityError && (
              <p className="text-sm text-destructive">{activityError}</p>
            )}
            {activityInfo && (
              <p className="text-sm text-muted-foreground">{activityInfo}</p>
            )}
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleActivityExport}
              disabled={activityLoading}
              className="min-w-[160px]"
            >
              {activityLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              CSVダウンロード
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>ゲスト CSV</CardTitle>
              <CardDescription>
                フィルタ条件を指定してゲスト情報をエクスポートします。訪問統計も含められます。
              </CardDescription>
            </div>
            <CardAction>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setGuestGrades(
                      GRADE_DEFINITIONS.map((grade) => grade.value)
                    )
                  }
                >
                  全学年選択
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setGuestGrades([])}
                >
                  選択リセット
                </Button>
              </div>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="guest-keyword">キーワード</Label>
                <Input
                  id="guest-keyword"
                  placeholder="名前・連絡先・表示IDで検索"
                  value={guestKeyword}
                  onChange={(event) => setGuestKeyword(event.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>滞在ステータス</Label>
                <Select
                  value={guestStatus}
                  onValueChange={(value) =>
                    setGuestStatus(value as GuestExportStatus)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="ステータスを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">すべて</SelectItem>
                    <SelectItem value="CHECKED_IN">滞在中のみ</SelectItem>
                    <SelectItem value="CHECKED_OUT">退場済みのみ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold text-muted-foreground uppercase">
                学年フィルタ
              </Label>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {GRADE_DEFINITIONS.map((grade) => {
                  const checked = guestGrades.includes(grade.value);
                  return (
                    <label
                      key={grade.value}
                      className="flex items-center gap-2 rounded-md border border-border/60 bg-card/40 px-3 py-2 text-sm"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(value) =>
                          toggleGuestGrade(grade.value, value === true)
                        }
                      />
                      <span>{grade.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="guest-registered-start">登録日（開始）</Label>
                <Input
                  id="guest-registered-start"
                  type="date"
                  value={guestRegisteredStart}
                  max={guestRegisteredEnd || undefined}
                  onChange={(event) =>
                    setGuestRegisteredStart(event.target.value)
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="guest-registered-end">登録日（終了）</Label>
                <Input
                  id="guest-registered-end"
                  type="date"
                  value={guestRegisteredEnd}
                  min={guestRegisteredStart || undefined}
                  onChange={(event) =>
                    setGuestRegisteredEnd(event.target.value)
                  }
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 md:w-64">
              <Label htmlFor="guest-min-visits">訪問回数（下限）</Label>
              <Input
                id="guest-min-visits"
                type="number"
                min={0}
                placeholder="例: 5"
                value={guestMinVisits}
                onChange={(event) => setGuestMinVisits(event.target.value)}
              />
            </div>

            <div>
              <Label className="text-xs font-semibold text-muted-foreground uppercase">
                含める項目
              </Label>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={guestIncludeGrade}
                    onCheckedChange={(value) =>
                      setGuestIncludeGrade(value === true)
                    }
                  />
                  <span>学年</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={guestIncludeContact}
                    onCheckedChange={(value) =>
                      setGuestIncludeContact(value === true)
                    }
                  />
                  <span>連絡先</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={guestIncludeRegisteredAt}
                    onCheckedChange={(value) =>
                      setGuestIncludeRegisteredAt(value === true)
                    }
                  />
                  <span>登録日時</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={guestIncludeStats}
                    onCheckedChange={(value) =>
                      setGuestIncludeStats(value === true)
                    }
                  />
                  <span>訪問統計（訪問回数・最終訪問日時・滞在時間）</span>
                </label>
              </div>
            </div>

            {guestError && (
              <p className="text-sm text-destructive">{guestError}</p>
            )}
            {guestInfo && (
              <p className="text-sm text-muted-foreground">{guestInfo}</p>
            )}
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleGuestExport}
              disabled={guestLoading}
              className="min-w-[160px]"
            >
              {guestLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              CSVダウンロード
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AdminLayout>
  );
}
