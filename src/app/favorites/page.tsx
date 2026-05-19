import Link from "next/link";
import { FavoritesView } from "./FavoritesView";

export const metadata = {
  title: "我的金句库 — 恋爱军师",
  description: "本机收藏的话术（仅存浏览器本地，不上传服务端）",
};

export default function FavoritesPage() {
  return (
    <main id="main" className="mx-auto max-w-2xl px-4 py-8 sm:py-12 flex-1 w-full">
      <header className="mb-6">
        <Link
          href="/coach"
          className="text-sm text-rose-600 hover:text-rose-700 dark:text-rose-400"
        >
          ← 回话术军师
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold mt-3">我的金句库</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
          在话术结果区点击 ☆ 可收藏；这里汇总你所有保存的回复，方便随时复用。
          仅存浏览器本地，最多 100 条。
        </p>
      </header>
      <FavoritesView />
    </main>
  );
}
