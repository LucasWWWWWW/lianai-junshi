"use client";

import { useMemo, useState } from "react";
import {
  ALL_SPEAKERS,
  ALL_TAGS,
  type DictEntry,
  type DictSpeaker,
} from "@/lib/dict-data";

export function DictView({ entries }: { entries: DictEntry[] }) {
  const [query, setQuery] = useState("");
  const [speaker, setSpeaker] = useState<DictSpeaker | "全部">("全部");
  const [tag, setTag] = useState<string | "全部">("全部");
  const [openPhrase, setOpenPhrase] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      if (speaker !== "全部" && e.by !== speaker) return false;
      if (tag !== "全部" && !e.tags.includes(tag)) return false;
      if (!q) return true;
      return (
        e.phrase.toLowerCase().includes(q) ||
        e.meaning.toLowerCase().includes(q) ||
        e.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [entries, query, speaker, tag]);

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索词条 / 含义 / 标签…  例如：没事、敷衍、试探"
          className="form-input"
          aria-label="搜索词条"
        />

        <div className="flex flex-wrap gap-2 text-xs">
          <FilterChip
            label="说话方"
            value={speaker}
            options={["全部", ...ALL_SPEAKERS]}
            onChange={(v) => setSpeaker(v as DictSpeaker | "全部")}
          />
          <FilterChip
            label="标签"
            value={tag}
            options={["全部", ...ALL_TAGS]}
            onChange={(v) => setTag(v)}
          />
          <span className="ml-auto text-gray-500 dark:text-gray-400 self-center">
            {filtered.length}/{entries.length} 条
          </span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 border border-dashed rounded-xl border-gray-300 dark:border-gray-700 text-sm text-gray-400">
          没有匹配的词条，试试改个关键词或选「全部」
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((e) => (
            <DictCard
              key={e.phrase}
              entry={e}
              isOpen={openPhrase === e.phrase}
              onToggle={() =>
                setOpenPhrase(openPhrase === e.phrase ? null : e.phrase)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="inline-flex items-center gap-1.5 bg-gray-50 dark:bg-gray-900 rounded-full px-3 py-1 border border-gray-200 dark:border-gray-800">
      <span className="text-gray-500 dark:text-gray-400">{label}:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-rose-600 dark:text-rose-400 font-medium focus:outline-none cursor-pointer"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function speakerBadge(by: DictSpeaker): string {
  if (by === "女") return "bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300";
  if (by === "男") return "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300";
  return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300";
}

function DictCard({
  entry,
  isOpen,
  onToggle,
}: {
  entry: DictEntry;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <article className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-800/50 transition"
      >
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-baseline gap-2 flex-wrap">
            <h3 className="text-base font-semibold">
              「{entry.phrase}」
            </h3>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${speakerBadge(entry.by)}`}
            >
              {entry.by}说
            </span>
          </div>
          <span className="text-xs text-gray-400" aria-hidden>
            {isOpen ? "▲" : "▼"}
          </span>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {entry.meaning}
        </p>
        <div className="mt-2 flex flex-wrap gap-1">
          {entry.tags.map((t) => (
            <span
              key={t}
              className="text-[10px] bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded"
            >
              #{t}
            </span>
          ))}
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-gray-100 dark:border-gray-800 p-4 space-y-3 bg-gray-50/50 dark:bg-gray-900/30">
          <div className="rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50/60 dark:bg-amber-950/20 p-3">
            <div className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">
              ⚠ 雷区回应（千万别这样）
            </div>
            <p className="text-sm text-gray-800 dark:text-gray-200 mb-1">
              「{entry.badReply}」
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {entry.badReason}
            </p>
          </div>

          <div className="rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50/60 dark:bg-emerald-950/20 p-3">
            <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
              ✓ 优秀示范
            </div>
            <p className="text-sm text-gray-800 dark:text-gray-200 mb-1">
              「{entry.goodReply}」
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {entry.goodReason}
            </p>
          </div>
        </div>
      )}
    </article>
  );
}
