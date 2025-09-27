"use client";

import { useState, useEffect, useMemo } from "react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import Image from "next/image";

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
    setValue,
    watch,
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
    let ignore = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/users");
        if (res.ok) {
          const json = await res.json();
          const names = (json.data?.users || json.users || []).map(
            (u: any) => u.username
          );
          if (!ignore) setUsers(names);
        }
      } catch (e) {
        console.warn("ユーザー一覧取得に失敗", e);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  // ユーザーが存在しない場合は自動的に新規作成モードへ
  useEffect(() => {
    if (users.length === 0) {
      setMode("create");
    }
  }, [users]);

  // モードやユーザーリスト変更時の初期値調整
  useEffect(() => {
    if (mode === "select" && users.length > 0) {
      const current = watch("username");
      if (!current || !users.includes(current)) {
        setValue("username", users[0], { shouldValidate: true });
      }
    }
    if (mode === "create") {
      // 新規作成時は空にする
      setValue("username", "", { shouldValidate: true });
    }
  }, [mode, users, setValue, watch]);

  // Combobox 用コンポーネント (簡易実装)
  function UserCombobox({
    value,
    onChange,
    candidates,
    disabled,
  }: {
    value: string;
    onChange: (v: string) => void;
    candidates: string[];
    disabled?: boolean;
  }) {
    const [open, setOpen] = useState(false);
    const label = value || "ユーザーを選択";

    const filtered = useMemo(() => candidates, [candidates]);

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "w-full justify-between",
              !value && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <span className="truncate max-w-[200px] text-left">{label}</span>
            <svg
              className="w-4 h-4 opacity-60"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
              />
            </svg>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[260px]" align="start">
          <Command>
            <CommandInput placeholder="ユーザー検索..." />
            <CommandList>
              <CommandEmpty>該当ユーザーがいません</CommandEmpty>
              <CommandGroup heading="ユーザー">
                {filtered.map((u) => (
                  <CommandItem
                    key={u}
                    value={u}
                    onSelect={(val) => {
                      onChange(val);
                      setOpen(false);
                    }}
                  >
                    {u}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <Image
              src="/logo.png"
              alt="テクノバ ロゴ"
              width={400}
              height={160}
              className="mx-auto mb-4 bg-white rounded-lg p-8"
            />
          </Link>
          <h2 className="text-2xl font-bold text-slate-800">管理コンソール</h2>
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

              {/* モード切替 */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={mode === "select" ? "default" : "outline"}
                  disabled={users.length === 0 || loading}
                  onClick={() => setMode("select")}
                >
                  既存ユーザー
                </Button>
                <Button
                  type="button"
                  variant={mode === "create" ? "default" : "outline"}
                  onClick={() => setMode("create")}
                  disabled={loading}
                >
                  新規作成
                </Button>
              </div>

              {/* ユーザー入力 / 選択 */}
              <div className="space-y-2">
                <Label htmlFor="username" className="flex items-center gap-2">
                  ユーザー名
                  {mode === "create" && (
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                      新規
                    </span>
                  )}
                </Label>
                {mode === "select" ? (
                  <UserCombobox
                    value={watch("username") || ""}
                    candidates={users}
                    disabled={loading || users.length === 0}
                    onChange={(val) =>
                      setValue("username", val, { shouldValidate: true })
                    }
                  />
                ) : (
                  <Input
                    id="username"
                    {...register("username")}
                    autoComplete="off"
                    placeholder="例: admin_taro"
                    disabled={loading}
                  />
                )}
                {mode === "select" && users.length === 0 && (
                  <p className="text-xs text-slate-500">
                    まだ管理者ユーザーが存在しません。新規作成を行ってください。
                  </p>
                )}
                {errors.username && (
                  <p className="text-red-500 text-sm">
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* パスワード */}
              <div className="space-y-2">
                <Label htmlFor="password">共通パスワード</Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  placeholder="••••••••"
                  disabled={loading}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm">
                    {errors.password.message}
                  </p>
                )}
                <ul className="text-[11px] leading-relaxed text-slate-500 list-disc pl-4 space-y-1">
                  <li>初回は「新規作成」でユーザー名を登録してください。</li>
                  <li>
                    同一パスワードを変更したい場合はシステム管理者へ連絡。
                  </li>
                </ul>
              </div>

              {/* ログインボタン */}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading
                  ? "ログイン中..."
                  : mode === "create"
                  ? "作成してログイン"
                  : "ログイン"}
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
