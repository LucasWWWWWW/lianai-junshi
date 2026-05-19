import type { Reply } from "./types";

const STORAGE_KEY = "lianai-junshi:favorites:v1";
const MAX_ENTRIES = 100;

export interface FavoriteEntry {
  id: string;
  createdAt: number;
  reply: Reply;
  /** Snippet of the original message this reply was for (max 60 chars). */
  forMessage: string;
  /** Optional emotion label from the original analysis. */
  emotion?: string;
}

function isBrowser() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function safeRead(): FavoriteEntry[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is FavoriteEntry =>
        !!e &&
        typeof e === "object" &&
        typeof (e as FavoriteEntry).id === "string" &&
        typeof (e as FavoriteEntry).createdAt === "number" &&
        !!(e as FavoriteEntry).reply,
    );
  } catch {
    return [];
  }
}

function safeWrite(entries: FavoriteEntry[]) {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    window.dispatchEvent(new Event("favorites:changed"));
  } catch {
    // quota exceeded — silent
  }
}

export function loadFavorites(): FavoriteEntry[] {
  return safeRead();
}

export function isFavorited(replyText: string): boolean {
  return safeRead().some((e) => e.reply.text === replyText);
}

export function toggleFavorite(
  reply: Reply,
  forMessage: string,
  emotion?: string,
): boolean {
  const current = safeRead();
  const existing = current.findIndex((e) => e.reply.text === reply.text);
  if (existing >= 0) {
    current.splice(existing, 1);
    safeWrite(current);
    return false;
  }
  const entry: FavoriteEntry = {
    id: cryptoRandomId(),
    createdAt: Date.now(),
    reply,
    forMessage: forMessage.slice(0, 60),
    emotion,
  };
  const next = [entry, ...current].slice(0, MAX_ENTRIES);
  safeWrite(next);
  return true;
}

export function removeFavorite(id: string): FavoriteEntry[] {
  const next = safeRead().filter((e) => e.id !== id);
  safeWrite(next);
  return next;
}

export function clearFavorites(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("favorites:changed"));
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
