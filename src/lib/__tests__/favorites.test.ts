import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  clearFavorites,
  isFavorited,
  loadFavorites,
  removeFavorite,
  toggleFavorite,
} from "../favorites";
import type { Reply } from "../types";

const sampleReply: Reply = {
  style: "温柔版",
  text: "你这语气我懂，今晚我陪你",
  why: "认错加陪伴",
};

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

describe("favorites.toggleFavorite", () => {
  it("adds a new favorite on first toggle", () => {
    const added = toggleFavorite(sampleReply, "对方原话", "失望");
    expect(added).toBe(true);
    expect(loadFavorites()).toHaveLength(1);
  });

  it("removes existing favorite on second toggle", () => {
    toggleFavorite(sampleReply, "原话", "失望");
    const added = toggleFavorite(sampleReply, "原话", "失望");
    expect(added).toBe(false);
    expect(loadFavorites()).toHaveLength(0);
  });

  it("identifies favorite by reply.text equality", () => {
    toggleFavorite(sampleReply, "原话 A", "失望");
    // Same text, different metadata — should still match
    expect(isFavorited(sampleReply.text)).toBe(true);
    expect(isFavorited("不同的回复")).toBe(false);
  });

  it("truncates forMessage to 60 chars", () => {
    const long = "a".repeat(200);
    toggleFavorite(sampleReply, long);
    const all = loadFavorites();
    expect(all[0].forMessage.length).toBe(60);
  });

  it("caps total favorites at 100", () => {
    for (let i = 0; i < 105; i++) {
      toggleFavorite(
        { ...sampleReply, text: `reply variant ${i}` },
        `msg ${i}`,
      );
    }
    expect(loadFavorites()).toHaveLength(100);
  });
});

describe("favorites.removeFavorite + clearFavorites", () => {
  it("removes a single favorite", () => {
    toggleFavorite(sampleReply, "msg1");
    const second = { ...sampleReply, text: "second reply variant" };
    toggleFavorite(second, "msg2");
    const all = loadFavorites();
    const remaining = removeFavorite(all[0].id);
    expect(remaining).toHaveLength(1);
  });

  it("clearFavorites empties storage", () => {
    toggleFavorite(sampleReply, "msg");
    clearFavorites();
    expect(loadFavorites()).toHaveLength(0);
  });
});
