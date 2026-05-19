import type { CoachInput, CoachResult } from "./types";

export interface CoachExample {
  input: CoachInput;
  output: CoachResult;
}

export const COACH_EXAMPLES: CoachExample[] = [
  {
    input: {
      perspective: "male-to-female",
      stage: "committed",
      context: "答应陪她逛街，临时被同事拉去加班",
      message: "没事，你忙你的吧。",
    },
    output: {
      emotion: "失望",
      emotionDetail:
        "嘴上说没事但情绪已经退后了，平静里带着委屈，等你主动给个台阶。",
      subtext: "我期待你优先选我，而不是把我排在工作后面。",
      realNeed: "想确认在你心里有没有比工作更靠前的位置，需要被重视感。",
      emotionKeywords: ["没事", "你忙你的"],
      replies: [
        {
          style: "温柔共情版",
          text: "看你这语气就知道你心里别扭了。今天的事是我没安排好，本来今天就该陪你，先记账。你晚上想吃什么我去买回来，逛街周末我空出整天。",
          why: "先承认她的情绪+主动提出补偿方案，给具体行动而不是空话。",
        },
        {
          style: "高情商进阶版",
          text: "我知道你说没事就是有事，我也讨厌临时被拉走。先承诺一件事：周六上午十点我就在你家楼下，你想去哪就去哪，今天这账记我头上。",
          why: "直接戳破「没事」的伪装、共情她的不爽，并给可执行的明确承诺。",
        },
        {
          style: "幽默破冰版",
          text: "你这「没事」听得我后脖子都凉了。罚我今晚买你最爱的那家麻辣烫加两份毛肚，附赠陪你逛任意三家店不许说累，这就出门赎罪。",
          why: "用自嘲化解尴尬，但仍包含具体补偿，避免显得不严肃。",
        },
      ],
      redLines: [
        {
          phrase: "好的那我先忙了",
          reason: "彻底坐实她的「我在你心里不如工作重要」的猜想，必爆。",
        },
        {
          phrase: "下次补给你",
          reason: '"下次"是模糊承诺，正是她最不想听到的敷衍套路。',
        },
        {
          phrase: "你又来了，至于吗",
          reason: "把她的情绪定性为无理取闹，从冷战直接升级到大吵。",
        },
      ],
    },
  },
  {
    input: {
      perspective: "female-to-male",
      stage: "flirting",
      context: "第三次约饭结束，他送我回家路上发的",
      message: "你今晚开心吗？我感觉你有点心不在焉。",
    },
    output: {
      emotion: "不安",
      emotionDetail:
        "他在你脸上读出了距离感，开始怀疑你对他的兴趣，需要被肯定。",
      subtext: "我担心是不是你不喜欢我了，或者我哪里做得不够好。",
      realNeed: "想确认你今晚的真实感受，希望你给一个肯定具体的回应。",
      emotionKeywords: ["心不在焉", "感觉你"],
      replies: [
        {
          style: "温柔共情版",
          text: "怎么会，今晚我笑那么多次你还心虚。其实是你说到去川西自驾那段，我脑子里已经在想行李怎么收了，所以走神。",
          why: "用具体场景证明你在听+暗示对他规划充满兴趣，安全感拉满。",
        },
        {
          style: "高情商进阶版",
          text: "被你抓到了，确实想事情来着——在想我们下次见面别再吃这家了，他家菜咸到我现在还在喝水。下周三晚上你有空吗？我换一家。",
          why: "承认走神但巧妙转化为「已经在想下次见你」，直接推进关系。",
        },
        {
          style: "幽默破冰版",
          text: "心不在焉是因为光顾着看你的酒窝了，菜都没怎么吃。这能怪我吗。",
          why: "撒娇式调情，把「走神」转化为对他的关注，氛围立刻升温。",
        },
      ],
      redLines: [
        {
          phrase: "没有啊，挺好的",
          reason: "敷衍标准答案，他会更确定「你没那么在意」。",
        },
        {
          phrase: "今天有点累，可能状态不好",
          reason: '把"累"当借口=暗示见你让我消耗，等于推开。',
        },
      ],
    },
  },
  {
    input: {
      perspective: "male-to-female",
      stage: "rough-patch",
      context: "因为我妈来住几天的事冷战 2 天",
      message: "算了我懒得说了，你和你妈一边去吧。",
    },
    output: {
      emotion: "委屈",
      emotionDetail:
        "她已经说累了，背后是两天没人来哄+婆媳问题让她觉得被孤立，是失望叠加。",
      subtext: "你从来不站在我这边，我在你家里没有位置。",
      realNeed: "需要你明确表态站她，把她从「外人」位置拉回「自己人」。",
      emotionKeywords: ["算了", "懒得说", "一边去"],
      replies: [
        {
          style: "温柔共情版",
          text: "我错了，这两天我没站好位置。你不是要赶谁走，是要我先把你当回事。今晚我跟我妈说清楚边界，这事不再让你一个人扛。",
          why: '正面认错+具体行动表态站她，回应她"被孤立"的核心痛点。',
        },
        {
          style: "高情商进阶版",
          text: "你说得对，我该一开始就跟我妈讲清楚住几天、怎么相处。这是我的事不该让你出面。我现在去跟她聊，今晚回来你给我评分。",
          why: "把「婆媳冲突」重新定义为「我的责任」，把她从战场撤出。",
        },
        {
          style: "幽默破冰版",
          text: "别一边去，你一边去了我跟我妈两个人尬聊更可怕。先抱抱再说。我已经在订明天的下午茶了，咱俩出去躲一下。",
          why: "用轻松感打破冷战僵局，但藏着「我也想跟你独处」的潜台词。",
        },
      ],
      redLines: [
        {
          phrase: "你冷静一下",
          reason: "等于说她无理取闹，瞬间从委屈升级到怒。",
        },
        {
          phrase: "我妈也没说什么啊",
          reason: "替你妈辩护=她在你心里输了，会觉得整个家都不站她。",
        },
        {
          phrase: "就事论事好不好",
          reason: '她要的就是"事"之外的情感站队，逻辑论事是火上浇油。',
        },
      ],
    },
  },
  {
    input: {
      perspective: "female-to-male",
      stage: "dating",
      context: "周六我加班，他独自和朋友去爬山，晚上发的",
      message: "今天玩得挺爽的，下次叫上你。",
    },
    output: {
      emotion: "试探",
      emotionDetail:
        "看似分享，其实想确认你介不介意他没带你，以及你是否会主动安排下次一起。",
      subtext: "我希望你说想我了/羡慕了，证明在你心里我有位置。",
      realNeed: "需要听到你想被带上+你也愿意花时间陪他玩这件事。",
      emotionKeywords: ["下次叫上你"],
      replies: [
        {
          style: "温柔共情版",
          text: "看你朋友圈照片就知道天气特别好，看得我加班都不香了。下次你要去爬山提前两天告诉我，我把周末排开陪你去。",
          why: "夸他+主动承诺时间，回应他「我在你心里有位置」的隐性需求。",
        },
        {
          style: "高情商进阶版",
          text: "下次必须叫我啊，我登山鞋都买好了一直没用过。这周五咱定个时间，再约一次你们那群人，我请大家奶茶。",
          why: '直接接他抛过来的"下次"+给具体时间锚点，进一步推进。',
        },
        {
          style: "幽默破冰版",
          text: "你倒是会拍照啊，给我看你那张举着登山杖的我笑了一路。下次没我不许去，违约金一顿火锅。",
          why: "调侃式互动+轻巧约定下一次，氛围比正式邀约更暧昧。",
        },
      ],
      redLines: [
        {
          phrase: "嗯，挺好的",
          reason: "标准敷衍，他会觉得你不在意他的生活。",
        },
        {
          phrase: "你们玩你们的吧",
          reason: "推开式回复，等于亲手给关系降温。",
        },
      ],
    },
  },
];

export function pickExampleFor(input: CoachInput): CoachResult {
  const lower = input.message.toLowerCase();

  for (const ex of COACH_EXAMPLES) {
    if (
      ex.input.perspective === input.perspective &&
      ex.input.stage === input.stage &&
      (input.message.includes(ex.input.message.slice(0, 4)) ||
        lower.includes(ex.input.message.toLowerCase().slice(0, 4)))
    ) {
      return ex.output;
    }
  }

  const sameViewpoint = COACH_EXAMPLES.filter(
    (e) => e.input.perspective === input.perspective,
  );
  const pool = sameViewpoint.length > 0 ? sameViewpoint : COACH_EXAMPLES;
  return pool[Math.floor(Math.random() * pool.length)].output;
}
