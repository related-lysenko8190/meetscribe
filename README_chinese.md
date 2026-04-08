<div align="center">
  
###### [English](README.md)  |  [中文版](README_chinese.md) 

# <img src="public/favicon.svg" alt="MeetScribe logo" width="30"> MeetScribe
[![GitHub stars](https://img.shields.io/github/stars/anne-creator/meetscribe?style=social)](https://github.com/anne-creator/meetscribe)
[![License: PolyForm Noncommercial](https://img.shields.io/badge/license-PolyForm%20NC%201.0-blue)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

<img src="docs/demo.gif" alt="MeetScribe 演示" width="720">

</div>

---

## 为什么选择 MeetScribe？
我的会议经常在英语和普通话之间切换。我试过的每一款会议工具，要么处理得很糟糕，要么价格昂贵，要么两者兼而有之。

Otter.ai 的时间戳做得不错，但遇到混合语言就崩了。Notion AI 能处理混合语言，但不保留录音。Granola 两样都做不好。所以我自己动手做了 MeetScribe。

一个 HTML 文件。不花钱，不安装，不注册。双击即可运行。

⭐ 如果对你有帮助，欢迎点星支持 ❤️❤️❤️

<img width="858" height="193" alt="Screenshot 2026-04-07 at 9 42 46 PM" src="https://github.com/user-attachments/assets/a20879af-4591-48d1-864e-04766bff6bb2" />

### 有什么不同

🔒 **隐私优先** - 你的视频、音频和转录内容全部保存在本地，不上传任何服务器。

🗣️ **自动识别发言人** - 自动标记每位发言人（发言人 1、发言人 2 等），并附带时间戳。

🌏 **支持混合语言** - 专为中英混用的真实会议场景设计，自动检测语言，无需任何配置。

💬 **和会议记录对话** - 内置聊天功能，可对转录内容进行总结或提问。

🔍 **转录内容搜索** - 按关键词搜索，快速定位会议中的特定时刻，无需重新观看。

🔗 **交互式转录** - 点击任意一行跳转到视频对应时刻，当前片段随视频播放高亮显示。

📦 **多格式导出** - 支持导出 Markdown、SRT 字幕或 JSON 格式，也可下载视频和聊天记录。

📂 **单文件，零安装** - 整个应用就是一个 HTML 文件，在任意浏览器中双击即可打开。

💸 **免费使用** - MeetScribe 本身可以替代每月 $25 的订阅制会议录制工具。你只需为实际使用的 API 付费，Gemini 免费额度已足够个人日常使用。

---

## 3 分钟快速上手

### 第一步：下载并打开 MeetScribe

[![下载 MeetScribe (dist zip)](https://img.shields.io/badge/下载-dist%20zip-aa3bff?style=for-the-badge&logo=github)](https://github.com/anne-creator/meetscribe/releases/latest/download/dist.zip) 

解压后双击 index.html 文件即可。

### 第二步：获取 API 密钥（二选一）

你需要从以下**其中一个**服务商获取 API 密钥，两者均有免费额度。

<details>
<summary><strong>选项 A：Google Gemini（推荐）</strong></summary>

推荐使用 Gemini，因为其免费额度充足，且原生支持发言人识别和混合语言处理。

1. 前往 [Google AI Studio](https://aistudio.google.com)
2. 用 Google 账号登录
3. 点击左侧栏的 **"Get API Key"**
4. 点击 **"Create API key"**，选择一个 Google Cloud 项目（或新建一个，免费）
5. 复制密钥（以 `AIza...` 开头）

免费额度：Gemini Flash 模型每天 1,000 次请求，个人使用绰绰有余。

</details>

<details>
<summary><strong>选项 B：OpenAI</strong></summary>

1. 前往 [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. 登录或注册 OpenAI 账号
3. 点击 **"Create new secret key"**，命名后点击 **"Create"**
4. 复制密钥（以 `sk-...` 开头），该密钥只显示一次
5. 需要在 [Billing](https://platform.openai.com/account/billing) 充值（最低 $5）

定价：转录约 $0.006/分钟（Whisper），一小时会议约 $0.36。

</details>

### 第三步：打开并开始使用

1. 双击 `index.html`，在浏览器中打开
<img width="189" height="108" alt="Screenshot 2026-04-07 at 9 19 37 PM" src="https://github.com/user-attachments/assets/2f4f83fb-4c63-44e2-a715-b76dab4ef164" />

2. 点击右上角的**设置**图标，粘贴 API 密钥，选择服务商后保存。
API 密钥保存在浏览器本地存储中，除非清除浏览器数据，否则无需重复输入。

---

## 费用说明

MeetScribe 本身免费。你直接向 API 服务商按量付费，以下是大致参考：

| 用途 | 大致费用 | 备注 |
|---|---|---|
| Gemini Flash 转录 | 通常**免费** | 免费额度约 1,000 次/天 |
| Gemini 聊天分析 | 通常**免费** | 同一免费额度 |
| OpenAI Whisper 转录 | 约 $0.36/小时 | $0.006/分钟音频 |
| OpenAI 聊天（gpt-4o-mini） | 约 $0.01/次 | 日常问答用量极小 |

官方定价：[Google Gemini](https://ai.google.dev/gemini-api/docs/pricing) · [OpenAI](https://openai.com/pricing)

---

## 适合哪些人使用？

**学生和研究人员** - 录制讲座、学习小组或访谈，之后搜索并引用转录内容。

**远程办公人员** - 再也不用手动记会议笔记，专注于对话本身，让 MeetScribe 代劳。

**自由职业者和顾问** - 保留客户通话记录，无需订阅 Otter、Fireflies 或 tl;dv。

**注重隐私的团队** - 录音保存在本地设备，不上传任何地方。

**开发者** - 欢迎 Fork、扩展和二次开发，代码结构清晰，欢迎贡献 PR。

**技术栈：** 单文件 HTML 构建，Gemini/OpenAI API（纯客户端），`getDisplayMedia` 屏幕录制，`getUserMedia` 麦克风录音，Web Audio API 混流。

---

## 开源协议

[PolyForm Noncommercial 1.0.0](LICENSE) - 源码开放，禁止商业使用。

---

<div align="center">

[下载](https://github.com/anne-creator/meetscribe/releases) · [反馈问题](https://github.com/anne-creator/meetscribe/issues) · [English](README.md)

</div>
