import { NextRequest, NextResponse } from "next/server";
import { logCall } from "@/lib/analytics";
import { callDeepSeek } from "@/lib/llm";
import { checkAndIncrement, extractIp } from "@/lib/rate-limit";
import { CoachResultSchema } from "@/lib/schemas";
import {
  type SosInput,
  buildSosPrompt,
} from "@/lib/sos-prompts";
import { pickSosExampleFor } from "@/lib/sos-examples";
import type { CoachResult } from "@/lib/types";

function classifyError(msg: string): "llm" | "schema" | "json" | "other" {
  if (msg.startsWith("DeepSeek")) return "llm";
  if (msg.includes("Schema")) return "schema";
  if (msg.includes("JSON")) return "json";
  return "other";
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SOS_SCENARIOS = [
  "cold-war",
  "big-fight",
  "small-bicker",
  "jealousy",
  "family-conflict",
  "broken-promise",
] as const;

const FAULT_LEVELS = ["mine", "theirs", "both"] as const;

function getQuota(): number {
  const raw = process.env.FREE_QUOTA_PER_DAY;
  const n = raw ? parseInt(raw, 10) : 5;
  return Number.isFinite(n) && n > 0 ? n : 5;
}

function isMockMode(): boolean {
  return process.env.MOCK_LLM === "1" || !process.env.DEEPSEEK_API_KEY;
}

function isValidSosInput(x: unknown): x is SosInput {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  if (
    o.perspective !== "male-to-female" &&
    o.perspective !== "female-to-male"
  )
    return false;
  if (!SOS_SCENARIOS.includes(o.scenario as (typeof SOS_SCENARIOS)[number]))
    return false;
  if (!FAULT_LEVELS.includes(o.faultLevel as (typeof FAULT_LEVELS)[number]))
    return false;
  if (typeof o.context !== "string" || !o.context.trim()) return false;
  if (o.context.length > 1500) return false;
  if (
    o.partnerMessage !== undefined &&
    (typeof o.partnerMessage !== "string" ||
      o.partnerMessage.length > 800)
  )
    return false;
  return true;
}

async function getMockResult(input: SosInput): Promise<CoachResult> {
  await new Promise((r) => setTimeout(r, 600));
  return pickSosExampleFor(input);
}

async function callWithValidation(
  input: SosInput,
  maxAttempts = 2,
): Promise<CoachResult> {
  let lastError = "unknown";
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const messages = buildSosPrompt(input);
    let raw: string;
    try {
      raw = await callDeepSeek(messages);
    } catch (e) {
      lastError = e instanceof Error ? e.message : "LLM call failed";
      continue;
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      lastError = "JSON parse failed";
      continue;
    }
    const validated = CoachResultSchema.safeParse(parsed);
    if (validated.success) return validated.data;
    lastError = `Schema validation failed: ${validated.error.issues[0]?.message ?? "unknown"}`;
  }
  throw new Error(lastError);
}

export async function POST(req: NextRequest) {
  const startedAt = Date.now();

  let input: unknown;
  try {
    input = await req.json();
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }

  if (!isValidSosInput(input)) {
    return NextResponse.json(
      { error: "请填写完整：场景 / 责任归属 / 当前状况" },
      { status: 400 },
    );
  }

  const quota = getQuota();
  const ip = extractIp(req.headers);
  const rate = await checkAndIncrement(ip, quota);
  if (!rate.ok) {
    logCall({
      ts: Date.now(),
      route: "sos",
      status: "rate-limited",
      durationMs: Date.now() - startedAt,
      perspective: input.perspective,
      variant: input.scenario,
      faultLevel: input.faultLevel,
    }).catch(() => {});
    return NextResponse.json(
      {
        error: `今日免费额度已用完（${quota} 次/天）。明天再来，或留意付费版上线。`,
        remaining: 0,
      },
      { status: 429 },
    );
  }

  try {
    const result = isMockMode()
      ? await getMockResult(input)
      : await callWithValidation(input);

    logCall({
      ts: Date.now(),
      route: "sos",
      status: "ok",
      durationMs: Date.now() - startedAt,
      perspective: input.perspective,
      variant: input.scenario,
      faultLevel: input.faultLevel,
      emotion: result.emotion,
    }).catch(() => {});

    return NextResponse.json({ result, remaining: rate.remaining });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "未知错误";
    console.error("[sos]", msg);
    logCall({
      ts: Date.now(),
      route: "sos",
      status: "error",
      durationMs: Date.now() - startedAt,
      perspective: input.perspective,
      variant: input.scenario,
      faultLevel: input.faultLevel,
      errorClass: classifyError(msg),
    }).catch(() => {});

    const friendly = msg.startsWith("DeepSeek")
      ? "AI 服务暂时不可用，请稍后再试"
      : msg.includes("Schema") || msg.includes("JSON")
        ? "AI 输出格式异常，请重试一次"
        : "服务异常，请稍后重试";
    return NextResponse.json({ error: friendly }, { status: 500 });
  }
}
