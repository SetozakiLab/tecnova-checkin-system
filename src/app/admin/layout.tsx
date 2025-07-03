import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link
                href="/admin"
                className="text-xl font-semibold text-gray-900 hover:text-blue-600"
              >
                tec-nova 入退場管理システム（管理者）
              </Link>
              <nav className="flex space-x-6">
                <Link
                  href="/admin"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  ダッシュボード
                </Link>
                <Link
                  href="/admin/guests"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  ゲスト管理
                </Link>
                <Link
                  href="/admin/records"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  入退場履歴
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                ログイン中: {session.user?.email}
              </span>
              <a
                href="/api/auth/signout"
                className="text-sm text-blue-600 hover:text-blue-800 px-3 py-2 rounded-md border border-blue-300 hover:border-blue-400"
              >
                ログアウト
              </a>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
