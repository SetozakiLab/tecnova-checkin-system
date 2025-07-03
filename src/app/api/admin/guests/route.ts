// src/app/api/admin/guests/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  // TODO: 認証チェックを追加
  try {
    const guests = await prisma.guest.findMany({
      // TODO: ページネーションと検索機能の実装
    });
    return NextResponse.json({ success: true, data: { guests } });
  } catch {
    return NextResponse.json(
      { success: false, error: { message: "Server Error" } },
      { status: 500 }
    );
  }
}
