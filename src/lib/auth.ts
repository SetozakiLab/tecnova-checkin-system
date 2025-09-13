import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { PrismaClient } from "@/generated/prisma";
import { env } from "@/lib/env";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const sharedPassword = env.ADMIN_SHARED_PASSWORD;
        const inputUsername = credentials.username.trim();
        const inputPassword = credentials.password;

        const existingUser = (await prisma.user.findUnique({
          where: { username: inputUsername },
        })) as any;

        if (existingUser) {
          // 既存ユーザー: 従来のハッシュ比較
          const isPasswordValid = await bcrypt.compare(
            inputPassword,
            existingUser.hashedPassword
          );
          if (!isPasswordValid) return null;
          return {
            id: existingUser.id,
            username: existingUser.username,
            role: existingUser.role,
          } as any;
        }

        // 新規作成フロー: shared password 必須
        if (!sharedPassword) {
          return null; // 設定なしは作成不可
        }
        if (inputPassword !== sharedPassword) {
          return null; // 共通パスワード不一致
        }

        // MANAGER を作成（ユーザー名一意保証）
        const hashed = await bcrypt.hash(sharedPassword, 10);
        const created = (await prisma.user.create({
          data: {
            username: inputUsername,
            hashedPassword: hashed,
            // role フィールドは新しいマイグレーション後に型へ反映される
            role: "MANAGER" as any,
          } as any,
        })) as any;
        return {
          id: created.id,
          username: created.username,
          role: created.role,
        } as any;
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
  },
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.username = (user as any).username;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!;
        session.user.username = token.username as string;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
};
