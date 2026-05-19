import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  appendHistory,
  clearHistory,
  formatRelativeTime,
  loadHistory,
  moveHistoryEntry,
  removeHistory,
  updateHistoryEntry,
} from "../history";
import type { CoachInput, CoachResult } from "../types";

const sampleInput: CoachInput = {
  perspective: "male-to-female",
  stage: "committed",
  message: "test message",
};

const sampleResult: CoachResult = {
  emotion: "失望",
  emotionDetail: "detail",
  subtext: "sub",
  realNeed: "need",
  replies: [
    { style: "A", text: "alpha text long enough", why: "a" },
    { style: "B", text: "bravo text long enough", why: "b" },
    { style: "C", text: "charlie text long enough", why: "c" },
  ],
  redLines: [{ phrase: "no", reason: "because" }],
};

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

describe("history.appendHistory", () => {
  it("returns entry with id + createdAt", () => {
    const entry = appendHistory(sampleInput, sampleResult);
    expect(entry.id).toBeTypeOf("string");
    expect(entry.id.length).toBeGreaterThan(0);
    expect(entry.createdAt).toBeTypeOf("number");
  });

  it("prepends new entry to existing list (most recent first)", () => {
    appendHistory(sampleInput, sampleResult);
    appendHistory({ ...sampleInput, message: "second" }, sampleResult);
    const list = loadHistory();
    expect(list).toHaveLength(2);
    expect(list[0].input.message).toBe("second");
    expect(list[1].input.message).toBe("test message");
  });

  it("caps stored entries at 30", () => {
    for (let i = 0; i < 35; i++) {
      appendHistory({ ...sampleInput, message: `m${i}` }, sampleResult);
    }
    const list = loadHistory();
    expect(list).toHaveLength(30);
    expect(list[0].input.message).toBe("m34");
  });
});

describe("history.removeHistory + clearHistory", () => {
  it("removes a single entry by id", () => {
    const e1 = appendHistory(sampleInput, sampleResult);
    appendHistory({ ...sampleInput, message: "keep" }, sampleResult);
    const remaining = removeHistory(e1.id);
    expect(remaining).toHaveLength(1);
    expect(remaining[0].input.message).toBe("keep");
  });

  it("clearHistory empties storage", () => {
    appendHistory(sampleInput, sampleResult);
    clearHistory();
    expect(loadHistory()).toHaveLength(0);
  });
});

describe("history.updateHistoryEntry", () => {
  it("attaches and overwrites tag", () => {
    const e = appendHistory(sampleInput, sampleResult);
    let list = updateHistoryEntry(e.id, { tag: "婆媳" });
    expect(list[0].tag).toBe("婆媳");
    list = updateHistoryEntry(e.id, { tag: undefined });
    expect(list[0].tag).toBeUndefined();
  });
});

describe("history.moveHistoryEntry", () => {
  it("moves entry up", () => {
    appendHistory({ ...sampleInput, message: "old" }, sampleResult);
    const e2 = appendHistory(
      { ...sampleInput, message: "new" },
      sampleResult,
    );
    // After append: [new, old]. Move "new" down should give [old, new].
    const moved = moveHistoryEntry(e2.id, "down");
    expect(moved.map((e) => e.input.message)).toEqual(["old", "new"]);
  });

  it("noop at boundary", () => {
    const e = appendHistory(sampleInput, sampleResult);
    const result = moveHistoryEntry(e.id, "up");
    expect(result).toHaveLength(1);
  });
});

describe("formatRelativeTime", () => {
  it("returns 刚刚 for very recent", () => {
    expect(formatRelativeTime(Date.now() - 5_000)).toBe("刚刚");
  });

  it("returns 分钟前 within an hour", () => {
    expect(formatRelativeTime(Date.now() - 5 * 60_000)).toBe("5 分钟前");
  });

  it("returns 小时前 within a day", () => {
    expect(formatRelativeTime(Date.now() - 3 * 3600_000)).toBe("3 小时前");
  });

  it("returns 天前 within a week", () => {
    expect(formatRelativeTime(Date.now() - 2 * 86400_000)).toBe("2 天前");
  });
});
