"use client";

import { useEffect, useState } from "react";
import {
  type FavoriteEntry,
  clearFavorites,
  loadFavorites,
  removeFavorite,
} from "@/lib/favorites";
import { formatRelativeTime } from "@/lib/history";

export function FavoritesView() {
  const [entries, setEntries] = useState<FavoriteEntry[] | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEntries(loadFavorites());
    function onChange() {
      setEntries(loadFavorites());
    }
    window.addEventListener("favorites:changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("favorites:changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  function flashToast(text: string) {
    setToast(text);
    setTimeout(() => setToast(null), 1500);
  }

  if (entries === null) {
    return (
      <div className="text-center text-sm text-gray-400 py-12">加载中…</div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed rounded-xl border-gray-300 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          还没收藏任何话术
        </p>
        <p className="text-xs text-gray-400 mt-2">
          去
          <a href="/coach" className="text-rose-600 hover:underline mx-1">
            问军师一句
          </a>
          ，喜欢的话术点 ☆ 加入这里
        </p>
      </div>
    );
  }

  function handleRemove(id: string) {
    setEntries(removeFavorite(id));
  }

  function handleClearAll() {
    if (!confirm(`清空全部 ${entries?.length ?? 0} 条收藏？此操作不可撤销。`))
      return;
    clearFavorites();
    setEntries([]);
  }

  async function handleCopy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      flashToast("已复制 ✓");
    } catch {
      flashToast("复制失败");
    }
  }

  return (
    <div className="space-y-3 relative">
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>共 {entries.length} 条 · 最多保留 100 条</span>
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
          className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4"
        >
          <div className="flex items-center justify-between mb-2 gap-2">
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded">
              {e.reply.style}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleCopy(e.reply.text)}
                className="text-xs px-2.5 py-1 rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                复制
              </button>
              <button
                onClick={() => handleRemove(e.id)}
                aria-label="移除收藏"
                className="text-xs px-2 py-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                移除
              </button>
            </div>
          </div>
          <p className="text-sm whitespace-pre-wrap leading-relaxed mb-2">
            {e.reply.text}
          </p>
          {e.reply.why && (
            <p className="text-xs text-gray-500 dark:text-gray-400 border-l-2 border-rose-300 dark:border-rose-700 pl-2 italic mb-2">
              {e.reply.why}
            </p>
          )}
          <div className="text-xs text-gray-400 flex flex-wrap gap-x-3 gap-y-0.5">
            {e.emotion && <span>情绪：{e.emotion}</span>}
            <span>对方原话：{e.forMessage || "—"}</span>
            <span>{formatRelativeTime(e.createdAt)}</span>
          </div>
        </article>
      ))}

      <div
        aria-live="polite"
        role="status"
        className={`fixed left-1/2 -translate-x-1/2 bottom-6 z-50 transition-all duration-200 ${
          toast
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-2 pointer-events-none"
        }`}
      >
        {toast && (
          <div className="bg-gray-900 text-white text-sm px-4 py-2 rounded-full shadow-lg">
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}
