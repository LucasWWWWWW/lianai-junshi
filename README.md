# 恋爱军师 (Lian'ai Junshi)

基于男女思维差异理论的恋爱实战指导 Web 工具。MVP 聚焦「实时话术军师」：贴聊天 → AI 解读对方情绪/潜台词 → 输出 3 套话术 + 雷区提醒。

## 技术栈

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- DeepSeek API (主) / OpenAI (兜底)
- Netlify (部署) + Netlify Blobs (限频)

## 本地开发

```powershell
pnpm install
Copy-Item .env.example .env.local
# 填 DEEPSEEK_API_KEY 后启动
pnpm dev
```

访问 http://localhost:3000。

## 部署

push 到 `main` → Netlify 自动构建发布。预览部署：PR 打开即生成。

## 路线图

- **v0.1** 实时话术军师（MVP）
- **v0.2** 截图 OCR + 历史归档
- **v0.3** 矛盾急救室
- **v1.0** 潜台词词典、关系雷达、AI 形象（照片重绘版）
