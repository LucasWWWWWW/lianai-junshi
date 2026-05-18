"use client";

import { useState } from "react";
import type {
  CoachInput,
  CoachResponse,
  CoachResult,
  Reply,
} from "@/lib/types";

const STAGE_OPTIONS: { value: NonNullable<CoachInput["stage"]>; label: string }[] = [
  { value: "flirting", label: "暧昧期" },
  { value: "dating", label: "热恋期" },
  { value: "committed", label: "稳定期" },
  { value: "rough-patch", label: "磨合/吵架" },
];

export function CoachForm() {
  const [perspective, setPerspective] = useState<CoachInput["perspective"]>(
    "male-to-female",
  );
  const [stage, setStage] =
    useState<NonNullable<CoachInput["stage"]>>("flirting");
  const [message, setMessage] = useState("");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CoachResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          perspective,
          stage,
          message,
          context: context.trim() || undefined,
        } satisfies CoachInput),
      });
      const data = (await res.json()) as CoachResponse;
      if (!res.ok || data.error || !data.result) {
        setError(data.error || `请求失败 (${res.status})`);
      } else {
        setResult(data.result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "网络错误");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="我的视角">
            <select
              value={perspective}
              onChange={(e) =>
                setPerspective(e.target.value as CoachInput["perspective"])
              }
              className="form-select"
            >
              <option value="male-to-female">男生 → 女生</option>
              <option value="female-to-male">女生 → 男生</option>
            </select>
          </Field>
          <Field label="关系阶段">
            <select
              value={stage}
              onChange={(e) =>
                setStage(e.target.value as NonNullable<CoachInput["stage"]>)
              }
              className="form-select"
            >
              {STAGE_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="背景" hint="可选 · 帮助 AI 更准确">
          <input
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="例如：刚约会回来；纪念日；TA 最近工作压力大..."
            maxLength={200}
            className="form-input"
          />
        </Field>

        <Field label="对方发的话" required>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="把对方刚发来的话原文贴在这里..."
            rows={5}
            maxLength={2000}
            required
            className="form-input resize-y leading-relaxed"
          />
          <div className="mt-1 text-xs text-gray-400 text-right">
            {message.length}/2000
          </div>
        </Field>

        <button
          type="submit"
          disabled={loading || !message.trim()}
          className="w-full rounded-lg bg-rose-600 hover:bg-rose-700 active:bg-rose-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 font-medium transition shadow-lg shadow-rose-600/20"
        >
          {loading ? "军师思考中…" : "请军师给我话术"}
        </button>
      </form>

      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 p-4 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {result && <CoachResultView result={result} />}
    </div>
  );
}

function Field({
  label,
  children,
  hint,
  required,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        {label}
        {required && <span className="text-rose-500 ml-1">*</span>}
        {hint && (
          <span className="text-gray-400 dark:text-gray-500 font-normal ml-2 text-xs">
            {hint}
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

function CoachResultView({ result }: { result: CoachResult }) {
  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <section className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/60 dark:bg-rose-950/20 p-5">
        <SectionHeader num={1} label="对方在想什么" color="rose" />
        <div className="space-y-2 text-sm">
          <p>
            <span className="text-gray-500 dark:text-gray-400">情绪：</span>
            <span className="font-semibold text-rose-700 dark:text-rose-400">
              {result.emotion}
            </span>{" "}
            — {result.emotionDetail}
          </p>
          <p>
            <span className="text-gray-500 dark:text-gray-400">潜台词：</span>
            {result.subtext}
          </p>
          <p>
            <span className="text-gray-500 dark:text-gray-400">真实需求：</span>
            {result.realNeed}
          </p>
        </div>
      </section>

      <section>
        <SectionHeader num={2} label="三套话术（点击复制）" color="rose" />
        <div className="space-y-3">
          {result.replies.map((r, i) => (
            <ReplyCard key={i} reply={r} />
          ))}
        </div>
      </section>

      {result.redLines && result.redLines.length > 0 && (
        <section className="rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/60 dark:bg-amber-950/20 p-5">
          <SectionHeader num={3} label="雷区！绝对不要这样回" color="amber" />
          <ul className="space-y-3 text-sm">
            {result.redLines.map((rl, i) => (
              <li key={i}>
                <div className="font-medium text-amber-800 dark:text-amber-300">
                  ⚠ &ldquo;{rl.phrase}&rdquo;
                </div>
                <div className="text-gray-600 dark:text-gray-400 mt-0.5 text-xs leading-relaxed">
                  {rl.reason}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function SectionHeader({
  num,
  label,
  color,
}: {
  num: number;
  label: string;
  color: "rose" | "amber";
}) {
  const bg = color === "rose" ? "bg-rose-600" : "bg-amber-600";
  return (
    <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
      <span
        className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${bg} text-white text-xs`}
      >
        {num}
      </span>
      {label}
    </h2>
  );
}

function ReplyCard({ reply }: { reply: Reply }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(reply.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // fallback noop
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded">
          {reply.style}
        </span>
        <button
          onClick={copy}
          className="text-xs px-2.5 py-1 rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          {copied ? "已复制 ✓" : "复制"}
        </button>
      </div>
      <p className="text-sm whitespace-pre-wrap mb-2 leading-relaxed">
        {reply.text}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400 border-l-2 border-rose-300 dark:border-rose-700 pl-2 italic">
        {reply.why}
      </p>
    </div>
  );
}
