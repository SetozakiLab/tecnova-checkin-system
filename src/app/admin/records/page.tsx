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
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import Link from "next/link";

interface CheckinRecord {
  id: string;
  guestName: string;
  guestCompany: string;
  purpose: string;
  checkInTime: string;
  checkOutTime: string | null;
  duration: string | null;
  status: "checked_in" | "checked_out";
}

export default function CheckinRecordsPage() {
  const [records, setRecords] = useState<CheckinRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRecords, setFilteredRecords] = useState<CheckinRecord[]>([]);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await fetch("/api/admin/checkin-records");
        const data = await res.json();
        if (data.success) {
          setRecords(data.data.records);
          setFilteredRecords(data.data.records);
        }
      } catch (error) {
        console.error("履歴の取得に失敗しました:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecords();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = records.filter(
        (record) =>
          record.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.guestCompany
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          record.purpose.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRecords(filtered);
    } else {
      setFilteredRecords(records);
    }
  }, [searchTerm, records]);

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
        <h1 className="text-2xl font-bold text-gray-900">入退場履歴</h1>
        <Link href="/admin">
          <Button variant="outline">ダッシュボードに戻る</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>履歴検索</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Input
              placeholder="氏名、会社名、来社目的で検索..."
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
          <CardTitle>入退場履歴一覧 ({filteredRecords.length}件)</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRecords.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              {searchTerm ? "検索結果がありません" : "履歴がありません"}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>氏名</TableHead>
                  <TableHead>会社名</TableHead>
                  <TableHead>来社目的</TableHead>
                  <TableHead>入場時刻</TableHead>
                  <TableHead>退場時刻</TableHead>
                  <TableHead>滞在時間</TableHead>
                  <TableHead>ステータス</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      {record.guestName}
                    </TableCell>
                    <TableCell>{record.guestCompany}</TableCell>
                    <TableCell>{record.purpose}</TableCell>
                    <TableCell>
                      {format(new Date(record.checkInTime), "MM/dd HH:mm", {
                        locale: ja,
                      })}
                    </TableCell>
                    <TableCell>
                      {record.checkOutTime
                        ? format(new Date(record.checkOutTime), "MM/dd HH:mm", {
                            locale: ja,
                          })
                        : "-"}
                    </TableCell>
                    <TableCell>{record.duration || "-"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          record.status === "checked_in"
                            ? "default"
                            : "secondary"
                        }
                        className={
                          record.status === "checked_in"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {record.status === "checked_in" ? "入場中" : "退場済"}
                      </Badge>
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
