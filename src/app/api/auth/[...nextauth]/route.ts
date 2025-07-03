import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import type { AuthOptions } from "next-auth";

const prisma = new PrismaClient();
export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
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
          // パスワードは返さない
          return { id: user.id, name: user.username };
        } else {
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/admin/login", // ログイン画面のパス
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
