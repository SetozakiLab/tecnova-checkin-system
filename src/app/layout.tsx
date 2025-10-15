import type { Metadata } from "next";
import { Noto_Sans_JP, Roboto, Roboto_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { SessionProvider } from "@/components/session-provider";
import "./globals.css";

const notoSans = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

const roboto = Roboto({
  variable: "--font-roboto",
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "テクノバ 入退場管理システム",
  description: "テクノバ施設の入退場管理システム",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        className={`${notoSans.variable} ${roboto.variable} ${robotoMono.variable} antialiased touch-pan-y`}
      >
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
