# 部署指南

Netlify site 已创建并 link 本地仓库。剩余两步用户操作（每步 1 分钟内完成）：

## 1. 绑定 GitHub repo 启用自动部署

打开：<https://app.netlify.com/projects/lianai-junshi/configuration/deploys>

- 点击 **"Link repository"** 或 **"Connect to Git provider"**
- 授权 Netlify 访问 GitHub（首次会跳到 GitHub 授权）
- 选择 `LucasWWWWWW/lianai-junshi` 仓库
- Branch: `main`
- Build command: `pnpm build`（应自动识别 netlify.toml）
- Publish directory: `.next`
- Save → 立即触发首次 build & deploy（约 2-3 分钟）

成功后 production URL：<https://lianai-junshi.netlify.app>

## 2. 配置 DeepSeek API key

打开：<https://app.netlify.com/projects/lianai-junshi/configuration/env>

添加环境变量：

| Key | Value |
| --- | --- |
| `DEEPSEEK_API_KEY` | sk-xxxxxx (在 https://platform.deepseek.com 申请) |
| `FREE_QUOTA_PER_DAY` | `5` (可选，默认 5) |

保存后点 **"Trigger deploy → Deploy site"** 重新部署，让 env 变量生效。

## 3. 验证

- 打开 <https://lianai-junshi.netlify.app> → 首页应加载
- 点 "立即试用" → 跳转到 `/coach`
- 贴一条测试消息，提交 → 应返回 AI 解读 + 3 套话术 + 雷区
- 连续点 6 次 → 第 6 次应返回 429 "今日免费额度已用完"

## 后续：每次 push 自动 deploy

push 到 `main` 分支即触发生产 deploy；开 PR 自动生成预览部署 URL。

## 本地开发

```powershell
cd C:\lianai-junshi
Copy-Item .env.example .env.local
# 编辑 .env.local 填入 DEEPSEEK_API_KEY
pnpm dev
# 访问 http://localhost:3000
```

## 故障排查

- **Build 失败 "ERR_PNPM_IGNORED_BUILDS"**：检查 pnpm-workspace.yaml 的 `allowBuilds` 是 true（已默认设置）
- **API 返回 500 "API_KEY not configured"**：Netlify env 没设 `DEEPSEEK_API_KEY`，重新部署
- **API 返回 429**：超出每日免费额度 5 次/IP，明日 0 点重置（或调整 `FREE_QUOTA_PER_DAY`）
- **Netlify CLI deploy 报 Forbidden**：CLI 直传被 Free tier 限制，走 Git push 即可
