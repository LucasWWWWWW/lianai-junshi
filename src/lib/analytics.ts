import { getStore } from "@netlify/blobs";

const STORE_NAME = "call-logs";

export type CallStatus = "ok" | "error" | "rate-limited";
export type CallRoute = "coach" | "sos";

export interface CallLogEntry {
  ts: number;
  route: CallRoute;
  status: CallStatus;
  durationMs: number;
  perspective?: string;
  /** coach: stage; sos: scenario. */
  variant?: string;
  /** sos only: who's at fault. */
  faultLevel?: string;
  /** result emotion if ok. */
  emotion?: string;
  /** error category for triage. */
  errorClass?: "llm" | "schema" | "json" | "validation" | "other";
}

/**
 * Append a single anonymous call log to Netlify Blobs.
 * One blob per entry to avoid read-modify-write races on free tier.
 * Silent on failure — never blocks the user-facing response.
 */
export async function logCall(entry: CallLogEntry): Promise<void> {
  try {
    const store = getStore({ name: STORE_NAME });
    const date = new Date(entry.ts).toISOString().slice(0, 10);
    const key = `call:${date}:${entry.ts}:${randomTail()}`;
    await store.setJSON(key, entry);
  } catch {
    // Mock / dev / quota — silent.
  }
}

/**
 * List recent call entries (last N days, paginated by date prefix).
 * For admin dashboards. Returns newest first.
 */
export async function listRecentCalls(
  days = 7,
  limit = 500,
): Promise<CallLogEntry[]> {
  try {
    const store = getStore({ name: STORE_NAME });
    const out: CallLogEntry[] = [];
    const today = new Date();
    for (let i = 0; i < days && out.length < limit; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const prefix = `call:${d.toISOString().slice(0, 10)}`;
      const list = await store.list({ prefix });
      for (const item of list.blobs ?? []) {
        if (out.length >= limit) break;
        const entry = (await store.get(item.key, {
          type: "json",
        })) as CallLogEntry | null;
        if (entry) out.push(entry);
      }
    }
    out.sort((a, b) => b.ts - a.ts);
    return out;
  } catch {
    return [];
  }
}

function randomTail(): string {
  return Math.random().toString(36).slice(2, 8);
}
