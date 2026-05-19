import Link from "next/link";
import { DICT_ENTRIES } from "@/lib/dict-data";
import { DictView } from "./DictView";

export const metadata = {
  title: "潜台词词典 — 恋爱军师",
  description:
    "30+ 条常见情侣对话潜台词解读：男女说「没事」「随便」「我先忙了」的真实含义、雷区回应和优秀示范。",
};

export default function DictPage() {
  return (
    <main
      id="main"
      className="mx-auto max-w-3xl px-4 py-8 sm:py-12 flex-1 w-full"
    >
      <header className="mb-8">
        <Link
          href="/"
          className="text-sm text-rose-600 hover:text-rose-700 dark:text-rose-400"
        >
          ← 回首页
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold mt-3">📖 潜台词词典</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
          收录 {DICT_ENTRIES.length}+ 条常见情侣对话潜台词。每条都标明真实含义、最常踩的雷区回应、优秀示范。
          搜索关键词或按标签筛选。
        </p>
      </header>
      <DictView entries={DICT_ENTRIES} />
      <footer className="mt-16 pt-6 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-500 text-center">
        <p>词条解读基于男女思维差异的普遍规律，个体差异请结合自身判断。</p>
        <p className="mt-2">
          <Link href="/about" className="hover:underline">
            关于 &amp; 隐私
          </Link>
        </p>
      </footer>
    </main>
  );
}
