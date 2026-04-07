<div align="center">

# MeetScribe

**Turn meetings into transcripts and notes — in your browser, with your own API keys.**

[![Download MeetScribe (dist zip)](https://img.shields.io/badge/Download-dist%20zip-aa3bff?style=for-the-badge&logo=github)](https://github.com/anne-creator/meetscribe/releases/latest/download/meetscribe-dist.zip)
[![Welcome page — EN/中文 + tutorial](https://img.shields.io/badge/Welcome-EN%20%7C%20中文-6366f1?style=for-the-badge)](https://anne-creator.github.io/meetscribe/)

</div>

---

### Start here (no code required)

1. **Download** the zip above (or open the **Welcome** page for the same button, bilingual tutorial, and pricing notes).
2. **Unzip** and **double-click `index.html`** to open the app.
3. Open **Settings**, paste an **OpenAI** or **Google Gemini** API key, save — about **one minute**.

The zip file **`meetscribe-dist.zip`** is attached to each [GitHub Release](https://github.com/anne-creator/meetscribe/releases/latest) when a release is published (automated build). If the download returns 404, create a new release or run `npm run build` and `npm run zip:dist` locally and zip the `dist` folder yourself.

**GitHub Pages:** enable **Settings → Pages → Build and deployment → GitHub Actions** so the Welcome site works at `https://anne-creator.github.io/meetscribe/`.

---

### 中文简要说明

1. 点击上方紫色 **Download dist zip** 按钮下载压缩包（与 [Releases](https://github.com/anne-creator/meetscribe/releases/latest) 中的 `meetscribe-dist.zip` 相同）。  
2. 解压后 **双击 `index.html`** 用浏览器打开。  
3. 在 **设置** 里填入 **OpenAI** 或 **Gemini** 的 API 密钥并保存，约 **一分钟** 即可使用。  

**完整中英对照、一键下载按钮与费用说明**请打开 [Welcome 页面](https://anne-creator.github.io/meetscribe/)（右上角可切换 **English / 中文**，默认跟随浏览器语言）。

---

### License

**PolyForm Noncommercial 1.0.0** — source is open; **commercial use is not allowed**. See [`LICENSE`](./LICENSE).

---

### For developers

```bash
npm install
npm run dev          # development
npm run build        # production build → dist/
npm run zip:dist     # dist → meetscribe-dist.zip (for manual upload)
```

Repository: [github.com/anne-creator/meetscribe](https://github.com/anne-creator/meetscribe)
