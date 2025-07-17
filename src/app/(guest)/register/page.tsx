"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ApiResponse, GuestData } from "@/types/api";

const registerSchema = z.object({
  name: z
    .string()
    .min(1, "名前は必須です")
    .max(50, "名前は50文字以内で入力してください"),
  contact: z
    .string()
    .email("正しいメールアドレスを入力してください")
    .optional()
    .or(z.literal("")),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "利用規約に同意してください",
  }),
});

type RegisterFormData = z.infer<typeof registerSchema>;

// SearchParamsを使用するコンポーネントを分離
function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [agreedFromTerms, setAgreedFromTerms] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      acceptTerms: false,
    },
  });

  useEffect(() => {
    const agreed = searchParams.get("agreed") === "true";
    if (agreed) {
      setAgreedFromTerms(true);
      setValue("acceptTerms", true);
    }
  }, [searchParams, setValue]);

  const acceptTerms = watch("acceptTerms");

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/guests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          contact: data.contact || undefined,
        }),
      });

      const result: ApiResponse<GuestData> = await response.json();

      if (!result.success) {
        setError(result.error?.message || "登録に失敗しました");
        return;
      }

      // 登録完了ページに遷移
      router.push(`/register/complete?guestId=${result.data!.id}`);
    } catch (err) {
      console.error("Registration error:", err);
      setError("サーバーエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl text-center">
          あなたの情報を教えてください
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* エラーメッセージ */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-center">{error}</p>
            </div>
          )}

          {/* 名前 */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-lg">
              お名前（ニックネーム） <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="テッくん"
              className="text-lg p-4 h-12"
              disabled={loading}
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>

          {/* メールアドレス（任意） */}
          {/* <div className="space-y-2">
            <Label htmlFor="contact" className="text-lg">
              メールアドレス（入力しなくても大丈夫です）
            </Label>
            <Input
              id="contact"
              type="email"
              {...register("contact")}
              placeholder="taro@example.com"
              className="text-lg p-4 h-12"
              disabled={loading}
            />
            {errors.contact && (
              <p className="text-red-500 text-sm">
                {errors.contact.message}
              </p>
            )}
          </div> */}
          {/* 利用規約同意 */}
          {!agreedFromTerms && (
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="acceptTerms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) =>
                    setValue("acceptTerms", checked === true)
                  }
                  disabled={loading}
                />
                <div>
                  <Label htmlFor="acceptTerms" className="text-lg">
                    <Link
                      href="/terms"
                      className="text-blue-600 hover:underline"
                    >
                      利用規約
                    </Link>
                    を読んで同意します{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                </div>
              </div>
              {errors.acceptTerms && (
                <p className="text-red-500 text-sm">
                  {errors.acceptTerms.message}
                </p>
              )}
            </div>
          )}

          {agreedFromTerms && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-700 text-center">
                ✓ 利用規約に同意済み
              </p>
            </div>
          )}

          {/* ボタン */}
          <div className="flex gap-4 pt-4">
            <Link
              href={agreedFromTerms ? "/terms" : "/"}
              className="flex-1"
            >
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                戻る
              </Button>
            </Link>
            <Button
              type="submit"
              size="lg"
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={loading || !acceptTerms}
            >
              {loading ? "登録中..." : "登録する"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <h1 className="text-4xl font-bold text-emerald-900">tec-nova</h1>
          </Link>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">新規登録</h2>
          <p className="text-lg text-gray-600">初回利用者の情報登録</p>
        </div>

        <Suspense fallback={<div>Loading...</div>}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
