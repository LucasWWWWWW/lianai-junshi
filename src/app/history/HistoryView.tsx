"use client";

import { useEffect, useState } from "react";
import {
  type HistoryEntry,
  clearHistory,
  formatRelativeTime,
  loadHistory,
  moveHistoryEntry,
  removeHistory,
  updateHistoryEntry,
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
  const [tagDraft, setTagDraft] = useState<Record<string, string>>({});
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

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

  function handleMove(id: string, dir: "up" | "down") {
    setEntries(moveHistoryEntry(id, dir));
  }

  function startEditTag(e: HistoryEntry) {
    setEditingTagId(e.id);
    setTagDraft((d) => ({ ...d, [e.id]: e.tag ?? "" }));
  }

  function saveTag(id: string) {
    const value = (tagDraft[id] ?? "").trim();
    setEntries(updateHistoryEntry(id, { tag: value || undefined }));
    setEditingTagId(null);
  }

  const filtered = filter.trim()
    ? entries.filter((e) => {
        const q = filter.trim().toLowerCase();
        return (
          (e.tag ?? "").toLowerCase().includes(q) ||
          e.input.message.toLowerCase().includes(q) ||
          e.result.emotion.toLowerCase().includes(q)
        );
      })
    : entries;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 justify-between text-xs">
        <input
          type="search"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="按标签 / 关键词 / 情绪筛选…"
          className="flex-1 min-w-[180px] form-input text-xs py-1.5"
          aria-label="筛选历史记录"
        />
        <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
          <span>
            {filtered.length}/{entries.length} 条
          </span>
          <button
            onClick={handleClearAll}
            className="text-red-500 hover:text-red-600 hover:underline"
          >
            全部清空
          </button>
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8 text-sm text-gray-400">
          没有匹配的记录
        </div>
      )}

      {filtered.map((e) => {
        const idxInAll = entries.findIndex((x) => x.id === e.id);
        const canUp = idxInAll > 0;
        const canDown = idxInAll < entries.length - 1;
        return (
          <article
            key={e.id}
            className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden"
          >
            <div className="flex">
              <button
                onClick={() => setOpenId(openId === e.id ? null : e.id)}
                className="flex-1 text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-800/50 transition"
                aria-expanded={openId === e.id}
              >
                <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                  <div className="flex items-center gap-2 text-xs flex-wrap">
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
                    {e.tag && (
                      <span className="bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 px-1.5 py-0.5 rounded text-[10px] font-medium">
                        #{e.tag}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400" aria-hidden>
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

              <div className="flex flex-col border-l border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => handleMove(e.id, "up")}
                  disabled={!canUp}
                  aria-label="上移"
                  className="px-2 py-1 text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  ▲
                </button>
                <button
                  onClick={() => handleMove(e.id, "down")}
                  disabled={!canDown}
                  aria-label="下移"
                  className="px-2 py-1 text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  ▼
                </button>
              </div>
            </div>

            {openId === e.id && (
              <div className="border-t border-gray-100 dark:border-gray-800 p-4 space-y-3 bg-gray-50/50 dark:bg-gray-900/30">
                <TagEditor
                  entry={e}
                  isEditing={editingTagId === e.id}
                  draft={tagDraft[e.id] ?? e.tag ?? ""}
                  onChangeDraft={(v) =>
                    setTagDraft((d) => ({ ...d, [e.id]: v }))
                  }
                  onStartEdit={() => startEditTag(e)}
                  onSave={() => saveTag(e.id)}
                  onCancel={() => setEditingTagId(null)}
                />

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
        );
      })}
    </div>
  );
}

function TagEditor({
  entry,
  isEditing,
  draft,
  onChangeDraft,
  onStartEdit,
  onSave,
  onCancel,
}: {
  entry: HistoryEntry;
  isEditing: boolean;
  draft: string;
  onChangeDraft: (v: string) => void;
  onStartEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input
          autoFocus
          value={draft}
          onChange={(e) => onChangeDraft(e.target.value)}
          maxLength={20}
          placeholder="加个标签（如 周年纪念 / 婆媳事）"
          className="form-input text-xs py-1 flex-1"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onSave();
            } else if (e.key === "Escape") {
              e.preventDefault();
              onCancel();
            }
          }}
        />
        <button
          onClick={onSave}
          className="text-xs px-3 py-1 rounded bg-rose-600 text-white hover:bg-rose-700"
        >
          保存
        </button>
        <button
          onClick={onCancel}
          className="text-xs px-2 py-1 rounded text-gray-500 hover:text-gray-700"
        >
          取消
        </button>
      </div>
    );
  }
  return (
    <button
      onClick={onStartEdit}
      className="text-xs text-gray-500 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 inline-flex items-center gap-1"
    >
      <span aria-hidden>🏷</span>
      {entry.tag ? `标签：#${entry.tag}（点击修改）` : "+ 加标签"}
    </button>
  );
}
