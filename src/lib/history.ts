import type { CoachInput, CoachResult } from "./types";

const STORAGE_KEY = "lianai-junshi:history:v1";
const MAX_ENTRIES = 30;

export interface HistoryEntry {
  id: string;
  createdAt: number;
  input: CoachInput;
  result: CoachResult;
}

function isBrowser() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function loadHistory(): HistoryEntry[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is HistoryEntry =>
        !!e &&
        typeof e === "object" &&
        typeof (e as HistoryEntry).id === "string" &&
        typeof (e as HistoryEntry).createdAt === "number" &&
        !!(e as HistoryEntry).input &&
        !!(e as HistoryEntry).result,
    );
  } catch {
    return [];
  }
}

export function appendHistory(
  input: CoachInput,
  result: CoachResult,
): HistoryEntry {
  const entry: HistoryEntry = {
    id: cryptoRandomId(),
    createdAt: Date.now(),
    input,
    result,
  };
  if (!isBrowser()) return entry;
  try {
    const current = loadHistory();
    const next = [entry, ...current].slice(0, MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // quota exceeded or disabled — silent
  }
  return entry;
}

export function removeHistory(id: string): HistoryEntry[] {
  if (!isBrowser()) return [];
  const next = loadHistory().filter((e) => e.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {}
  return next;
}

export function clearHistory(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(STORAGE_KEY);
}

function cryptoRandomId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "刚刚";
  if (m < 60) return `${m} 分钟前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} 小时前`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} 天前`;
  const date = new Date(ts);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}
