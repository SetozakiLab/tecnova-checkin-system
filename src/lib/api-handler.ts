import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ApiResponse } from "@/types/api";
import { z } from "zod";

// HTTPメソッドの型定義
export type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

// APIハンドラーのオプション
export interface ApiHandlerOptions {
  requireAuth?: boolean;
  allowedMethods?: HTTPMethod[];
}

// APIハンドラーの型
export type ApiHandler = (
  request: NextRequest,
  context?: any
) => Promise<NextResponse>;

// 認証チェックミドルウェア
export async function requireAuth(
  request: NextRequest
): Promise<NextResponse | null> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "認証が必要です",
        },
      },
      { status: 401 }
    );
  }
  return null; // 認証成功
}

// メソッドチェックミドルウェア
export function checkMethod(allowedMethods: HTTPMethod[]) {
  return (request: NextRequest): NextResponse | null => {
    if (!allowedMethods.includes(request.method as HTTPMethod)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: "METHOD_NOT_ALLOWED",
            message: `${request.method} メソッドは許可されていません`,
          },
        },
        { status: 405 }
      );
    }
    return null; // メソッドチェック成功
  };
}

// Zodバリデーションヘルパー
export function validateRequest<T>(schema: z.ZodSchema<T>) {
  return async (
    request: NextRequest
  ): Promise<{ data: T } | { error: NextResponse }> => {
    try {
      const body = await request.json();
      const data = schema.parse(body);
      return { data };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          error: NextResponse.json<ApiResponse>(
            {
              success: false,
              error: {
                code: "VALIDATION_ERROR",
                message: "入力内容に誤りがあります",
                details: error.errors.map((err) => ({
                  field: err.path.join("."),
                  message: err.message,
                })),
              },
            },
            { status: 400 }
          ),
        };
      }
      return {
        error: NextResponse.json<ApiResponse>(
          {
            success: false,
            error: {
              code: "BAD_REQUEST",
              message: "リクエストボディの形式が正しくありません",
            },
          },
          { status: 400 }
        ),
      };
    }
  };
}

// エラーレスポンス作成ヘルパー
export function createErrorResponse(
  code: string,
  message: string,
  status: number = 500,
  details?: any
): NextResponse {
  return NextResponse.json<ApiResponse>(
    {
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
      },
    },
    { status }
  );
}

// 成功レスポンス作成ヘルパー
export function createSuccessResponse<T>(
  data?: T,
  message?: string,
  status: number = 200
): NextResponse {
  return NextResponse.json<ApiResponse<T>>(
    {
      success: true,
      ...(data !== undefined && { data }),
      ...(message && { message }),
    },
    { status }
  );
}

// 共通エラーハンドラー
export function handleApiError(
  error: unknown,
  operation: string
): NextResponse {
  console.error(`${operation} error:`, error);

  if (error instanceof z.ZodError) {
    return createErrorResponse(
      "VALIDATION_ERROR",
      "入力内容に誤りがあります",
      400,
      error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }))
    );
  }

  return createErrorResponse(
    "INTERNAL_SERVER_ERROR",
    "サーバー内部エラーが発生しました"
  );
}

// APIハンドラーラッパー
export function withApiHandler(
  handler: ApiHandler,
  options: ApiHandlerOptions = {}
): ApiHandler {
  return async (request: NextRequest, context?: any) => {
    try {
      // メソッドチェック
      if (options.allowedMethods) {
        const methodCheck = checkMethod(options.allowedMethods)(request);
        if (methodCheck) return methodCheck;
      }

      // 認証チェック
      if (options.requireAuth) {
        const authCheck = await requireAuth(request);
        if (authCheck) return authCheck;
      }

      // メインハンドラー実行
      return await handler(request, context);
    } catch (error) {
      return handleApiError(error, "API Handler");
    }
  };
}
