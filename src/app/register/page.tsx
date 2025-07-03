"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  guestRegistrationSchema,
  type GuestRegistration,
} from "@/lib/validations";
import { ApiResponse, Guest } from "@/types/api";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GuestRegistration>({
    resolver: zodResolver(guestRegistrationSchema),
  });

  const onSubmit = async (data: GuestRegistration) => {
    if (!agreedToTerms) {
      setError("利用規約に同意してください");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/guests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result: ApiResponse<Guest> = await response.json();

      if (result.success && result.data) {
        // 登録完了画面に遷移
        router.push(
          `/register/complete?id=${result.data.id}&displayId=${result.data.displayId}`
        );
      } else {
        setError(result.error?.message || "登録に失敗しました");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("通信エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* ヘッダー */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">新規登録</h1>
          <p className="text-gray-600">基本情報を入力してください</p>
        </div>

        {/* 利用規約 */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">利用規約</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-h-32 overflow-y-auto bg-gray-50 p-3 rounded text-sm">
              <p className="mb-2">
                tec-nova施設をご利用いただく際は、以下の規約に同意していただく必要があります。
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>施設内では他の利用者に配慮してご利用ください</li>
                <li>飲食は指定された場所でのみ可能です</li>
                <li>機材や設備を大切に使用してください</li>
                <li>退場時は忘れ物がないかご確認ください</li>
                <li>緊急時はスタッフの指示に従ってください</li>
              </ul>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) =>
                  setAgreedToTerms(checked as boolean)
                }
              />
              <Label htmlFor="terms" className="text-sm font-medium">
                利用規約に同意します
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* 登録フォーム */}
        <Card>
          <CardHeader>
            <CardTitle>基本情報</CardTitle>
            <CardDescription>
              お名前はニックネームでも構いません
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* エラーメッセージ */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                  {error}
                </div>
              )}

              {/* 名前 */}
              <div className="space-y-2">
                <Label htmlFor="name">お名前 *</Label>
                <Input
                  id="name"
                  placeholder="田中太郎"
                  {...register("name")}
                  className={errors.name ? "border-red-300" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              {/* メールアドレス */}
              <div className="space-y-2">
                <Label htmlFor="contact">メールアドレス（任意）</Label>
                <Input
                  id="contact"
                  type="email"
                  placeholder="taro@example.com"
                  {...register("contact")}
                  className={errors.contact ? "border-red-300" : ""}
                />
                {errors.contact && (
                  <p className="text-sm text-red-600">
                    {errors.contact.message}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  保護者の方への通知機能で使用します（将来実装予定）
                </p>
              </div>

              {/* ボタン */}
              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  asChild
                >
                  <Link href="/">キャンセル</Link>
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isLoading || !agreedToTerms}
                >
                  {isLoading ? "登録中..." : "登録する"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
