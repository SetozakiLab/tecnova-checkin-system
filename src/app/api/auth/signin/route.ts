import { type NextRequest, NextResponse } from "next/server";
import { signIn } from "next-auth/react";
import type { ApiResponse } from "@/types/api";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "ユーザー名とパスワードは必須です",
          },
        },
        { status: 400 },
      );
    }

    // NextAuth.jsのsignIn関数を使用してログイン
    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    if (result?.error) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "ユーザー名またはパスワードが正しくありません",
          },
        },
        { status: 401 },
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "ログインしました",
    });
  } catch (error) {
    console.error("Signin error:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "サーバー内部エラーが発生しました",
        },
      },
      { status: 500 },
    );
  }
}
