import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:py-20 flex-1">
      <section className="text-center mb-16">
        <div className="inline-block px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 text-xs font-medium mb-5">
          v0.1 MVP · 话术军师已上线
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
          懂男女思维差异，
          <br className="sm:hidden" />
          不做恋爱糊涂人
        </h1>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mt-6 max-w-xl mx-auto leading-relaxed">
          贴上对方刚发来的微信，AI
          帮你看穿情绪、给出三套话术、避开雷区。专业恋爱实战指导工具，告别瞎猜瞎回。
        </p>
        <Link
          href="/coach"
          className="inline-block mt-8 px-8 py-3 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-full font-medium transition shadow-lg shadow-rose-600/20"
        >
          立即试用 →
        </Link>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4 text-center">
          产品路线图
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <FeatureCard
            emoji="💬"
            title="实时话术军师"
            desc="贴聊天，秒出 3 套高情商回复 + 雷区提醒"
            status="可用"
          />
          <FeatureCard
            emoji="🆘"
            title="矛盾急救室"
            desc="吵架冷战场景，AI 出道歉话术 + 复盘"
            status="近期"
          />
          <FeatureCard
            emoji="📖"
            title="潜台词词典"
            desc="读懂对方「我没事」「随便」的真实含义"
            status="近期"
          />
          <FeatureCard
            emoji="📊"
            title="关系雷达"
            desc="测评关系健康度，可视化看见隐患"
            status="规划中"
          />
          <FeatureCard
            emoji="🎯"
            title="约会全案策划"
            desc="区分男女偏好，告别吃饭看电影老三样"
            status="规划中"
          />
          <FeatureCard
            emoji="👤"
            title="AI 形象军师"
            desc="上传照片，AI 重绘穿搭发型 + 打分"
            status="规划中"
          />
        </div>
      </section>

      <footer className="mt-20 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-xs text-gray-500 dark:text-gray-500">
        <p>本工具仅提供恋爱沟通建议，不存储任何聊天原文。</p>
        <p className="mt-2">
          <Link href="/about" className="hover:underline">
            关于 &amp; 隐私
          </Link>
        </p>
      </footer>
    </main>
  );
}

function FeatureCard({
  emoji,
  title,
  desc,
  status,
}: {
  emoji: string;
  title: string;
  desc: string;
  status: "可用" | "近期" | "规划中";
}) {
  const isActive = status === "可用";
  const statusColor =
    status === "可用"
      ? "bg-rose-600 text-white"
      : status === "近期"
        ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
        : "bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400";

  return (
    <div
      className={`rounded-xl border p-4 transition ${
        isActive
          ? "border-rose-300 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/20"
          : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/40"
      }`}
    >
      <div className="text-2xl mb-2">{emoji}</div>
      <div className="font-semibold text-sm">{title}</div>
      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
        {desc}
      </div>
      <div
        className={`mt-3 inline-block text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColor}`}
      >
        {status}
      </div>
    </div>
  );
}
