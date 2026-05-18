import { NextRequest, NextResponse } from "next/server";
import { pickExampleFor } from "@/lib/examples";
import { callDeepSeek } from "@/lib/llm";
import { buildCoachPrompt } from "@/lib/prompts";
import { checkAndIncrement, extractIp } from "@/lib/rate-limit";
import { CoachResultSchema } from "@/lib/schemas";
import type { CoachInput, CoachResult } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getQuota(): number {
  const raw = process.env.FREE_QUOTA_PER_DAY;
  const n = raw ? parseInt(raw, 10) : 5;
  return Number.isFinite(n) && n > 0 ? n : 5;
}

function isMockMode(): boolean {
  return process.env.MOCK_LLM === "1" || !process.env.DEEPSEEK_API_KEY;
}

function isValidInput(x: unknown): x is CoachInput {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  if (typeof o.message !== "string" || !o.message.trim()) return false;
  if (o.message.length > 2000) return false;
  if (
    o.perspective !== "male-to-female" &&
    o.perspective !== "female-to-male"
  ) {
    return false;
  }
  return true;
}

async function getMockResult(input: CoachInput): Promise<CoachResult> {
  await new Promise((r) => setTimeout(r, 600));
  return pickExampleFor(input);
}

async function callWithValidation(
  input: CoachInput,
  maxAttempts = 2,
): Promise<CoachResult> {
  let lastError = "unknown";
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const messages = buildCoachPrompt(input);
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
  let input: unknown;
  try {
    input = await req.json();
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }

  if (!isValidInput(input)) {
    return NextResponse.json(
      { error: "请输入对方的消息（最多 2000 字）并选择视角" },
      { status: 400 },
    );
  }

  const quota = getQuota();
  const ip = extractIp(req.headers);
  const rate = await checkAndIncrement(ip, quota);
  if (!rate.ok) {
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

    return NextResponse.json({ result, remaining: rate.remaining });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "未知错误";
    console.error("[coach]", msg);
    const friendly = msg.startsWith("DeepSeek")
      ? "AI 服务暂时不可用，请稍后再试"
      : msg.includes("Schema validation") || msg.includes("JSON parse")
        ? "AI 输出格式异常，请重试一次"
        : "服务异常，请稍后重试";
    return NextResponse.json({ error: friendly }, { status: 500 });
  }
}
