import Link from "next/link";

export const metadata = {
  title: "关于 & 隐私 — 恋爱军师",
  description: "恋爱军师的产品理念、隐私承诺与免责声明",
};

export default function AboutPage() {
  return (
    <main id="main" className="mx-auto max-w-2xl px-4 py-8 sm:py-12 flex-1 w-full">
      <Link
        href="/"
        className="text-sm text-rose-600 hover:text-rose-700 dark:text-rose-400"
      >
        ← 回首页
      </Link>
      <h1 className="text-2xl sm:text-3xl font-bold mt-3 mb-8">
        关于 &amp; 隐私
      </h1>

      <article className="prose-sm space-y-8 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold mb-2">产品理念</h2>
          <p className="text-gray-700 dark:text-gray-300">
            大多数情侣矛盾的根源不是不爱，而是男女思维差异下的「善意错位」：
            男生用「直白逻辑」表达，女生用「情绪暗示」表达；一方期待解决方案，
            另一方期待被共情。恋爱军师不打鸡汤，专注用 AI
            做客观解读和可直接复制的话术，帮你跳出主观感受、看见对方真实想法。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">隐私承诺</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
            <li>
              <strong>不存储聊天原文。</strong>{" "}
              你输入的对方消息仅用于当次 AI 调用，调用结束后不在服务端持久化。
            </li>
            <li>
              <strong>不要求登录。</strong>{" "}
              MVP 阶段无需注册，最大限度减少数据收集。
            </li>
            <li>
              <strong>仅记录匿名调用次数。</strong>{" "}
              我们用 IP 哈希做免费额度限频，不关联任何个人身份。
            </li>
            <li>
              <strong>第三方 AI：</strong>{" "}
              当前使用 DeepSeek API（境内合规）处理对话内容，请避免输入身份证、
              密码、银行卡等敏感信息。
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">免责声明</h2>
          <p className="text-gray-700 dark:text-gray-300">
            本工具输出由 AI 生成，仅作恋爱沟通参考。AI
            无法替代真实情感判断与责任承担。重要决策（分手、复合、婚姻、消费）
            请结合自身处境独立判断，本应用不对依据 AI 建议产生的后果负责。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">反馈</h2>
          <p className="text-gray-700 dark:text-gray-300">
            发现问题或想要的功能？欢迎在 GitHub 提 issue：
            <a
              href="https://github.com/LucasWWWWWW/lianai-junshi/issues"
              className="text-rose-600 hover:underline ml-1"
              target="_blank"
              rel="noopener noreferrer"
            >
              lianai-junshi/issues
            </a>
          </p>
        </section>
      </article>
    </main>
  );
}
