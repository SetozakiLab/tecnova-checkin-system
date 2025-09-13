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
import { ErrorState } from "@/components/shared/error-state";
import { GuestData } from "@/types/api";
import { GradeSelect, formatGrade } from "@/components/ui/grade-select";

interface GuestsTableProps {
  guests: GuestData[];
  onUpdate: () => void;
}

export function GuestsTable({ guests, onUpdate }: GuestsTableProps) {
  const { data: session } = useSession();
  const isManager = (session?.user as any)?.role === "MANAGER";
  const [editingGuest, setEditingGuest] = useState<GuestData | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    contact: "",
    grade: null as string | null,
  });
  const { loading: editLoading, error: editError, execute } = useApi();

  const handleEditClick = (guest: GuestData) => {
    setEditingGuest(guest);
    setEditForm({
      name: guest.name,
      contact: guest.contact || "",
      grade: guest.grade || null,
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

  // 削除 (AlertDialog から呼び出し)
  const deleteGuest = async (guest: GuestData) => {
    await execute(`/api/admin/guests/${guest.id}`, { method: "DELETE" });
    if (!editError) onUpdate();
  };

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
                <TableCell className="font-medium">{guest.name}</TableCell>
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
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-600 cursor-pointer"
                                disabled={guest.isCurrentlyCheckedIn}
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
                                    onClick={() => deleteGuest(guest)}
                                    disabled={guest.isCurrentlyCheckedIn}
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
                  value={editForm.grade as any}
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
