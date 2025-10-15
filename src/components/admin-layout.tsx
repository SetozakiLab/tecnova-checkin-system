"use client";

import {
  Download,
  History as HistoryIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  User2Icon,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { type ReactNode, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
}

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

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

  type SessionUser = typeof session.user & { role?: string };
  const user = session.user as SessionUser;

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const navItems = [
    {
      href: "/admin/dashboard",
      label: "ダッシュボード",
      icon: LayoutDashboard,
    },
    { href: "/admin/history", label: "入退場履歴", icon: HistoryIcon },
    { href: "/admin/guests", label: "ゲスト管理", icon: Users },
    { href: "/admin/activity-log", label: "活動ログ記入", icon: HistoryIcon },
    { href: "/admin/exports", label: "CSV出力", icon: Download },
  ];

  const NavLinks = () => (
    <ul className="flex flex-col gap-1">
      {navItems.map((item) => {
        const active = pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className={
                "flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors" +
                (active
                  ? " bg-slate-900 text-white shadow"
                  : " text-slate-600 hover:bg-slate-100")
              }
              onClick={() => setMobileOpen(false)}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* サイドバー (デスクトップ) */}
      <aside className="hidden md:flex w-60 flex-col border-r bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="h-16 px-4 flex items-center border-b">
          <Link
            href="/admin/dashboard"
            className="mx-auto flex flex-col items-center leading-tight text-center"
          >
            <Image
              src="/images/logo_tecnova.png"
              alt="テクノバ Nagasaki"
              width={160}
              height={40}
              className="h-8 w-auto"
              priority
            />
            <span className="text-[11px] text-slate-500">管理コンソール</span>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <NavLinks />
        </div>
        <div className="p-4 border-t text-xs text-slate-500 space-y-1">
          <div>ログイン中: {session.user.username}</div>
          {user.role && (
            <div className="inline-flex items-center rounded bg-slate-200 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-slate-700">
              {user.role}
            </div>
          )}
        </div>
      </aside>

      {/* メインカラム */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* ヘッダー (トップバー) */}
        <header className="h-16 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 flex items-center">
          <div className="flex-1 flex items-center justify-between px-4 gap-4">
            <div className="flex items-center gap-3">
              {/* モバイルメニュー */}
              <button
                className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border bg-white text-slate-600 hover:bg-slate-100"
                onClick={() => setMobileOpen((v) => !v)}
                aria-label="メニュー"
              >
                <Menu className="h-4 w-4" />
              </button>
              {title && (
                <h1 className="text-xl font-semibold tracking-tight text-slate-800">
                  {title}
                </h1>
              )}
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <User2Icon className="h-4 w-4" />
                    <span className="max-w-[120px] truncate text-left text-xs leading-tight">
                      {session.user.username}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5 text-xs text-slate-500">
                    ロール: {user.role || "-"}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="gap-2 cursor-pointer"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4" /> ログアウト
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* コンテンツ */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">{children}</main>
      </div>

      {/* モバイルサイドドロワー (簡易) */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          aria-modal="true"
          role="dialog"
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-60 bg-white shadow-lg flex flex-col">
            <div className="h-16 flex items-center px-4 border-b">
              <span className="font-semibold">メニュー</span>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-4">
              <NavLinks />
            </div>
            <div className="p-4 border-t">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" /> ログアウト
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
