"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import Link from "next/link";

interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  purpose: string;
  status: "registered" | "checked_in" | "checked_out";
  createdAt: string;
  lastCheckInTime: string | null;
  lastCheckOutTime: string | null;
}

export default function GuestManagementPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredGuests, setFilteredGuests] = useState<Guest[]>([]);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);

  useEffect(() => {
    const fetchGuests = async () => {
      try {
        const res = await fetch("/api/admin/guests");
        const data = await res.json();
        if (data.success) {
          setGuests(data.data.guests);
          setFilteredGuests(data.data.guests);
        }
      } catch (error) {
        console.error("ゲストの取得に失敗しました:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGuests();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = guests.filter(
        (guest) =>
          guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          guest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          guest.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
          guest.purpose.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredGuests(filtered);
    } else {
      setFilteredGuests(guests);
    }
  }, [searchTerm, guests]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "checked_in":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            入場中
          </Badge>
        );
      case "checked_out":
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            退場済
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            登録済
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">ゲスト管理</h1>
        <Link href="/admin">
          <Button variant="outline">ダッシュボードに戻る</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ゲスト検索</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Input
              placeholder="氏名、メール、会社名、来社目的で検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
            <Button
              variant="outline"
              onClick={() => setSearchTerm("")}
              disabled={!searchTerm}
            >
              クリア
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ゲスト一覧 ({filteredGuests.length}件)</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredGuests.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              {searchTerm ? "検索結果がありません" : "ゲストがいません"}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>氏名</TableHead>
                  <TableHead>会社名</TableHead>
                  <TableHead>来社目的</TableHead>
                  <TableHead>登録日時</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGuests.map((guest) => (
                  <TableRow key={guest.id}>
                    <TableCell className="font-medium">{guest.name}</TableCell>
                    <TableCell>{guest.company}</TableCell>
                    <TableCell>{guest.purpose}</TableCell>
                    <TableCell>
                      {format(new Date(guest.createdAt), "MM/dd HH:mm", {
                        locale: ja,
                      })}
                    </TableCell>
                    <TableCell>{getStatusBadge(guest.status)}</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedGuest(guest)}
                          >
                            詳細
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>ゲスト詳細情報</DialogTitle>
                          </DialogHeader>
                          {selectedGuest && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-gray-600">
                                    氏名
                                  </label>
                                  <p className="text-sm">
                                    {selectedGuest.name}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-600">
                                    メールアドレス
                                  </label>
                                  <p className="text-sm">
                                    {selectedGuest.email}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-600">
                                    電話番号
                                  </label>
                                  <p className="text-sm">
                                    {selectedGuest.phone}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-600">
                                    会社名
                                  </label>
                                  <p className="text-sm">
                                    {selectedGuest.company}
                                  </p>
                                </div>
                                <div className="col-span-2">
                                  <label className="text-sm font-medium text-gray-600">
                                    来社目的
                                  </label>
                                  <p className="text-sm">
                                    {selectedGuest.purpose}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-600">
                                    登録日時
                                  </label>
                                  <p className="text-sm">
                                    {format(
                                      new Date(selectedGuest.createdAt),
                                      "yyyy/MM/dd HH:mm",
                                      {
                                        locale: ja,
                                      }
                                    )}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-600">
                                    ステータス
                                  </label>
                                  <div className="mt-1">
                                    {getStatusBadge(selectedGuest.status)}
                                  </div>
                                </div>
                                {selectedGuest.lastCheckInTime && (
                                  <div>
                                    <label className="text-sm font-medium text-gray-600">
                                      最終入場時刻
                                    </label>
                                    <p className="text-sm">
                                      {format(
                                        new Date(selectedGuest.lastCheckInTime),
                                        "yyyy/MM/dd HH:mm",
                                        {
                                          locale: ja,
                                        }
                                      )}
                                    </p>
                                  </div>
                                )}
                                {selectedGuest.lastCheckOutTime && (
                                  <div>
                                    <label className="text-sm font-medium text-gray-600">
                                      最終退場時刻
                                    </label>
                                    <p className="text-sm">
                                      {format(
                                        new Date(
                                          selectedGuest.lastCheckOutTime
                                        ),
                                        "yyyy/MM/dd HH:mm",
                                        {
                                          locale: ja,
                                        }
                                      )}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
