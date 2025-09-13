import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { PrismaClient } from "@/generated/prisma";
import { env } from "@/lib/env";

interface AuthUser {
  id: string;
  username: string;
  role: "SUPER" | "MANAGER";
}

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

        const existingUser = await prisma.user.findUnique({
          where: { username: inputUsername },
        });

        if (existingUser) {
          const isPasswordValid = await bcrypt.compare(
            inputPassword,
            existingUser.hashedPassword
          );
          if (!isPasswordValid) return null;
          return {
            id: existingUser.id,
            username: existingUser.username,
            role: existingUser.role,
          } as AuthUser;
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
        const created = await prisma.user.create({
          data: {
            username: inputUsername,
            hashedPassword: hashed,
            role: "MANAGER",
          },
        });
        return {
          id: created.id,
          username: created.username,
          role: created.role,
        } as AuthUser;
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
        const u = user as AuthUser;
        token.username = u.username;
        token.role = u.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.sub!; // next-auth型拡張が未定義なら any に退避
        (session.user as any).username = token.username as string;
        (session.user as any).role = token.role as string;
      }
      return session;
    },
  },
};
