import { COACH_EXAMPLES } from "./examples";
import type { ChatMessage, CoachInput } from "./types";

const PERSPECTIVE_LABEL = {
  "male-to-female": "男生面对女生",
  "female-to-male": "女生面对男生",
} as const;

const STAGE_LABEL = {
  flirting: "暧昧期",
  dating: "热恋期",
  committed: "稳定期",
  "rough-patch": "磨合期/有矛盾",
} as const;

const SYSTEM_PROMPT = `你是一位资深恋爱军师，深度掌握男女思维差异理论（火星/金星思维模型），擅长高情商话术、潜台词解读和情绪共情。

请严格按 JSON 格式输出（response_format: json_object），不要包含 markdown 代码块、不要任何说明文字，直接输出 JSON。

输出结构（所有字段必填）：
{
  "emotion": "1 个词的情绪标签：失望/试探/撒娇/敷衍/委屈/生气/期待/无聊/不安/释怀/吃醋/疲惫 等",
  "emotionDetail": "对方此刻真实情绪状态的具体解读（不超过 60 字）",
  "subtext": "对方话语背后的潜台词（不超过 60 字）",
  "realNeed": "对方真正想要的是什么（不超过 60 字）",
  "replies": [
    { "style": "温柔共情版", "text": "回复话术（30-120 字，可直接复制发送，需有人味、避免 AI 腔）", "why": "为什么这样回有效（1 句话）" },
    { "style": "高情商进阶版", "text": "...", "why": "..." },
    { "style": "幽默破冰版", "text": "...", "why": "..." }
  ],
  "redLines": [
    { "phrase": "绝对不能说的话（20 字内）", "reason": "为什么会引爆（1 句话）" },
    { "phrase": "...", "reason": "..." }
  ]
}

输出原则：
- 话术语气自然贴近真实情侣对话，禁止鸡汤、说教、空话、AI 腔
- 三套话术要有明显风格差异，不要相互雷同
- 雷区话术列 2-3 条，覆盖最容易踩的坑
- 全部中文输出
- 不要使用任何引用书名/作者名
- 参考下方示例的「质感」：具体场景、具体行动、有人情味、能直接复制发送`;

function formatUserMessage(input: CoachInput): string {
  return [
    `视角：${PERSPECTIVE_LABEL[input.perspective]}`,
    input.stage ? `关系阶段：${STAGE_LABEL[input.stage]}` : null,
    input.context ? `背景补充：${input.context}` : null,
    "",
    "对方刚刚发来：",
    '"""',
    input.message,
    '"""',
    "",
    "请按 JSON 格式输出分析 + 三套话术 + 雷区。",
  ]
    .filter(Boolean)
    .join("\n");
}

function pickFewShotExamples(input: CoachInput) {
  const sameView = COACH_EXAMPLES.filter(
    (e) => e.input.perspective === input.perspective,
  );

  if (sameView.length >= 2) return sameView.slice(0, 2);

  const other = COACH_EXAMPLES.filter(
    (e) => e.input.perspective !== input.perspective,
  );
  return [...sameView, ...other].slice(0, 2);
}

export function buildCoachPrompt(input: CoachInput): ChatMessage[] {
  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
  ];

  for (const ex of pickFewShotExamples(input)) {
    messages.push({ role: "user", content: formatUserMessage(ex.input) });
    messages.push({
      role: "assistant",
      content: JSON.stringify(ex.output),
    });
  }

  messages.push({ role: "user", content: formatUserMessage(input) });
  return messages;
}
