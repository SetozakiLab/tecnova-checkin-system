import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/shared/status-badge";
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
import { formatDateTime } from "@/lib/date-utils";
import { useApi } from "@/hooks/use-api";
import { useConfirmDelete } from "@/hooks/use-confirm-delete";
import { ErrorState } from "@/components/shared/error-state";
import { GuestData, GradeValue } from "@/types/api";
import { GradeSelect, formatGrade } from "@/components/ui/grade-select";
import Link from "next/link";

interface GuestsTableProps {
  guests: GuestData[];
  onUpdate: () => void;
}

export function GuestsTable({ guests, onUpdate }: GuestsTableProps) {
  const { data: session } = useSession();
  interface SessionUser {
    role?: string;
  }
  const isManager =
    (session?.user as SessionUser | undefined)?.role === "MANAGER";
  const [editingGuest, setEditingGuest] = useState<GuestData | null>(null);
  // 汎用削除ダイアログフック
  const deleteConfirm = useConfirmDelete<GuestData>({
    action: async (guest) => {
      const res = await fetch(`/api/admin/guests/${guest.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error?.message || "削除に失敗しました");
      }
    },
    successMessage: (g) => `「${g.name}」を削除しました`,
    onSuccess: () => onUpdate(),
  });
  const [editForm, setEditForm] = useState<{
    name: string;
    contact: string;
    grade: GradeValue | null;
  }>({
    name: "",
    contact: "",
    grade: null,
  });
  const { loading: editLoading, error: editError, execute } = useApi();
  // 旧個別 useApi 削除ロジック不要

  const handleEditClick = (guest: GuestData) => {
    setEditingGuest(guest);
    setEditForm({
      name: guest.name,
      contact: guest.contact || "",
      grade: (guest.grade as GradeValue) || null,
    });
  };

  const handleEditSubmit = async () => {
    if (!editingGuest) return;
    // 本来は更新API(PUT)を呼ぶべきところがDELETEになっていたため修正
    const payload = {
      name: editForm.name.trim(),
      contact: editForm.contact.trim(),
      grade: editForm.grade || null,
    };
    const result = await execute(`/api/admin/guests/${editingGuest.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (result) {
      onUpdate();
      setEditingGuest(null);
    }
  };

  // confirmDelete 不要（useConfirmDelete 利用）

  if (guests.length === 0) {
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
              <TableHead>名前</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>連絡先</TableHead>
              <TableHead>学年</TableHead>
              <TableHead>登録日時</TableHead>
              <TableHead>状態</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {guests.map((guest) => (
              <TableRow key={guest.id} className="hover:bg-slate-50">
                <TableCell className="font-medium text-primary underline-offset-2 hover:underline">
                  <Link href={`/admin/guests/${guest.id}`}>{guest.name}</Link>
                </TableCell>
                <TableCell>{guest.displayId}</TableCell>
                <TableCell>{guest.contact || "-"}</TableCell>
                <TableCell>{formatGrade(guest.grade)}</TableCell>
                <TableCell>{formatDateTime(guest.createdAt)}</TableCell>
                <TableCell>
                  <StatusBadge isActive={!!guest.isCurrentlyCheckedIn} />
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
                        onClick={() => handleEditClick(guest)}
                      >
                        編集
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={async () => {
                          if (guest.isCurrentlyCheckedIn) {
                            await execute(`/api/guests/${guest.id}/checkout`, {
                              method: "POST",
                            });
                          } else {
                            await execute(`/api/guests/${guest.id}/checkin`, {
                              method: "POST",
                            });
                          }
                          onUpdate();
                        }}
                      >
                        {guest.isCurrentlyCheckedIn ? "退場" : "入場"}
                      </DropdownMenuItem>
                      {!isManager && (
                        <>
                          <DropdownMenuSeparator />
                          <AlertDialog
                            open={
                              deleteConfirm.open &&
                              deleteConfirm.target?.id === guest.id
                            }
                            onOpenChange={(open) => {
                              if (open) deleteConfirm.openDialog(guest);
                              else if (!deleteConfirm.loading)
                                deleteConfirm.closeDialog();
                            }}
                          >
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-600 cursor-pointer"
                                disabled={guest.isCurrentlyCheckedIn}
                                onSelect={(e) => {
                                  // Radix onSelect -> prevent menu close flicker until dialog mounts
                                  e.preventDefault();
                                  deleteConfirm.openDialog(guest);
                                }}
                              >
                                削除
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  ゲストを削除しますか？
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  この操作は取り消せません。「{guest.name}
                                  」の全ての関連データが削除されます。
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              {deleteConfirm.error && (
                                <div className="text-sm text-red-600 border border-red-200 rounded p-2 bg-red-50">
                                  {deleteConfirm.error}
                                </div>
                              )}
                              <AlertDialogFooter>
                                <AlertDialogCancel asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={deleteConfirm.loading}
                                  >
                                    キャンセル
                                  </Button>
                                </AlertDialogCancel>
                                <AlertDialogAction asChild>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    disabled={
                                      guest.isCurrentlyCheckedIn ||
                                      deleteConfirm.loading
                                    }
                                    onClick={(e) => {
                                      e.preventDefault();
                                      void deleteConfirm.confirm();
                                    }}
                                  >
                                    {deleteConfirm.loading
                                      ? "削除中..."
                                      : "削除する"}
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

      {/* 編集モーダル */}
      {editingGuest && (
        <Dialog
          open={!!editingGuest}
          onOpenChange={() => setEditingGuest(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>ゲスト情報編集</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {editError && <ErrorState message={editError} />}

              <div>
                <Label htmlFor="editName">名前</Label>
                <Input
                  id="editName"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  disabled={editLoading}
                />
              </div>

              <div>
                <Label htmlFor="editContact">連絡先</Label>
                <Input
                  id="editContact"
                  type="email"
                  value={editForm.contact}
                  onChange={(e) =>
                    setEditForm({ ...editForm, contact: e.target.value })
                  }
                  disabled={editLoading}
                  placeholder="メールアドレス（任意）"
                />
              </div>

              <div>
                <GradeSelect
                  value={editForm.grade}
                  onChange={(v) => setEditForm({ ...editForm, grade: v })}
                  disabled={editLoading}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setEditingGuest(null)}
                  disabled={editLoading}
                >
                  キャンセル
                </Button>
                <Button
                  onClick={handleEditSubmit}
                  disabled={editLoading || !editForm.name.trim()}
                >
                  {editLoading ? "更新中..." : "更新"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
