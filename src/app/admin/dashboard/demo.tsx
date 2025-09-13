// Client-side Dashboard for Development/Demo
// 開発・デモ用のクライアントサイドダッシュボード

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  MetricCard, 
  UserAvatarWithStatus,
  StatusBadge
} from "@/components/common";
import { Button } from "@/components/ui/button";
import { RefreshCw, Users, Activity, Clock, TrendingUp, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Mock data for demonstration
const mockStats = {
  totalCheckins: 24,
  currentGuests: 8,
  averageStayTime: 85, // minutes
};

const mockCurrentGuests = [
  {
    id: "1",
    guestId: "guest-1",
    guestName: "田中太郎",
    guestDisplayId: 1001,
    checkinAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    checkoutAt: null,
    isActive: true,
  },
  {
    id: "2", 
    guestId: "guest-2",
    guestName: "佐藤花子",
    guestDisplayId: 1002,
    checkinAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    checkoutAt: null,
    isActive: true,
  },
  {
    id: "3",
    guestId: "guest-3", 
    guestName: "鈴木一郎",
    guestDisplayId: 1003,
    checkinAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    checkoutAt: null,
    isActive: true,
  },
];

function formatTime(date: Date): string {
  return date.toLocaleTimeString('ja-JP', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

function formatStayDuration(durationMinutes: number): string {
  if (durationMinutes < 60) {
    return `${durationMinutes}分`;
  }
  
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  
  if (minutes === 0) {
    return `${hours}時間`;
  }
  
  return `${hours}時間${minutes}分`;
}

export default function DashboardDemo() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">ダッシュボード</h1>
            <p className="text-muted-foreground mt-1">
              施設の利用状況をリアルタイムで確認できます
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            更新
          </Button>
        </div>

        {/* Key Metrics */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5" />
            重要指標
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="現在の滞在者数"
              value={mockStats.currentGuests}
              subtitle="人が滞在中"
              icon={Users}
              variant="success"
            />

            <MetricCard
              title="今日のチェックイン数"
              value={mockStats.totalCheckins}
              subtitle="回"
              icon={Activity}
              variant="info"
            />

            <MetricCard
              title="平均滞在時間"
              value={formatStayDuration(mockStats.averageStayTime)}
              icon={Clock}
              variant="default"
            />

            <MetricCard
              title="利用効率"
              value={mockStats.currentGuests > 0 ? "活発" : "静か"}
              subtitle={mockStats.currentGuests > 0 ? "イベント開催中" : "イベント待機中"}
              icon={TrendingUp}
              variant={mockStats.currentGuests > 5 ? "success" : mockStats.currentGuests > 0 ? "warning" : "default"}
            />
          </div>
        </section>

        {/* Two Column Layout for Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Guests */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="space-y-1">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    現在の滞在者
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    リアルタイムで滞在者を確認できます
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-success">
                      {mockCurrentGuests.length}
                    </div>
                    <div className="text-xs text-muted-foreground">人が滞在中</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {mockCurrentGuests.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      現在滞在中のゲストはいません
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      新しいゲストがチェックインすると、ここに表示されます
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {mockCurrentGuests.map((guest) => {
                      const stayDuration = Math.floor((currentTime.getTime() - guest.checkinAt.getTime()) / (1000 * 60));

                      return (
                        <div
                          key={guest.id}
                          className="flex items-center justify-between p-4 bg-accent/50 rounded-lg border border-border/50 hover:bg-accent/70 transition-colors"
                        >
                          <UserAvatarWithStatus
                            name={guest.guestName}
                            displayId={guest.guestDisplayId}
                            isActive={guest.isActive}
                            showStatus={false}
                            className="flex-1"
                          />
                          
                          <div className="text-right space-y-1">
                            <div className="text-sm font-medium text-foreground">
                              {formatTime(guest.checkinAt)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              滞在時間: {formatStayDuration(stayDuration)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions and System Status */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  クイックアクション
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <button className="p-3 text-left rounded-lg border border-border hover:bg-accent transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm">ゲスト管理</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      ゲスト情報の確認・編集
                    </p>
                  </button>
                  
                  <button className="p-3 text-left rounded-lg border border-border hover:bg-accent transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <Activity className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm">履歴確認</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      チェックイン履歴の確認
                    </p>
                  </button>
                  
                  <button className="p-3 text-left rounded-lg border border-border hover:bg-accent transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm">時間管理</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      滞在時間の分析
                    </p>
                  </button>
                  
                  <button className="p-3 text-left rounded-lg border border-border hover:bg-accent transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm">レポート</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      利用状況レポート
                    </p>
                  </button>
                </div>
              </CardContent>
            </Card>
            
            {/* System Status */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">システム状態</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">データベース</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-success rounded-full" />
                    <span className="text-xs text-success">正常</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">リアルタイム更新</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-success rounded-full" />
                    <span className="text-xs text-success">有効</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">最終更新</span>
                  <span className="text-xs text-muted-foreground">
                    {currentTime.toLocaleTimeString('ja-JP')}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Today Summary */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            本日のサマリー
          </h2>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Activity className="h-5 w-5" />
                今日の入退場サマリー
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-muted/30 rounded-lg border">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      総チェックイン数
                    </p>
                    <div className="text-3xl font-bold text-foreground">
                      {mockStats.totalCheckins}
                      <span className="text-base text-muted-foreground ml-1">回</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      今日の累計来場者数
                    </p>
                  </div>
                </div>

                <div className="text-center p-6 bg-muted/30 rounded-lg border">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      現在の滞在者
                    </p>
                    <div className="text-3xl font-bold text-foreground">
                      {mockStats.currentGuests}
                      <span className="text-base text-muted-foreground ml-1">人</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      現在施設内にいる人数
                    </p>
                  </div>
                </div>

                <div className="text-center p-6 bg-muted/30 rounded-lg border">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      平均滞在時間
                    </p>
                    <div className="text-3xl font-bold text-foreground">
                      {formatStayDuration(mockStats.averageStayTime)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      平均的な利用時間
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}