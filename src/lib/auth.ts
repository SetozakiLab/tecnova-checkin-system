import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./db";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
        });

        if (
          user &&
          (await bcrypt.compare(credentials.password, user.hashedPassword))
        ) {
          return {
            id: user.id,
            name: user.username,
          };
        }

        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};

// 管理者認証が必要なAPIのミドルウェア
export const requireAuth = async (
  _req: Request
): Promise<{ user: { id: string } } | null> => {
  // TODO: セッション検証を実装
  // 今回は簡単な実装として、ヘッダーでの認証をスキップ
  return { user: { id: "admin" } };
};
