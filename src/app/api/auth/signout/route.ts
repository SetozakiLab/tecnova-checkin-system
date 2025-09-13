import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ApiResponse } from "@/types/api";

// next-auth v4 credentials ではサーバー側 signOut API は特別処理不要: セッションはJWT/DBトークンをクライアント側で破棄
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json<ApiResponse>(
        {
          success: true,
          message: "既にサインアウト済みです",
        },
        { status: 200 }
      );
    }
    // クライアント側で next-auth signOut() が cookie/state を処理する想定
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
