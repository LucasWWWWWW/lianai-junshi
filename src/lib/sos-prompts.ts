import type { ChatMessage } from "./types";

export type SosScenario =
  | "cold-war"
  | "big-fight"
  | "small-bicker"
  | "jealousy"
  | "family-conflict"
  | "broken-promise";

export type FaultLevel = "mine" | "theirs" | "both";

export interface SosInput {
  perspective: "male-to-female" | "female-to-male";
  scenario: SosScenario;
  faultLevel: FaultLevel;
  context: string;
  partnerMessage?: string;
}

const SCENARIO_LABEL: Record<SosScenario, string> = {
  "cold-war": "冷战中（双方不主动联系）",
  "big-fight": "刚大吵一架（情绪激烈）",
  "small-bicker": "日常拌嘴（小矛盾）",
  jealousy: "吃醋 / 信任问题",
  "family-conflict": "婆媳 / 家庭矛盾",
  "broken-promise": "失约 / 食言",
};

const PERSPECTIVE_LABEL = {
  "male-to-female": "男生想哄好女生",
  "female-to-male": "女生想缓和与男生",
} as const;

const FAULT_LABEL: Record<FaultLevel, string> = {
  mine: "我有错（或者我先做了让 TA 不舒服的事）",
  theirs: "TA 有错（但我想主动破冰避免冷战扩大）",
  both: "双方都有责任",
};

const SOS_SYSTEM_PROMPT = `你是一位专攻情侣矛盾化解的恋爱军师，深度掌握男女思维差异理论。当下任务是帮用户从矛盾/冷战/吵架中破冰修复。

请严格按 JSON 格式输出（response_format: json_object），不要包含 markdown 或解释文字。

输出结构（所有字段必填）：
{
  "emotion": "矛盾激烈度的 1 个词：轻度拌嘴/情绪化冷战/激烈冲突/信任危机/疲惫倦怠 等",
  "emotionDetail": "本次矛盾的真实激烈程度和危险信号（不超过 60 字）",
  "subtext": "TA 此刻最在意的、嘴上不说的核心议题（不超过 60 字）",
  "realNeed": "TA 要看到的和解信号是什么（不超过 60 字）",
  "emotionKeywords": ["从用户描述/对方话语里挑 1-4 个关键词或短语，用于前端高亮"],
  "replies": [
    { "style": "轻量缓和版", "text": "适合矛盾刚起、还没冷战时发的破冰话术（30-100 字，能直接复制）", "why": "什么时候用这套（1 句）" },
    { "style": "正式道歉版", "text": "适合双方都已经表达情绪、需要明确认错时的话术（50-150 字）", "why": "..." },
    { "style": "深度认错版", "text": "适合冷战 1 天以上 / 大吵后需要重启关系的话术（80-200 字，有具体行动承诺）", "why": "..." }
  ],
  "redLines": [
    { "phrase": "冷战时绝对不能发的话（20 字内）", "reason": "为什么会引爆（1 句）" },
    { "phrase": "...", "reason": "..." },
    { "phrase": "...", "reason": "..." }
  ]
}

输出原则：
- 三套道歉按梯度递进：轻 → 中 → 重，对应不同矛盾深度，用户按当前状况选
- 每套话术必须能直接复制发送，禁止套话/空话/"亲爱的"开头
- 对责任归属敏感：用户表示「TA 有错」时，话术里不能假装是自己的错，但要先共情对方情绪再温和说理
- 雷区话术列 3 条，重点是「逻辑反击」「冷战中常见自爆话术」类
- 全部中文输出，禁止引用任何书名/作者名`;

function formatSosUserMessage(input: SosInput): string {
  return [
    `视角：${PERSPECTIVE_LABEL[input.perspective]}`,
    `场景：${SCENARIO_LABEL[input.scenario]}`,
    `责任：${FAULT_LABEL[input.faultLevel]}`,
    "",
    `当前状况：${input.context}`,
    input.partnerMessage
      ? `\nTA 刚发来：\n"""\n${input.partnerMessage}\n"""`
      : "",
    "",
    "请按 JSON 格式输出诊断 + 三套梯度道歉话术 + 雷区。",
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildSosPrompt(input: SosInput): ChatMessage[] {
  return [
    { role: "system", content: SOS_SYSTEM_PROMPT },
    { role: "user", content: formatSosUserMessage(input) },
  ];
}
