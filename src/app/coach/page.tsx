import Link from "next/link";
import { CoachForm } from "./CoachForm";

export const metadata = {
  title: "话术军师 — 恋爱军师",
  description: "贴聊天 → AI 解读情绪 + 给 3 套话术 + 雷区提醒",
};

export default function CoachPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:py-12 flex-1 w-full">
      <header className="mb-8">
        <Link
          href="/"
          className="text-sm text-rose-600 hover:text-rose-700 dark:text-rose-400"
        >
          ← 回首页
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold mt-3">实时话术军师</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
          把对方刚发来的话贴进来，AI 解读 TA
          在想什么、给你三套话术、列出雷区。不存原文，仅本次会话使用。
        </p>
      </header>
      <CoachForm />
      <footer className="mt-16 pt-6 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-500 text-center">
        <p>本工具仅提供建议，不替代真实情感判断。</p>
        <p className="mt-2">
          <Link href="/about" className="hover:underline">
            关于 &amp; 隐私
          </Link>
        </p>
      </footer>
    </main>
  );
}
