"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/dashboard"
                className="flex items-center space-x-2"
              >
                <h1 className="text-2xl font-bold text-slate-800">tec-nova</h1>
                <span className="text-sm text-slate-600">管理画面</span>
              </Link>
            </div>

            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="/admin/dashboard"
                className="text-slate-600 hover:text-slate-900 font-medium"
              >
                ダッシュボード
              </Link>
              <Link
                href="/admin/history"
                className="text-slate-600 hover:text-slate-900 font-medium"
              >
                入退場履歴
              </Link>
              <Link
                href="/admin/guests"
                className="text-slate-600 hover:text-slate-900 font-medium"
              >
                ゲスト管理
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600 flex items-center space-x-2">
                <span>ログイン中: {session.user.username}</span>
                {(session.user as any).role && (
                  <span className="px-2 py-0.5 text-xs rounded bg-slate-200 text-slate-700">
                    {(session.user as any).role === "SUPER"
                      ? "SUPER"
                      : "MANAGER"}
                  </span>
                )}
              </span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                ログアウト
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {title && (
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900">{title}</h2>
          </div>
        )}
        {children}
      </main>

      {/* モバイルナビゲーション */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="grid grid-cols-3 py-2">
          <Link
            href="/admin/dashboard"
            className="flex flex-col items-center py-2 px-3 text-slate-600 hover:text-slate-900"
          >
            <span className="text-xs">ダッシュボード</span>
          </Link>
          <Link
            href="/admin/history"
            className="flex flex-col items-center py-2 px-3 text-slate-600 hover:text-slate-900"
          >
            <span className="text-xs">履歴</span>
          </Link>
          <Link
            href="/admin/guests"
            className="flex flex-col items-center py-2 px-3 text-slate-600 hover:text-slate-900"
          >
            <span className="text-xs">ゲスト</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
