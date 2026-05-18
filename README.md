# 恋爱军师 (Lian'ai Junshi)

> 懂男女思维差异，不做恋爱糊涂人。

基于男女思维差异理论的 AI 恋爱实战指导 Web 工具。MVP 聚焦「实时话术军师」：贴对方刚发来的微信 → AI 解读情绪/潜台词 → 输出 3 套风格不同的回复 + 雷区警示。

🌐 **Live (待部署)**：<https://lianai-junshi.netlify.app>
📦 **GitHub**：<https://github.com/LucasWWWWWW/lianai-junshi>

---

## 技术栈

- **前端**：Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4
- **后端**：Next.js Route Handlers (Node runtime)
- **LLM**：DeepSeek API (主，便宜+境内合规) / OpenAI (备)
- **限频**：Netlify Blobs（生产）+ 内存 fallback（开发）
- **部署**：Netlify (Git-driven auto deploy)
- **PWA**：动态生成 manifest + 图标

## 本地开发

```powershell
cd C:\lianai-junshi
pnpm install
Copy-Item .env.example .env.local
# 在 .env.local 填入 DEEPSEEK_API_KEY（platform.deepseek.com 申请）
pnpm dev
```

访问 <http://localhost:3000>。

## 部署

见 [DEPLOY.md](./DEPLOY.md)。Netlify site 已创建，仅需用户在 dashboard 操作两步：

1. 在 Netlify 后台 link GitHub repo (启动自动部署)
2. 设置 `DEEPSEEK_API_KEY` 环境变量

## 项目结构

```
src/
├── app/
│   ├── layout.tsx          # 根布局 + PWA metadata + viewport
│   ├── page.tsx            # 首页 / 落地
│   ├── coach/
│   │   ├── page.tsx        # 话术军师页（server）
│   │   └── CoachForm.tsx   # 表单 + 结果渲染（client）
│   ├── about/page.tsx      # 关于 + 隐私 + 免责
│   ├── api/coach/route.ts  # POST /api/coach (LLM + rate limit)
│   ├── manifest.ts         # PWA manifest
│   ├── icon.tsx            # 192px 动态生成
│   ├── apple-icon.tsx      # 180px 动态生成
│   └── globals.css         # Tailwind + 中文字体 + form utility
└── lib/
    ├── llm.ts              # DeepSeek 客户端 (JSON mode)
    ├── prompts.ts          # 系统提示词 + 用户提示词 builder
    ├── rate-limit.ts       # Netlify Blobs 限频 + fallback
    └── types.ts            # CoachInput / CoachResult / 等

docs/
├── test-cases.md           # 3 个端到端测试 case
└── share-assets.md         # 朋友圈/小红书冷启动文案
```

## 隐私

- 不存储聊天原文（仅作单次 LLM 调用）
- 不要求登录
- IP 哈希计数（仅用于限频，无身份关联）

## 路线图

| 版本 | 内容 | 状态 |
| --- | --- | --- |
| v0.1 | 实时话术军师 | ✅ |
| v0.2 | 微信扫码登录 + 订阅付费 + 历史归档 | 计划 |
| v0.3 | 截图 OCR (粘贴聊天截图直接识别) | 计划 |
| v0.4 | 矛盾急救室（吵架场景专项） | 计划 |
| v0.5 | 潜台词词典 + SEO 长尾内容 | 计划 |
| v1.0 | 关系雷达测评 + AI 形象（照片重绘版） | 远期 |

详细产品思路见对话原文。

## 免责声明

本工具输出由 AI 生成，仅供恋爱沟通参考，不替代真实情感判断与责任承担。重要决策（分手、复合、婚姻、消费等）请结合自身处境独立判断。
