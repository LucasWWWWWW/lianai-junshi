"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { COACH_EXAMPLES } from "@/lib/examples";
import {
  type FavoriteEntry,
  loadFavorites,
  toggleFavorite,
} from "@/lib/favorites";
import { appendHistory } from "@/lib/history";
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

const SITE_URL = "https://lianai-junshi.netlify.app";

export function CoachForm() {
  const [perspective, setPerspective] =
    useState<CoachInput["perspective"]>("male-to-female");
  const [stage, setStage] =
    useState<NonNullable<CoachInput["stage"]>>("flirting");
  const [message, setMessage] = useState("");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CoachResult | null>(null);
  const [lastInput, setLastInput] = useState<CoachInput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [favoriteSet, setFavoriteSet] = useState<Set<string>>(new Set());

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

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

  const refreshFavoriteSet = useCallback(() => {
    setFavoriteSet(new Set(loadFavorites().map((e) => e.reply.text)));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshFavoriteSet();
    function onChange() {
      refreshFavoriteSet();
    }
    window.addEventListener("favorites:changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("favorites:changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [refreshFavoriteSet]);

  function loadExample(idx: number) {
    const ex = COACH_EXAMPLES[idx];
    if (!ex) return;
    setPerspective(ex.input.perspective);
    setStage(
      ex.input.stage ?? ("flirting" as NonNullable<CoachInput["stage"]>),
    );
    setContext(ex.input.context ?? "");
    setMessage(ex.input.message);
    setResult(null);
    setError(null);
    textareaRef.current?.focus();
  }

  async function runCoach(input: CoachInput, isRegenerate = false) {
    setLoading(true);
    setError(null);
    if (!isRegenerate) setResult(null);

    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = (await res.json()) as CoachResponse;
      if (!res.ok || data.error || !data.result) {
        setError(data.error || `请求失败 (${res.status})`);
      } else {
        setResult(data.result);
        setLastInput(input);
        appendHistory(input, data.result);
        if (isRegenerate) {
          showToast("已重新生成一套");
        } else {
          setTimeout(() => {
            resultRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }, 80);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "网络错误");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!message.trim() || loading) return;
    const input: CoachInput = {
      perspective,
      stage,
      message,
      context: context.trim() || undefined,
    };
    await runCoach(input, false);
  }

  async function handleRegenerate() {
    if (!lastInput || loading) return;
    await runCoach(lastInput, true);
  }

  // H4: keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === "Escape") {
        const active = document.activeElement;
        if (
          active === textareaRef.current ||
          (active instanceof HTMLInputElement && active.type === "text")
        ) {
          (active as HTMLElement).blur();
        }
      } else if (e.key === "/" && document.activeElement === document.body) {
        e.preventDefault();
        textareaRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message, loading, perspective, stage, context]);

  async function copyToClipboard(text: string, successMsg: string) {
    try {
      await navigator.clipboard.writeText(text);
      showToast(successMsg);
    } catch {
      showToast("复制失败，请手动选中文本", 2400);
    }
  }

  function handleToggleFavorite(reply: Reply) {
    if (!result || !lastInput) return;
    const nowFav = toggleFavorite(reply, lastInput.message, result.emotion);
    refreshFavoriteSet();
    showToast(nowFav ? "已加入金句库 ★" : "已从金句库移除");
  }

  function buildShareSnippet(): string {
    if (!result) return "";
    const top = result.replies[0];
    return [
      "🌹 恋爱军师为你解读",
      "",
      `【情绪】${result.emotion} — ${result.emotionDetail}`,
      `【潜台词】${result.subtext}`,
      `【真实需求】${result.realNeed}`,
      "",
      `【推荐回复 · ${top.style}】`,
      top.text,
      "",
      `👉 完整 3 套话术 + 雷区，免费试用：${SITE_URL}`,
    ].join("\n");
  }

  return (
    <div className="space-y-6">
      <ExampleChips onPick={loadExample} />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="我的视角" htmlFor="perspective">
            <select
              id="perspective"
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
          <Field label="关系阶段" htmlFor="stage">
            <select
              id="stage"
              value={stage}
              onChange={(e) =>
                setStage(
                  e.target.value as NonNullable<CoachInput["stage"]>,
                )
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

        <Field label="背景" hint="可选 · 帮助 AI 更准确" htmlFor="context">
          <input
            id="context"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="例如：刚约会回来；纪念日；TA 最近工作压力大..."
            maxLength={200}
            className="form-input"
          />
        </Field>

        <Field label="对方发的话" required htmlFor="message">
          <textarea
            id="message"
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="把对方刚发来的话原文贴在这里…  快捷键：Ctrl+Enter 提交"
            rows={5}
            maxLength={2000}
            required
            className="form-input resize-y leading-relaxed"
            aria-describedby="message-hint"
          />
          <div
            id="message-hint"
            className="mt-1 text-xs text-gray-400 flex justify-between"
          >
            <span className="hidden sm:inline">
              快捷键：Ctrl/Cmd+Enter 提交 · Esc 失焦 · &quot;/&quot; 聚焦输入框
            </span>
            <span className="ml-auto">{message.length}/2000</span>
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
        <div
          role="alert"
          className="rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 p-4 text-sm text-red-700 dark:text-red-300"
        >
          {error}
        </div>
      )}

      <div ref={resultRef}>
        {result && lastInput && (
          <CoachResultView
            result={result}
            lastInput={lastInput}
            favoriteSet={favoriteSet}
            onCopy={copyToClipboard}
            onShare={() =>
              copyToClipboard(
                buildShareSnippet(),
                "分享卡片已复制 · 粘贴到任意地方",
              )
            }
            onRegenerate={handleRegenerate}
            onToggleFavorite={handleToggleFavorite}
            regenerating={loading}
          />
        )}
      </div>

      <div className="text-center text-xs text-gray-400 dark:text-gray-500 space-y-1">
        <p>
          <Link href="/history" className="hover:underline mx-2">
            📜 历史记录
          </Link>
          <Link href="/favorites" className="hover:underline mx-2">
            ★ 我的金句库
          </Link>
        </p>
      </div>

      <Toast text={toast} />
    </div>
  );
}

function ExampleChips({ onPick }: { onPick: (idx: number) => void }) {
  return (
    <div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
        ✨ 没头绪？试试这些真实场景：
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="示例场景">
        {COACH_EXAMPLES.map((ex, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onPick(i)}
            className="text-xs px-3 py-1.5 rounded-full border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-950/60 focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
          >
            {chipLabel(ex.input)}
          </button>
        ))}
      </div>
    </div>
  );
}

function chipLabel(input: CoachInput): string {
  const viewer =
    input.perspective === "male-to-female" ? "她说" : "他说";
  const preview = input.message.length > 12
    ? `${input.message.slice(0, 12)}…`
    : input.message;
  return `${viewer}「${preview}」`;
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

function HighlightedMessage({
  text,
  keywords,
}: {
  text: string;
  keywords?: string[];
}) {
  if (!keywords || keywords.length === 0) {
    return (
      <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-700 dark:text-gray-300">
        {text}
      </p>
    );
  }

  const present = keywords.filter((k) => k && text.includes(k));
  if (present.length === 0) {
    return (
      <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-700 dark:text-gray-300">
        {text}
      </p>
    );
  }

  const escaped = present.map((k) =>
    k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  );
  const re = new RegExp(`(${escaped.join("|")})`, "g");
  const parts = text.split(re);

  return (
    <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-700 dark:text-gray-300">
      {parts.map((part, i) =>
        present.includes(part) ? (
          <mark
            key={i}
            className="bg-rose-200/70 dark:bg-rose-700/40 text-rose-900 dark:text-rose-200 rounded px-0.5 mx-px"
            title="AI 识别的情绪关键词"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </p>
  );
}

function CoachResultView({
  result,
  lastInput,
  favoriteSet,
  onCopy,
  onShare,
  onRegenerate,
  onToggleFavorite,
  regenerating,
}: {
  result: CoachResult;
  lastInput: CoachInput;
  favoriteSet: Set<string>;
  onCopy: (text: string, msg: string) => void;
  onShare: () => void;
  onRegenerate: () => void;
  onToggleFavorite: (reply: Reply) => void;
  regenerating: boolean;
}) {
  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/40 p-5">
        <h2 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
          对方的原话（已标出关键词）
        </h2>
        <HighlightedMessage
          text={lastInput.message}
          keywords={result.emotionKeywords}
        />
      </section>

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
        <div className="flex items-center justify-between mb-3">
          <SectionHeader num={2} label="三套话术" color="rose" inline />
          <button
            type="button"
            onClick={onRegenerate}
            disabled={regenerating}
            className="text-xs px-3 py-1 rounded-full border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition"
            title="重新生成一套话术（同样的输入）"
          >
            ↻ 再来一套
          </button>
        </div>
        <div className="space-y-3">
          {result.replies.map((r, i) => (
            <ReplyCard
              key={i}
              reply={r}
              isFavorite={favoriteSet.has(r.text)}
              onCopy={onCopy}
              onToggleFavorite={onToggleFavorite}
            />
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

      <div className="flex justify-center pt-1">
        <button
          type="button"
          onClick={onShare}
          className="text-sm px-5 py-2 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition"
        >
          📤 生成分享卡片
        </button>
      </div>
    </div>
  );
}

function SectionHeader({
  num,
  label,
  color,
  inline,
}: {
  num: number;
  label: string;
  color: "rose" | "amber";
  inline?: boolean;
}) {
  const bg = color === "rose" ? "bg-rose-600" : "bg-amber-600";
  return (
    <h2
      className={`text-base font-semibold flex items-center gap-2 ${inline ? "" : "mb-3"}`}
    >
      <span
        className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${bg} text-white text-xs`}
        aria-hidden
      >
        {num}
      </span>
      {label}
    </h2>
  );
}

function ReplyCard({
  reply,
  isFavorite,
  onCopy,
  onToggleFavorite,
}: {
  reply: Reply;
  isFavorite: boolean;
  onCopy: (text: string, msg: string) => void;
  onToggleFavorite: (reply: Reply) => void;
}) {
  return (
    <article className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
      <div className="flex items-center justify-between mb-2 gap-2">
        <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded">
          {reply.style}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onToggleFavorite(reply)}
            aria-label={isFavorite ? "从金句库移除" : "加入金句库"}
            aria-pressed={isFavorite}
            className={`text-xs w-7 h-7 rounded inline-flex items-center justify-center transition ${
              isFavorite
                ? "text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-950/30"
                : "text-gray-400 hover:text-yellow-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
            title={isFavorite ? "已收藏（点击移除）" : "加入金句库"}
          >
            {isFavorite ? "★" : "☆"}
          </button>
          <button
            type="button"
            onClick={() => onCopy(reply.text, `已复制 · ${reply.style}`)}
            className="text-xs px-2.5 py-1 rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            复制
          </button>
        </div>
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

// Re-export for ts unused import noise
export type { FavoriteEntry };
