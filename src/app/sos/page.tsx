import Link from "next/link";
import { SosForm } from "./SosForm";

export const metadata = {
  title: "矛盾急救室 — 恋爱军师",
  description:
    "吵架冷战场景专项 AI 道歉话术：根据矛盾激烈度给 3 套梯度道歉 + 复盘 + 雷区。",
};

export default function SosPage() {
  return (
    <main
      id="main"
      className="mx-auto max-w-2xl px-4 py-8 sm:py-12 flex-1 w-full"
    >
      <header className="mb-8">
        <Link
          href="/"
          className="text-sm text-rose-600 hover:text-rose-700 dark:text-rose-400"
        >
          ← 回首页
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold mt-3">
          🆘 矛盾急救室
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
          吵架、冷战、闹矛盾时来这里。AI 会根据矛盾激烈度，给你三套梯度道歉话术（轻量缓和 →
          正式道歉 → 深度认错），加上发送时机建议和雷区警示。
        </p>
      </header>
      <SosForm />
      <footer className="mt-16 pt-6 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-500 text-center">
        <p>急救话术仅供参考，重要决策请结合自身判断。</p>
        <p className="mt-2">
          <Link href="/about" className="hover:underline">
            关于 &amp; 隐私
          </Link>
        </p>
      </footer>
    </main>
  );
}
