<div align="center">

# MeetScribe

**把会议变成转写与笔记 — 在浏览器里运行，使用你自己的 API 密钥。**

[![下载 MeetScribe（压缩包）](https://img.shields.io/badge/下载-dist%20zip-aa3bff?style=for-the-badge&logo=github)](https://github.com/anne-creator/meetscribe/releases/latest/download/dist.zip)

[English version → README.md](./README.md)

</div>

---

### 上手（无需写代码）

1. 点击上方按钮下载 **`dist.zip`**（与 [Releases](https://github.com/anne-creator/meetscribe/releases/latest) 中的资源相同）。
2. **解压**后打开 **`index.html`** — 即完整应用（单文件构建）。可双击文件，建议用 **Chrome** 或 **Edge** 打开。
3. 打开 **设置**（或钥匙图标），粘贴 **OpenAI** 或 **Google Gemini** 的 API 密钥，选择服务商并保存。密钥仅保存在本机浏览器 — 大约 **一分钟**。
4. 导入视频或开始录制。转写与对话由各家平台按你的密钥计费。

若下载出现 **404**，可能是该 Release 尚未附带 `dist.zip`。可新发一个 Release（[工作流](.github/workflows/release-dist-zip.yml) 会自动上传），或在本地执行 `npm run build` 与 `npm run zip:dist` 后手动把 `dist.zip` 上传到 Release。

---

### API 费用参考

以下为大致区间，厂商会调价，预算前请以官网为准。

| 项目 | 大致价格 |
|------|----------|
| OpenAI 语音转文字（如 `whisper-1`） | 约每分钟音频 US$0.006（按分钟计费） |
| Gemini 转写（默认：Gemini 2.5 Flash） | 按 token（音频+文本）。短片段经验上常与按分钟 API **同量级或更低**；随时长与输出变化。 |
| OpenAI 对话（默认：`gpt-4o-mini`） | 约 US$0.15 / 百万输入 token、US$0.60 / 百万输出 — 日常短对话通常 **极低**。 |
| OpenAI 对话（`gpt-4o`） | 高于 mini — 输入约数 $/百万 token，输出约 US$10+/百万（见 OpenAI 定价页）。 |
| Gemini 对话（如 Gemini 2.5 Pro） | 按上下文分档；常见约 **US$1.25–2.50 / 百万输入**、**US$10–15 / 百万输出**（以 Google AI 定价为准）。 |

官网：[OpenAI 定价](https://openai.com/api/pricing/) · [Gemini API 定价](https://ai.google.dev/gemini-api/docs/pricing)

---

### 许可协议

**PolyForm Noncommercial 1.0.0** — 开源；**禁止商业使用**。完整条款见 [`LICENSE`](./LICENSE)。

---

### 开发者

```bash
npm install
npm run dev          # 开发
npm run build        # 构建产物 → dist/
npm run zip:dist     # 打包为根目录 dist.zip（便于手动上传 Release）
```

仓库：[github.com/anne-creator/meetscribe](https://github.com/anne-creator/meetscribe)
