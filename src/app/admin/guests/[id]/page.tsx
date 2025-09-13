import { AdminLayout } from "@/components/admin-layout";
import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatDateTime } from "@/lib/date-utils";
import { formatGradeDisplay } from "@/domain/value-objects/grade";
import { getServerGuestDetailStats } from "@/infrastructure/server-data";
import { Activity, Clock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GuestDetailCharts } from "@/components/features/admin/guest-detail-charts";

// Adapted to Next.js generated types where params/searchParams may be Promises
interface GuestDetailPageProps {
  params?: Promise<{ id: string }>; // Next.js generated PageProps expects Promise
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function GuestDetailPage({
  params,
}: GuestDetailPageProps) {
  const resolvedParams = params ? await params : undefined;
  if (!resolvedParams) return notFound();
  const data = await getServerGuestDetailStats(resolvedParams.id);
  if (!data) return notFound();
  const { guest, stats } = data;

  const averageStay =
    stats.totalVisitCount > 0
      ? Math.floor(stats.totalStayMinutes / stats.totalVisitCount)
      : 0;

  const chartData = stats.daily.map((d) => ({
    date: d.date.slice(5), // MM-DD
    stayMinutes: d.stayMinutes,
    visitCount: d.visitCount,
  }));

  return (
    <AdminLayout title={`ゲスト詳細: ${guest.name}`}>
      <div className="space-y-8">
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                基本情報
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">表示ID:</span>{" "}
                <span className="font-medium">{guest.displayId}</span>
              </div>
              <div>
                <span className="text-muted-foreground">名前:</span>{" "}
                <span className="font-medium">{guest.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground">学年:</span>{" "}
                {guest.grade ? formatGradeDisplay(guest.grade) : "-"}
              </div>
              <div>
                <span className="text-muted-foreground">連絡先:</span>{" "}
                {guest.contact || "-"}
              </div>
              <div>
                <span className="text-muted-foreground">登録日:</span>{" "}
                {formatDateTime(guest.createdAt)}
              </div>
              <div>
                <span className="text-muted-foreground">最終訪問:</span>{" "}
                {stats.lastVisitAt ? formatDateTime(stats.lastVisitAt) : "-"}
              </div>
              <div>
                <span className="text-muted-foreground">オンライン:</span>{" "}
                {stats.isCurrentlyCheckedIn ? (
                  <Badge className="bg-green-500 text-white hover:bg-green-500/90">
                    滞在中
                  </Badge>
                ) : (
                  <Badge variant="outline">不在</Badge>
                )}
              </div>
            </CardContent>
          </Card>
          <div className="md:col-span-2 grid gap-6 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  累計訪問
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {stats.totalVisitCount}
                </div>
                <p className="text-xs text-muted-foreground mt-1">回</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  累計滞在
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {stats.totalStayMinutes}
                </div>
                <p className="text-xs text-muted-foreground mt-1">分</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  平均滞在
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{averageStay}</div>
                <p className="text-xs text-muted-foreground mt-1">分/訪問</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <GuestDetailCharts data={chartData} />
      </div>
    </AdminLayout>
  );
}
