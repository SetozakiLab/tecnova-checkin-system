import { useState } from "react";
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
import { formatDateTime } from "@/lib/date-utils";
import { useApi } from "@/hooks/use-api";
import { ErrorState } from "@/components/shared/error-state";
import { GuestData } from "@/types/api";

interface GuestsTableProps {
  guests: GuestData[];
  onUpdate: () => void;
}

export function GuestsTable({ guests, onUpdate }: GuestsTableProps) {
  const [editingGuest, setEditingGuest] = useState<GuestData | null>(null);
  const [editForm, setEditForm] = useState({ name: "", contact: "" });
  const { loading: editLoading, error: editError, execute } = useApi();

  const handleEditClick = (guest: GuestData) => {
    setEditingGuest(guest);
    setEditForm({
      name: guest.name,
      contact: guest.contact || "",
    });
  };

  const handleEditSubmit = async () => {
    if (!editingGuest) return;

    const result = await execute(`/api/admin/guests/${editingGuest.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: editForm.name,
        contact: editForm.contact || undefined,
      }),
    });

    if (result) {
      setEditingGuest(null);
      onUpdate();
    }
  };

  const handleDeleteClick = async (guest: GuestData) => {
    if (!confirm(`「${guest.name}」を削除しますか？`)) return;

    const result = await execute(`/api/admin/guests/${guest.id}`, {
      method: "DELETE",
    });

    if (result) {
      onUpdate();
    }
  };

  if (guests.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">データがありません</div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>名前</TableHead>
            <TableHead>ID</TableHead>
            <TableHead>連絡先</TableHead>
            <TableHead>登録日時</TableHead>
            <TableHead>状態</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {guests.map((guest) => (
            <TableRow key={guest.id}>
              <TableCell className="font-medium">{guest.name}</TableCell>
              <TableCell>{guest.displayId}</TableCell>
              <TableCell>{guest.contact || "-"}</TableCell>
              <TableCell>{formatDateTime(guest.createdAt)}</TableCell>
              <TableCell>
                <StatusBadge isActive={!!guest.isCurrentlyCheckedIn} />
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditClick(guest)}
                  >
                    編集
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteClick(guest)}
                    disabled={guest.isCurrentlyCheckedIn}
                    className="text-red-600 hover:text-red-700"
                  >
                    削除
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

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
