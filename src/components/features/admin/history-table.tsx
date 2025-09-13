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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal } from "lucide-react";

interface HistoryTableProps {
  records: CheckinRecord[];
  onUpdated?: () => void;
}
export function HistoryTable({ records, onUpdated }: HistoryTableProps) {
  const { data: session } = useSession();
  const userRole = (session?.user as { role?: string } | undefined)?.role;
  const isSuper = userRole === "SUPER";
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
    const payload: Record<string, string | null> = {};
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
      if (onUpdated) onUpdated();
    }
  };

  if (records.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">データがありません</div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-md border bg-white">
        <Table className="relative">
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50 sticky top-0 z-10">
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
              <TableRow key={record.id} className="hover:bg-slate-50">
                <TableCell className="font-medium">
                  {record.guestName}
                </TableCell>
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        aria-label="操作メニュー"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => openEdit(record)}
                      >
                        編集
                      </DropdownMenuItem>
                      {isSuper && (
                        <>
                          <DropdownMenuSeparator />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem className="text-red-600 focus:text-red-600 cursor-pointer">
                                削除
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  この記録を削除しますか？
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  削除すると元に戻せません。レポートからも除外されます。
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel asChild>
                                  <Button variant="outline" size="sm">
                                    キャンセル
                                  </Button>
                                </AlertDialogCancel>
                                <AlertDialogAction asChild>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={async () => {
                                      await execute(
                                        `/api/admin/checkin-records/${record.id}`,
                                        { method: "DELETE" }
                                      );
                                      if (onUpdated) onUpdated();
                                    }}
                                  >
                                    削除する
                                  </Button>
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
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
