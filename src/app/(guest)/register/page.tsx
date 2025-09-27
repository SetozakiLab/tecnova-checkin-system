"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { ApiResponse, GuestData, GradeValue } from "@/types/api";
import { GradeSelect } from "@/components/ui/grade-select";
import { useGuestSoundEffects } from "@/hooks/use-guest-sound-effects";
import { motion } from "motion/react";
import { ArrowLeft, Home, UserPlus, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  grade: z.enum(
    [
      "ES1",
      "ES2",
      "ES3",
      "ES4",
      "ES5",
      "ES6",
      "JH1",
      "JH2",
      "JH3",
      "HS1",
      "HS2",
      "HS3",
    ] as const,
    { required_error: "学年を選択してください" }
  ),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "利用規約に同意してください",
  }),
});

type RegisterFormData = z.infer<typeof registerSchema>;

type RegisterFormProps = {
  soundEffects: ReturnType<typeof useGuestSoundEffects>;
};

// SearchParamsを使用するコンポーネントを分離
function RegisterForm({ soundEffects }: RegisterFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [agreedFromTerms, setAgreedFromTerms] = useState(false);
  const { playClick, playSuccess } = soundEffects;

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
      playClick();
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
          grade: data.grade,
        }),
      });

      const result: ApiResponse<GuestData> = await response.json();

      if (!result.success) {
        setError(result.error?.message || "登録に失敗しました");
        return;
      }

      // 登録後は自動チェックイン済みのため、チェックイン完了ページへ
      playSuccess();
      router.push(`/checkin/complete?type=checkin&guestId=${result.data!.id}`);
    } catch (err) {
      console.error("Registration error:", err);
      setError("サーバーエラーが発生しました");
    } finally {
      // no-op

      setLoading(false);
    }
  };

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="text-center">
        <div className="mb-2 flex justify-center">
          <Badge variant="secondary" className="gap-1 text-slate-600">
            <UserPlus className="h-3 w-3" aria-hidden />
            新規登録
          </Badge>
        </div>
        <CardTitle className="text-lg font-semibold text-slate-900">
          あなたの情報を教えてください
        </CardTitle>
        <CardDescription className="text-sm text-slate-500">
          チェックイン時に必要な最低限の情報のみを入力してください
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-6 pt-2">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* エラーメッセージ */}
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
              <p className="text-center text-sm font-medium text-rose-700">
                {error}
              </p>
            </div>
          )}

          {/* 名前 */}
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="text-sm font-medium text-slate-700"
            >
              お名前（ニックネーム） <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="テッくん"
              className="h-12 text-base"
              disabled={loading}
            />
            {errors.name && (
              <p className="text-sm text-rose-600">{errors.name.message}</p>
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
          {/* 学年 */}
          <div className="space-y-2">
            <Label
              htmlFor="grade"
              className="text-sm font-medium text-slate-700"
            >
              学年 <span className="text-rose-500">*</span>
            </Label>
            <GradeSelect
              value={watch("grade") as GradeValue | null | undefined}
              onChange={(v) => {
                if (!v) return;
                setValue("grade", v);
              }}
              disabled={loading}
            />
            {errors.grade && (
              <p className="text-sm text-rose-600">{errors.grade.message}</p>
            )}
          </div>

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
                      className="text-slate-900 underline"
                      onClick={() => playClick()}
                    >
                      利用規約
                    </Link>
                    を読んで同意します <span className="text-red-500">*</span>
                  </Label>
                </div>
              </div>
              {errors.acceptTerms && (
                <p className="text-sm text-rose-600">
                  {errors.acceptTerms.message}
                </p>
              )}
            </div>
          )}

          {agreedFromTerms && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="flex items-center justify-center gap-2 text-sm font-medium text-slate-700">
                <CheckCircle2 className="h-4 w-4" aria-hidden />{" "}
                利用規約に同意済み
              </p>
            </div>
          )}

          {/* ボタン */}
          <div className="flex gap-3 pt-4">
            <Link href={agreedFromTerms ? "/terms" : "/"} className="flex-1">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full"
                disabled={loading}
                onClick={() => playClick()}
              >
                戻る
              </Button>
            </Link>
            <Button
              type="submit"
              size="lg"
              className="flex-1 bg-slate-900 hover:bg-slate-800"
              disabled={loading || !acceptTerms || !watch("grade")}
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
  const soundEffects = useGuestSoundEffects();
  const { playClick } = soundEffects;

  return (
    <div className="flex flex-1 flex-col">
      <div className="mx-auto flex-1 px-4 py-10 md:max-w-3xl md:px-6">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex h-full flex-col gap-8"
        >
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Link href="/" onClick={() => playClick()} className="block">
                  <h1 className="text-3xl font-semibold text-slate-900 flex items-center gap-2">
                    <UserPlus className="h-8 w-8" aria-hidden />
                    新規登録
                  </h1>
                </Link>
                <p className="mt-3 text-sm text-slate-600">
                  初めての方は、こちらから登録を完了してください。
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:w-auto sm:flex-row">
                <Link href="/checkin" className="flex-1 sm:flex-none">
                  <Button
                    variant="secondary"
                    className="w-full min-w-[150px] justify-center gap-2 text-slate-700"
                    onClick={() => playClick()}
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden />
                    チェックアウトへ
                  </Button>
                </Link>
                <Link href="/" className="flex-1 sm:flex-none">
                  <Button
                    variant="ghost"
                    className="w-full min-w-[150px] justify-center gap-2 text-slate-600"
                    onClick={() => playClick()}
                  >
                    <Home className="h-4 w-4" aria-hidden />
                    トップへ戻る
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Suspense
            fallback={
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="px-6 py-16 text-center text-sm text-slate-500">
                  登録フォームを読み込んでいます...
                </CardContent>
              </Card>
            }
          >
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <RegisterForm soundEffects={soundEffects} />
            </motion.div>
          </Suspense>
        </motion.section>
      </div>
    </div>
  );
}
