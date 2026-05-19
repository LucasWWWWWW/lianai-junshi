import { describe, expect, it } from "vitest";
import { CoachResultSchema, ReplySchema } from "../schemas";

const validResult = {
  emotion: "失望",
  emotionDetail: "嘴上说没事但情绪退后",
  subtext: "我期待你优先选我",
  realNeed: "需要被重视感",
  emotionKeywords: ["没事", "忙你的"],
  replies: [
    { style: "温柔版", text: "你这语气我懂，今晚我陪你", why: "认错+陪伴" },
    { style: "进阶版", text: "我错了，周六全天空出来给你", why: "具体承诺" },
    { style: "幽默版", text: "你这没事听得我后脖子凉了，赎罪去", why: "自嘲化解" },
  ],
  redLines: [{ phrase: "下次补给你", reason: "模糊承诺最伤" }],
};

describe("CoachResultSchema", () => {
  it("accepts a fully-formed valid result", () => {
    const r = CoachResultSchema.safeParse(validResult);
    expect(r.success).toBe(true);
  });

  it("accepts result without optional emotionKeywords", () => {
    const { emotionKeywords: _omit, ...rest } = validResult;
    void _omit;
    const r = CoachResultSchema.safeParse(rest);
    expect(r.success).toBe(true);
  });

  it("rejects when fewer than 3 replies", () => {
    const bad = { ...validResult, replies: validResult.replies.slice(0, 2) };
    const r = CoachResultSchema.safeParse(bad);
    expect(r.success).toBe(false);
  });

  it("rejects when emotion is empty string", () => {
    const r = CoachResultSchema.safeParse({ ...validResult, emotion: "" });
    expect(r.success).toBe(false);
  });

  it("rejects when reply text is too short", () => {
    const bad = {
      ...validResult,
      replies: [
        { style: "短", text: "短", why: "短" },
        ...validResult.replies.slice(1),
      ],
    };
    const r = CoachResultSchema.safeParse(bad);
    expect(r.success).toBe(false);
  });

  it("caps emotionKeywords at 8", () => {
    const bad = {
      ...validResult,
      emotionKeywords: Array(9).fill("词"),
    };
    const r = CoachResultSchema.safeParse(bad);
    expect(r.success).toBe(false);
  });

  it("rejects empty redLines", () => {
    const r = CoachResultSchema.safeParse({ ...validResult, redLines: [] });
    expect(r.success).toBe(false);
  });
});

describe("ReplySchema", () => {
  it("requires non-empty style", () => {
    expect(
      ReplySchema.safeParse({ style: "", text: "abcdefghij", why: "x" })
        .success,
    ).toBe(false);
  });
});
