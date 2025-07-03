"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

interface DashboardStats {
  totalGuests: number;
  checkedInGuests: number;
  todayVisitors: number;
  todayCheckIns: number;
  todayCheckOuts: number;
}

interface CurrentGuest {
  id: string;
  name: string;
  company: string;
  purpose: string;
  checkInTime: string;
  duration: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [currentGuests, setCurrentGuests] = useState<CurrentGuest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, guestsRes] = await Promise.all([
          fetch("/api/admin/dashboard/today-stats"),
          fetch("/api/admin/dashboard/current-guests"),
        ]);

        const statsData = await statsRes.json();
        const guestsData = await guestsRes.json();

        if (statsData.success) {
          setStats(statsData.data);
        }
        if (guestsData.success) {
          setCurrentGuests(guestsData.data.guests);
        }
      } catch (error) {
        console.error("データの取得に失敗しました:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // 30秒ごとにデータを更新
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

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
        <h1 className="text-2xl font-bold text-gray-900">
          管理者ダッシュボード
        </h1>
        <div className="flex space-x-4">
          <Link href="/admin/guests">
            <Button variant="outline">ゲスト管理</Button>
          </Link>
          <Link href="/admin/records">
            <Button variant="outline">入退場履歴</Button>
          </Link>
        </div>
      </div>

      {/* 統計情報 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              総ゲスト数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats?.totalGuests || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              現在入場中
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.checkedInGuests || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              本日の来場者
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats?.todayVisitors || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              本日の入場数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats?.todayCheckIns || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              本日の退場数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats?.todayCheckOuts || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 現在入場中のゲスト一覧 */}
      <Card>
        <CardHeader>
          <CardTitle>現在入場中のゲスト</CardTitle>
        </CardHeader>
        <CardContent>
          {currentGuests.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              現在入場中のゲストはいません
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>氏名</TableHead>
                  <TableHead>会社名</TableHead>
                  <TableHead>来社目的</TableHead>
                  <TableHead>入場時刻</TableHead>
                  <TableHead>滞在時間</TableHead>
                  <TableHead>ステータス</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentGuests.map((guest) => (
                  <TableRow key={guest.id}>
                    <TableCell className="font-medium">{guest.name}</TableCell>
                    <TableCell>{guest.company}</TableCell>
                    <TableCell>{guest.purpose}</TableCell>
                    <TableCell>
                      {format(new Date(guest.checkInTime), "HH:mm", {
                        locale: ja,
                      })}
                    </TableCell>
                    <TableCell>{guest.duration}</TableCell>
                    <TableCell>
                      <Badge
                        variant="default"
                        className="bg-green-100 text-green-800"
                      >
                        入場中
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 最近の入退場履歴 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>最近の入退場履歴</CardTitle>
          <Link href="/admin/records">
            <Button variant="outline" size="sm">
              すべて表示
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">
            履歴の表示機能は準備中です
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
