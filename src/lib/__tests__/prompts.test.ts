import { describe, expect, it } from "vitest";
import { buildCoachPrompt } from "../prompts";
import type { CoachInput } from "../types";

const baseInput: CoachInput = {
  perspective: "male-to-female",
  stage: "committed",
  message: "没事，你忙你的吧。",
  context: "答应陪逛街临时加班",
};

describe("buildCoachPrompt", () => {
  it("returns at least 2 messages: system + final user", () => {
    const msgs = buildCoachPrompt(baseInput);
    expect(msgs.length).toBeGreaterThanOrEqual(2);
    expect(msgs[0].role).toBe("system");
    expect(msgs[msgs.length - 1].role).toBe("user");
  });

  it("includes few-shot pairs (user/assistant) between system and final user", () => {
    const msgs = buildCoachPrompt(baseInput);
    const middle = msgs.slice(1, -1);
    // Few-shot pairs come in user/assistant tuples
    expect(middle.length % 2).toBe(0);
    for (let i = 0; i < middle.length; i += 2) {
      expect(middle[i].role).toBe("user");
      expect(middle[i + 1].role).toBe("assistant");
    }
  });

  it("final user message contains the actual input message", () => {
    const msgs = buildCoachPrompt(baseInput);
    const finalUser = msgs[msgs.length - 1];
    expect(finalUser.content).toContain(baseInput.message);
  });

  it("includes context when provided", () => {
    const msgs = buildCoachPrompt(baseInput);
    const finalUser = msgs[msgs.length - 1];
    expect(finalUser.content).toContain("答应陪逛街临时加班");
  });

  it("omits context line when not provided", () => {
    const msgs = buildCoachPrompt({ ...baseInput, context: undefined });
    const finalUser = msgs[msgs.length - 1];
    expect(finalUser.content).not.toContain("背景补充");
  });

  it("includes perspective label", () => {
    const msgs = buildCoachPrompt(baseInput);
    const finalUser = msgs[msgs.length - 1];
    expect(finalUser.content).toContain("男生面对女生");
  });

  it("translates stage to chinese label", () => {
    const msgs = buildCoachPrompt(baseInput);
    const finalUser = msgs[msgs.length - 1];
    expect(finalUser.content).toContain("稳定期");
  });

  it("system prompt asks for JSON output", () => {
    const msgs = buildCoachPrompt(baseInput);
    expect(msgs[0].content).toContain("JSON");
  });
});
