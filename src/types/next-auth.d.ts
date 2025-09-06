import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      role: "SUPER" | "MANAGER";
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    username: string;
    role: "SUPER" | "MANAGER";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    username: string;
    role: "SUPER" | "MANAGER";
  }
}
