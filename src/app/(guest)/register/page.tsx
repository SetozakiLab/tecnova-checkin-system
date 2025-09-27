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
import { ApiResponse, GuestData, GradeValue } from "@/types/api";
import { GradeSelect } from "@/components/ui/grade-select";
import { useGuestSoundEffects } from "@/hooks/use-guest-sound-effects";
import { PageContainer } from "@/components/ui/page-container";
import { FadeIn, SlideInLeft, ScaleIn } from "@/components/ui/motion";
import { ArrowLeft, UserPlus, CheckCircle, AlertTriangle } from "lucide-react";

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
    <SlideInLeft delay={0.2}>
      <Card className="border-2 border-emerald-200/50 bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-full flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-emerald-600" />
            </div>
            <CardTitle className="text-xl text-center">
              あなたの情報を教えてください
            </CardTitle>
          </div>
          <p className="text-center text-muted-foreground">初回利用に必要な情報を入力してください</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Error Message */}
            {error && (
              <ScaleIn delay={0.1}>
                <div className="bg-gradient-to-r from-red-50/80 to-pink-50/80 border border-red-200/50 rounded-lg p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <p className="text-red-700 font-medium">{error}</p>
                  </div>
                </div>
              </ScaleIn>
            )}

            {/* Name Field */}
            <FadeIn delay={0.1} className="space-y-3">
              <Label htmlFor="name" className="text-lg font-medium flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-emerald-600" />
                お名前（ニックネーム） <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="テッくん"
                className="text-lg p-4 h-12 bg-white/90 backdrop-blur-sm border-emerald-200/50 focus:border-emerald-400/60"
                disabled={loading}
              />
              {errors.name && (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3 text-red-500" />
                  <p className="text-red-500 text-sm">{errors.name.message}</p>
                </div>
              )}
            </FadeIn>

            {/* Grade Field */}
            <FadeIn delay={0.2} className="space-y-3">
              <Label htmlFor="grade" className="text-lg font-medium">
                学年 <span className="text-red-500">*</span>
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
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3 text-red-500" />
                  <p className="text-red-500 text-sm">{errors.grade.message}</p>
                </div>
              )}
            </FadeIn>

            {/* Terms Agreement */}
            {!agreedFromTerms ? (
              <FadeIn delay={0.3} className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="acceptTerms"
                    checked={acceptTerms}
                    onCheckedChange={(checked) =>
                      setValue("acceptTerms", checked === true)
                    }
                    disabled={loading}
                    className="mt-1 border-emerald-300/50 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                  />
                  <div className="flex-1">
                    <Label htmlFor="acceptTerms" className="text-lg cursor-pointer leading-relaxed">
                      <Link
                        href="/terms"
                        className="text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
                        onClick={() => playClick()}
                      >
                        利用規約
                      </Link>
                      を読んで同意します <span className="text-red-500">*</span>
                    </Label>
                  </div>
                </div>
                {errors.acceptTerms && (
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-3 w-3 text-red-500" />
                    <p className="text-red-500 text-sm">
                      {errors.acceptTerms.message}
                    </p>
                  </div>
                )}
              </FadeIn>
            ) : (
              <ScaleIn delay={0.3}>
                <div className="bg-gradient-to-r from-emerald-50/80 to-green-50/80 border border-emerald-200/50 rounded-lg p-4 backdrop-blur-sm">
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    <p className="text-emerald-700 font-medium">利用規約に同意済み</p>
                  </div>
                </div>
              </ScaleIn>
            )}

            {/* Action Buttons */}
            <FadeIn delay={0.4} className="flex flex-col sm:flex-row gap-4 pt-6">
              <Link href={agreedFromTerms ? "/terms" : "/"} className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full border-emerald-200/50 hover:bg-emerald-50/50 transition-all duration-300"
                  disabled={loading}
                  onClick={() => playClick()}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  戻る
                </Button>
              </Link>
              <Button
                type="submit"
                size="lg"
                className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                disabled={loading || !acceptTerms || !watch("grade")}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                {loading ? "登録中..." : "登録する"}
              </Button>
            </FadeIn>
          </form>
        </CardContent>
      </Card>
    </SlideInLeft>
  );
}

export default function RegisterPage() {
  const soundEffects = useGuestSoundEffects();
  const { playClick } = soundEffects;

  return (
    <PageContainer gradient="green">
      <div className="max-w-2xl mx-auto w-full">
        {/* Header */}
        <FadeIn delay={0.1} className="text-center mb-12">
          <Link
            href="/"
            className="inline-block mb-8 group transition-all duration-300 hover:scale-105"
            onClick={() => playClick()}
          >
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">
              tec-nova
            </h1>
          </Link>
          
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-full flex items-center justify-center">
              <UserPlus className="h-6 w-6 text-emerald-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">新規登録</h2>
          </div>
          <p className="text-lg text-muted-foreground">初回利用者の情報登録</p>
        </FadeIn>

        <Suspense fallback={
          <SlideInLeft delay={0.2}>
            <Card className="border-2 border-emerald-200/50 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardContent className="p-8">
                <div className="text-center text-muted-foreground">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                  読み込み中...
                </div>
              </CardContent>
            </Card>
          </SlideInLeft>
        }>
          <RegisterForm soundEffects={soundEffects} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
