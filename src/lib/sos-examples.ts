import type { CoachResult } from "./types";
import type { SosInput } from "./sos-prompts";

export interface SosExample {
  input: SosInput;
  output: CoachResult;
}

export const SOS_EXAMPLES: SosExample[] = [
  {
    input: {
      perspective: "male-to-female",
      scenario: "cold-war",
      faultLevel: "mine",
      context:
        "答应陪她周末看电影，我临时被同事拉去聚餐去了，回来发现她已经睡了。第二天她全天没回我消息，到晚上还在冷战。",
      partnerMessage: "你忙你的吧，我不打扰了。",
    },
    output: {
      emotion: "情绪化冷战",
      emotionDetail:
        "已经从单次失望升级到「我不值得被你优先」的自我说服，再拖会演变成不安全感。",
      subtext: "你说的话和你做的事不一致，我开始怀疑你的承诺还能信吗。",
      realNeed:
        "需要你主动而具体地认错 + 把约会重新排上议程，证明她在你心里有位置。",
      emotionKeywords: ["你忙你的吧", "不打扰"],
      replies: [
        {
          style: "轻量缓和版",
          text: "我知道你气我了。是我先食言的，没立场让你接茬。今晚你想吃什么我去买，吃完想骂还是想哭都行，我陪着。",
          why: "冷战不到 24 小时、还没扩大到情绪堆叠时用，承认错+具体行动+给情绪出口。",
        },
        {
          style: "正式道歉版",
          text: "约电影是我先答应的，临时改主意是我的错，不是「忙不开」是「没把你排第一」。这周六上午我把整天空出来，电影 + 你之前说想去的那家咖啡 + 散步，行程我来定，你只管出现。",
          why: "冷战进入 24-48 小时、对方明显在等具体方案时用，把抽象愧疚换成可执行承诺。",
        },
        {
          style: "深度认错版",
          text: "我想了一晚，问题不是这一次。你之前几次提过我「答应得太爽快、临场打折」，我都没真当回事。我不想用「下次注意」这种话糊弄过去——这周开始，凡是答应你的事我都写进日历，提前一天确认。今天我先做一件：把上周欠你的电影补上，时间地点你定，我必到。",
          why: "冷战超过 2 天、或者她之前已经提过同样不满时用，承认模式问题+给系统性改变。",
        },
      ],
      redLines: [
        {
          phrase: "至于吗，不就是一场电影",
          reason: "把她的情绪定性为「小题大做」，瞬间从冷战升级到分手讨论。",
        },
        {
          phrase: "我也很累的，给点空间",
          reason: "在你已经食言的前提下要「空间」，等于二次抛弃她。",
        },
        {
          phrase: "下次我一定陪你",
          reason: "「下次」是她最讨厌的模糊承诺，你已经用过一次额度了。",
        },
      ],
    },
  },
  {
    input: {
      perspective: "female-to-male",
      scenario: "jealousy",
      faultLevel: "both",
      context:
        "他公司团建有个女同事跟他单独合影发朋友圈，我看到后阴阳了一句，他觉得我无理取闹，现在两人都在赌气。",
    },
    output: {
      emotion: "信任危机",
      emotionDetail: "争论的不是合影本身，是双方对「边界」的定义不一致。",
      subtext:
        "我介意的不是这一张照片，是你没意识到这会让我不舒服；他介意的是被默认有罪。",
      realNeed:
        "他需要被认可没有越界、你需要他主动给一个边界承诺，两件事都要做。",
      emotionKeywords: ["阴阳", "无理取闹"],
      replies: [
        {
          style: "轻量缓和版",
          text: "我先说，今天那句话我语气重了，是我反应过度。但你也明白，重点不是合照，是我希望以后这种事咱俩有个心照不宣的边界，OK 吗？",
          why: "矛盾刚起、双方还没真生气时用，先认自己语气问题再提诉求，不像道歉但比道歉更有效。",
        },
        {
          style: "正式道歉版",
          text: "对不起，「阴阳」是我不对。我清楚你没越界，只是看到那张照片心里咯噔一下，没绷住就冒酸了。但我也想说一句：以后这种朋友圈，咱俩商量一下再发好吗？不是不信任你，是我希望我们一起把这种小尴尬挡在外面。",
          why: "已经赌气、需要明确认错时用，先认错再说理，避开「但是」直接转折。",
        },
        {
          style: "深度认错版",
          text: "想了半天，我承认两点：第一，今天反应过度，我应该先单独问你，而不是在你朋友圈底下阴阳。第二，我意识到自己有时候安全感不太够，这是我要处理的。但我也很想认真和你聊一次：什么样的异性互动是我们都觉得 OK 的，这事咱俩之前没说清，现在借机说清。今晚见面聊，行吗？",
          why: "冷战 1 天以上、需要重塑关系规则时用，承认自己问题+提议建立明确边界。",
        },
      ],
      redLines: [
        {
          phrase: "你是不是心里有鬼",
          reason: "直接定罪，他会觉得无论怎么解释都被怀疑，从赌气变愤怒。",
        },
        {
          phrase: "好好好，是我错了行了吧",
          reason: "假道歉+反讽，比不道歉更伤，他会确认你毫无悔意。",
        },
        {
          phrase: "我们冷静几天",
          reason: "冷处理对吃醋类矛盾是火上浇油，他会以为你想分手。",
        },
      ],
    },
  },
];

export function pickSosExampleFor(input: SosInput): CoachResult {
  const sameView = SOS_EXAMPLES.filter(
    (e) =>
      e.input.perspective === input.perspective &&
      e.input.scenario === input.scenario,
  );
  if (sameView.length > 0) return sameView[0].output;

  const sameScenario = SOS_EXAMPLES.filter(
    (e) => e.input.scenario === input.scenario,
  );
  if (sameScenario.length > 0) return sameScenario[0].output;

  return SOS_EXAMPLES[
    Math.floor(Math.random() * SOS_EXAMPLES.length)
  ].output;
}
