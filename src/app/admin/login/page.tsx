"use client";

import { useState, useEffect } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const loginSchema = z.object({
  username: z.string().min(1, "ユーザー名は必須です"),
  password: z.string().min(1, "パスワードは必須です"),
  mode: z.enum(["select", "create"]),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<string[]>([]);
  const [mode, setMode] = useState<"select" | "create">("select");
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { mode: "select" } as any,
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setLoading(true);
      setError("");

      const result = await signIn("credentials", {
        username: data.username,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError("ユーザー名またはパスワードが正しくありません");
        return;
      }

      // セッション確認後にダッシュボードへ遷移
      const session = await getSession();
      if (session) {
        router.push("/admin/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("ログインに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  // 既存ユーザー取得
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/users");
        if (res.ok) {
          const json = await res.json();
          const names = (json.data?.users || json.users || []).map(
            (u: any) => u.username
          );
          setUsers(names);
        }
      } catch (e) {
        console.warn("ユーザー一覧取得に失敗", e);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <h1 className="text-4xl font-bold text-slate-800">tec-nova</h1>
            <p className="text-lg text-slate-600">入退場管理システム</p>
          </Link>
          <h2 className="text-2xl font-bold text-slate-800">管理者ログイン</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-center">
              管理者アカウントでログイン
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* エラーメッセージ */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 text-center text-sm">{error}</p>
                </div>
              )}

              {/* ユーザー選択 / 新規作成 */}
              <div className="space-y-2">
                <Label htmlFor="username">ユーザー</Label>
                {mode === "select" ? (
                  <select
                    id="username"
                    className="w-full border rounded px-3 py-2 text-sm"
                    {...register("username")}
                    disabled={loading || users.length === 0}
                  >
                    {users.length === 0 && (
                      <option value="">ユーザーなし</option>
                    )}
                    {users.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    id="username"
                    {...register("username")}
                    placeholder="新規ユーザー名"
                    disabled={loading}
                  />
                )}
                {errors.username && (
                  <p className="text-red-500 text-sm">
                    {errors.username.message}
                  </p>
                )}
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="text-xs text-blue-600 hover:underline"
                    onClick={() => {
                      const next = mode === "select" ? "create" : "select";
                      setMode(next);
                    }}
                  >
                    {mode === "select"
                      ? "新規ユーザー作成"
                      : "既存ユーザー選択に戻る"}
                  </button>
                </div>
              </div>

              {/* パスワード */}
              <div className="space-y-2">
                <Label htmlFor="password">共通パスワード</Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  placeholder="共通パスワード"
                  disabled={loading}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm">
                    {errors.password.message}
                  </p>
                )}
                <p className="text-xs text-slate-500">
                  初めて管理画面にログインする場合は、新規ユーザー作成を選択し、
                  ユーザー名を入力してください。
                </p>
              </div>

              {/* ログインボタン */}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "ログイン中..." : "ログイン"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* ホームに戻る */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-sm text-slate-600 hover:text-slate-800 underline"
          >
            ホームに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
