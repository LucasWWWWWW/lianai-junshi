import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/Providers";
import { ThemeToggle } from "@/components/ThemeToggle";
import "./globals.css";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://lianai-junshi.netlify.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "恋爱军师 — 懂男女思维差异，不做恋爱糊涂人",
    template: "%s · 恋爱军师",
  },
  description:
    "基于男女思维差异理论的 AI 恋爱实战指导工具。贴上聊天 → 看穿情绪 → 给 3 套话术 + 雷区提醒。",
  keywords: [
    "恋爱话术",
    "高情商回复",
    "男女思维差异",
    "AI 恋爱军师",
    "潜台词解读",
    "情侣矛盾",
    "异地恋",
  ],
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "恋爱军师",
  },
  openGraph: {
    title: "恋爱军师 — 懂男女思维差异，不做恋爱糊涂人",
    description:
      "贴上对方刚发的消息，AI 解读情绪 + 3 套话术 + 雷区提醒。免费试用，不存原文。",
    url: SITE_URL,
    siteName: "恋爱军师",
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "恋爱军师 — AI 恋爱实战指导",
    description: "贴聊天 → AI 给 3 套话术 + 雷区。免费试用。",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#e11d48",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
        <Providers>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-rose-600 focus:text-white focus:px-3 focus:py-1.5 focus:rounded"
          >
            跳到主内容
          </a>
          <ThemeToggle />
          {children}
        </Providers>
      </body>
    </html>
  );
}
