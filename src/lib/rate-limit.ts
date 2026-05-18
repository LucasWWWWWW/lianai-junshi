import crypto from "node:crypto";
import { getStore } from "@netlify/blobs";

const STORE_NAME = "rate-limit";

interface RateEntry {
  count: number;
  resetAt: number;
}

const memStore = new Map<string, RateEntry>();

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetAt: number;
}

export async function checkAndIncrement(
  ip: string,
  quota: number,
): Promise<RateLimitResult> {
  const today = new Date().toISOString().slice(0, 10);
  const key = `${today}:${hashIp(ip)}`;
  const resetAt = nextMidnight();

  try {
    const store = getStore({ name: STORE_NAME, consistency: "strong" });
    const current = (await store.get(key, { type: "json" })) as RateEntry | null;
    const count = (current?.count ?? 0) + 1;
    if (count > quota) {
      return { ok: false, remaining: 0, resetAt };
    }
    await store.setJSON(key, { count, resetAt });
    return { ok: true, remaining: quota - count, resetAt };
  } catch {
    const entry = memStore.get(key);
    const count = (entry?.count ?? 0) + 1;
    if (count > quota) {
      return { ok: false, remaining: 0, resetAt };
    }
    memStore.set(key, { count, resetAt });
    return { ok: true, remaining: quota - count, resetAt };
  }
}

function hashIp(ip: string): string {
  return crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

function nextMidnight(): number {
  const d = new Date();
  d.setHours(24, 0, 0, 0);
  return d.getTime();
}

export function extractIp(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  const real = headers.get("x-real-ip");
  if (real) return real.trim();
  return "anonymous";
}
