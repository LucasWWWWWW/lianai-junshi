"use client";

import { useEffect, useRef, useState } from "react";
import type { CoachResult, Reply } from "@/lib/types";
import type { FaultLevel, SosInput, SosScenario } from "@/lib/sos-prompts";

const SCENARIO_OPTIONS: { value: SosScenario; label: string; emoji: string }[] =
  [
    { value: "cold-war", label: "冷战中", emoji: "🧊" },
    { value: "big-fight", label: "刚大吵", emoji: "💥" },
    { value: "small-bicker", label: "日常拌嘴", emoji: "🥊" },
    { value: "jealousy", label: "吃醋 / 信任", emoji: "🍋" },
    { value: "family-conflict", label: "家庭 / 婆媳", emoji: "🏠" },
    { value: "broken-promise", label: "失约 / 食言", emoji: "📅" },
  ];

const FAULT_OPTIONS: { value: FaultLevel; label: string; hint: string }[] = [
  { value: "mine", label: "我有错", hint: "我先做的让 TA 不舒服" },
  { value: "theirs", label: "TA 有错", hint: "我想主动破冰避免扩大" },
  { value: "both", label: "双方都有", hint: "互相都有责任" },
];

interface SosResponse {
  result?: CoachResult;
  error?: string;
  remaining?: number;
}

export function SosForm() {
  const [perspective, setPerspective] =
    useState<SosInput["perspective"]>("male-to-female");
  const [scenario, setScenario] = useState<SosScenario>("cold-war");
  const [faultLevel, setFaultLevel] = useState<FaultLevel>("mine");
  const [context, setContext] = useState("");
  const [partnerMessage, setPartnerMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CoachResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);

  function showToast(text: string, ms = 1800) {
    setToast(text);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), ms);
  }

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!context.trim() || loading) return;

    const input: SosInput = {
      perspective,
      scenario,
      faultLevel,
      context,
      partnerMessage: partnerMessage.trim() || undefined,
    };

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/sos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = (await res.json()) as SosResponse;
      if (!res.ok || data.error || !data.result) {
        setError(data.error || `请求失败 (${res.status})`);
      } else {
        setResult(data.result);
        setTimeout(() => {
          resultRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 80);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "网络错误");
    } finally {
      setLoading(false);
    }
  }

  async function copyToClipboard(text: string, msg: string) {
    try {
      await navigator.clipboard.writeText(text);
      showToast(msg);
    } catch {
      showToast("复制失败，请手动选中文本", 2400);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="我的视角" htmlFor="sos-perspective">
          <select
            id="sos-perspective"
            value={perspective}
            onChange={(e) =>
              setPerspective(e.target.value as SosInput["perspective"])
            }
            className="form-select"
          >
            <option value="male-to-female">男生 → 想哄好女生</option>
            <option value="female-to-male">女生 → 想缓和与男生</option>
          </select>
        </Field>

        <Field label="矛盾场景">
          <div
            role="radiogroup"
            aria-label="矛盾场景"
            className="grid grid-cols-2 sm:grid-cols-3 gap-2"
          >
            {SCENARIO_OPTIONS.map((s) => (
              <button
                key={s.value}
                type="button"
                role="radio"
                aria-checked={scenario === s.value}
                onClick={() => setScenario(s.value)}
                className={`text-xs px-3 py-2.5 rounded-lg border transition text-left ${
                  scenario === s.value
                    ? "border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-medium"
                    : "border-gray-200 dark:border-gray-700 hover:border-rose-300 dark:hover:border-rose-700 text-gray-600 dark:text-gray-400"
                }`}
              >
                <span className="mr-1.5">{s.emoji}</span>
                {s.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="责任归属">
          <div
            role="radiogroup"
            aria-label="责任归属"
            className="grid grid-cols-3 gap-2"
          >
            {FAULT_OPTIONS.map((f) => (
              <button
                key={f.value}
                type="button"
                role="radio"
                aria-checked={faultLevel === f.value}
                onClick={() => setFaultLevel(f.value)}
                className={`text-xs px-3 py-2.5 rounded-lg border transition text-left ${
                  faultLevel === f.value
                    ? "border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300"
                    : "border-gray-200 dark:border-gray-700 hover:border-rose-300 dark:hover:border-rose-700 text-gray-600 dark:text-gray-400"
                }`}
              >
                <div className="font-medium">{f.label}</div>
                <div className="text-[10px] text-gray-400 mt-0.5">
                  {f.hint}
                </div>
              </button>
            ))}
          </div>
        </Field>

        <Field label="当前状况" required htmlFor="sos-context">
          <textarea
            id="sos-context"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="简单说一下发生了什么、冷战多久、之前有没有类似矛盾…"
            rows={4}
            maxLength={1500}
            required
            className="form-input resize-y leading-relaxed"
          />
          <div className="mt-1 text-xs text-gray-400 text-right">
            {context.length}/1500
          </div>
        </Field>

        <Field
          label="TA 最近发的话"
          hint="可选 · 有原话 AI 解读更准"
          htmlFor="sos-partner-msg"
        >
          <textarea
            id="sos-partner-msg"
            value={partnerMessage}
            onChange={(e) => setPartnerMessage(e.target.value)}
            placeholder="例如：你忙你的吧。 / 算了我懒得说了。"
            rows={2}
            maxLength={800}
            className="form-input resize-y leading-relaxed"
          />
        </Field>

        <button
          type="submit"
          disabled={loading || !context.trim()}
          className="w-full rounded-lg bg-rose-600 hover:bg-rose-700 active:bg-rose-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 font-medium transition shadow-lg shadow-rose-600/20"
        >
          {loading ? "急救中…" : "立即急救"}
        </button>
      </form>

      {error && (
        <div
          role="alert"
          className="rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 p-4 text-sm text-red-700 dark:text-red-300"
        >
          {error}
        </div>
      )}

      <div ref={resultRef}>
        {result && <SosResultView result={result} onCopy={copyToClipboard} />}
      </div>

      <Toast text={toast} />
    </div>
  );
}

function Field({
  label,
  children,
  hint,
  required,
  htmlFor,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
  required?: boolean;
  htmlFor?: string;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
      >
        {label}
        {required && (
          <span className="text-rose-500 ml-1" aria-hidden>
            *
          </span>
        )}
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

function SosResultView({
  result,
  onCopy,
}: {
  result: CoachResult;
  onCopy: (text: string, msg: string) => void;
}) {
  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <section className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/60 dark:bg-rose-950/20 p-5">
        <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
          <span
            className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-600 text-white text-xs"
            aria-hidden
          >
            1
          </span>
          矛盾诊断
        </h2>
        <div className="space-y-2 text-sm">
          <p>
            <span className="text-gray-500 dark:text-gray-400">激烈度：</span>
            <span className="font-semibold text-rose-700 dark:text-rose-400">
              {result.emotion}
            </span>{" "}
            — {result.emotionDetail}
          </p>
          <p>
            <span className="text-gray-500 dark:text-gray-400">TA 心结：</span>
            {result.subtext}
          </p>
          <p>
            <span className="text-gray-500 dark:text-gray-400">和解信号：</span>
            {result.realNeed}
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
          <span
            className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-600 text-white text-xs"
            aria-hidden
          >
            2
          </span>
          三套梯度道歉
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          从轻到重，根据矛盾深度选一套（按提示「什么时候用」判断）
        </p>
        <div className="space-y-3">
          {result.replies.map((r, i) => (
            <ApologyCard key={i} reply={r} severity={i} onCopy={onCopy} />
          ))}
        </div>
      </section>

      {result.redLines && result.redLines.length > 0 && (
        <section className="rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/60 dark:bg-amber-950/20 p-5">
          <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
            <span
              className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-600 text-white text-xs"
              aria-hidden
            >
              3
            </span>
            冷战禁忌 · 千万别发
          </h2>
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

function ApologyCard({
  reply,
  severity,
  onCopy,
}: {
  reply: Reply;
  severity: number;
  onCopy: (text: string, msg: string) => void;
}) {
  const severityColor =
    severity === 0
      ? "border-l-emerald-400 dark:border-l-emerald-600"
      : severity === 1
        ? "border-l-amber-400 dark:border-l-amber-600"
        : "border-l-rose-500 dark:border-l-rose-600";

  return (
    <article
      className={`rounded-xl border border-gray-200 dark:border-gray-800 border-l-4 ${severityColor} bg-white dark:bg-gray-900 p-4`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded">
          {reply.style}
        </span>
        <button
          type="button"
          onClick={() => onCopy(reply.text, `已复制 · ${reply.style}`)}
          className="text-xs px-2.5 py-1 rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          复制
        </button>
      </div>
      <p className="text-sm whitespace-pre-wrap mb-2 leading-relaxed">
        {reply.text}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400 border-l-2 border-rose-300 dark:border-rose-700 pl-2 italic">
        {reply.why}
      </p>
    </article>
  );
}

function Toast({ text }: { text: string | null }) {
  return (
    <div
      aria-live="polite"
      role="status"
      className={`fixed left-1/2 -translate-x-1/2 bottom-6 z-50 transition-all duration-200 ${
        text
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-2 pointer-events-none"
      }`}
    >
      {text && (
        <div className="bg-gray-900 text-white text-sm px-4 py-2 rounded-full shadow-lg">
          {text}
        </div>
      )}
    </div>
  );
}
