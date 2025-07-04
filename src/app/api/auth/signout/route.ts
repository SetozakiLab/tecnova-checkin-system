import { NextRequest, NextResponse } from "next/server";
import { signOut } from "next-auth/react";
import { ApiResponse } from "@/types/api";

export async function POST(request: NextRequest) {
  try {
    await signOut({ redirect: false });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "ログアウトしました",
    });
  } catch (error) {
    console.error("Signout error:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "サーバー内部エラーが発生しました",
        },
      },
      { status: 500 }
    );
  }
}
