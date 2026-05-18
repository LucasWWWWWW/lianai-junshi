import Link from "next/link";
import { HistoryView } from "./HistoryView";

export const metadata = {
  title: "我的错题本 — 恋爱军师",
  description: "本机历史记录（仅存浏览器本地，不上传服务端）",
};

export default function HistoryPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:py-12 flex-1 w-full">
      <header className="mb-6">
        <Link
          href="/coach"
          className="text-sm text-rose-600 hover:text-rose-700 dark:text-rose-400"
        >
          ← 回话术军师
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold mt-3">我的错题本</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
          每一次咨询都自动记录在你的浏览器本地（不上传服务器，最多保留 30
          条）。换浏览器或清缓存会丢失。
        </p>
      </header>
      <HistoryView />
    </main>
  );
}
