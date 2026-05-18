"use client";

import { useEffect, useState } from "react";
import {
  type HistoryEntry,
  clearHistory,
  formatRelativeTime,
  loadHistory,
  removeHistory,
} from "@/lib/history";

const STAGE_LABEL: Record<string, string> = {
  flirting: "暧昧期",
  dating: "热恋期",
  committed: "稳定期",
  "rough-patch": "磨合/吵架",
};

export function HistoryView() {
  const [entries, setEntries] = useState<HistoryEntry[] | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEntries(loadHistory());
  }, []);

  if (entries === null) {
    return (
      <div className="text-center text-sm text-gray-400 py-12">加载中…</div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed rounded-xl border-gray-300 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          还没有任何记录
        </p>
        <p className="text-xs text-gray-400 mt-2">
          先去
          <a href="/coach" className="text-rose-600 hover:underline mx-1">
            问军师一句
          </a>
          看看
        </p>
      </div>
    );
  }

  function handleRemove(id: string) {
    if (!confirm("删除这条记录？")) return;
    setEntries(removeHistory(id));
    if (openId === id) setOpenId(null);
  }

  function handleClearAll() {
    if (!confirm(`清空全部 ${entries?.length ?? 0} 条记录？此操作不可撤销。`))
      return;
    clearHistory();
    setEntries([]);
    setOpenId(null);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>共 {entries.length} 条 · 最多保留 30 条</span>
        <button
          onClick={handleClearAll}
          className="text-red-500 hover:text-red-600 hover:underline"
        >
          全部清空
        </button>
      </div>

      {entries.map((e) => (
        <article
          key={e.id}
          className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden"
        >
          <button
            onClick={() => setOpenId(openId === e.id ? null : e.id)}
            className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-rose-600 dark:text-rose-400 font-semibold">
                  {e.input.perspective === "male-to-female"
                    ? "男 → 女"
                    : "女 → 男"}
                </span>
                {e.input.stage && (
                  <span className="text-gray-500 dark:text-gray-400">
                    · {STAGE_LABEL[e.input.stage] ?? e.input.stage}
                  </span>
                )}
                <span className="text-gray-400 dark:text-gray-500">
                  · {formatRelativeTime(e.createdAt)}
                </span>
              </div>
              <span className="text-xs text-gray-400">
                {openId === e.id ? "▲" : "▼"}
              </span>
            </div>
            <p className="text-sm leading-relaxed line-clamp-2 text-gray-700 dark:text-gray-300">
              <span className="text-gray-400">原话：</span>
              {e.input.message}
            </p>
            <p className="text-xs mt-1.5">
              <span className="text-gray-400">情绪：</span>
              <span className="text-rose-600 dark:text-rose-400 font-medium">
                {e.result.emotion}
              </span>
              <span className="text-gray-500 dark:text-gray-400 ml-1">
                — {e.result.emotionDetail}
              </span>
            </p>
          </button>

          {openId === e.id && (
            <div className="border-t border-gray-100 dark:border-gray-800 p-4 space-y-3 bg-gray-50/50 dark:bg-gray-900/30">
              {e.input.context && (
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  <span className="text-gray-400">背景：</span>
                  {e.input.context}
                </p>
              )}
              <div className="space-y-1 text-xs">
                <p>
                  <span className="text-gray-400">潜台词：</span>
                  {e.result.subtext}
                </p>
                <p>
                  <span className="text-gray-400">真实需求：</span>
                  {e.result.realNeed}
                </p>
              </div>
              <div className="space-y-2">
                {e.result.replies.map((r, i) => (
                  <div
                    key={i}
                    className="text-xs bg-white dark:bg-gray-950 rounded-lg p-2.5 border border-gray-200 dark:border-gray-800"
                  >
                    <div className="text-rose-600 dark:text-rose-400 font-semibold mb-1">
                      {r.style}
                    </div>
                    <p className="leading-relaxed text-gray-700 dark:text-gray-300">
                      {r.text}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={(ev) => {
                    ev.stopPropagation();
                    handleRemove(e.id);
                  }}
                  className="text-xs text-red-500 hover:text-red-600 hover:underline"
                >
                  删除
                </button>
              </div>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
