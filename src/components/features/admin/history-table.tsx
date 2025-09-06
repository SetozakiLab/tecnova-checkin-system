import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDateTime } from "@/lib/date-utils";
import { CheckinRecord } from "@/types/api";
import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useApi } from "@/hooks/use-api";

interface HistoryTableProps {
  records: CheckinRecord[];
  onUpdated?: () => void;
}
export function HistoryTable({ records, onUpdated }: HistoryTableProps) {
  const { data: session } = useSession();
  const isSuper = (session?.user as any)?.role === "SUPER";
  const [editing, setEditing] = useState<CheckinRecord | null>(null);
  const [form, setForm] = useState({ checkinAt: "", checkoutAt: "" });
  const { execute, loading } = useApi();

  const openEdit = (r: CheckinRecord) => {
    setEditing(r);
    setForm({
      checkinAt: r.checkinAt.slice(0, 19),
      checkoutAt: r.checkoutAt ? r.checkoutAt.slice(0, 19) : "",
    });
  };

  const submit = async () => {
    if (!editing) return;
    const payload: any = {};
    if (form.checkinAt)
      payload.checkinAt = new Date(form.checkinAt).toISOString();
    if (form.checkoutAt !== "")
      payload.checkoutAt = new Date(form.checkoutAt).toISOString();
    if (form.checkoutAt === "") payload.checkoutAt = null; // 明示的に未チェックアウトへ戻す
    const res = await execute(`/api/admin/checkin-records/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res) {
      setEditing(null);
      onUpdated && onUpdated();
    }
  };

  if (records.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">データがありません</div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ゲスト名</TableHead>
            <TableHead>ID</TableHead>
            <TableHead>チェックイン</TableHead>
            <TableHead>チェックアウト</TableHead>
            <TableHead>滞在時間</TableHead>
            <TableHead>状態</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record.id}>
              <TableCell className="font-medium">{record.guestName}</TableCell>
              <TableCell>{record.guestDisplayId}</TableCell>
              <TableCell>{formatDateTime(record.checkinAt)}</TableCell>
              <TableCell>
                {record.checkoutAt ? formatDateTime(record.checkoutAt) : "-"}
              </TableCell>
              <TableCell>
                {record.duration ? `${record.duration}分` : "-"}
              </TableCell>
              <TableCell>
                <StatusBadge isActive={!!record.isActive} />
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEdit(record)}
                  >
                    編集
                  </Button>
                  {isSuper && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                      onClick={async () => {
                        if (!confirm("この記録を削除しますか？")) return;
                        await execute(
                          `/api/admin/checkin-records/${record.id}`,
                          { method: "DELETE" }
                        );
                        onUpdated && onUpdated();
                      }}
                    >
                      削除
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {editing && (
        <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>入退場時刻編集</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>チェックイン</Label>
                <Input
                  type="datetime-local"
                  value={form.checkinAt}
                  onChange={(e) =>
                    setForm({ ...form, checkinAt: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>チェックアウト (空欄で未チェックアウト)</Label>
                <Input
                  type="datetime-local"
                  value={form.checkoutAt}
                  onChange={(e) =>
                    setForm({ ...form, checkoutAt: e.target.value })
                  }
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setEditing(null)}
                  disabled={loading}
                >
                  キャンセル
                </Button>
                <Button onClick={submit} disabled={loading}>
                  保存
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
