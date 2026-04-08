
<div align="center">
  
###### [English](README.md)  |  [中文版](README_chinese.md) 

# 🎙️ MeetScribe
**Turn any meeting into searchable transcripts and smart notes.**<br>

One HTML file. No pay, No install. No sign-up. Runs by double click.

**actively maintianing... consider giving it a ⭐ before downloading, thanks!!!**

[![GitHub stars](https://img.shields.io/github/stars/anne-creator/meetscribe?style=social)](https://github.com/anne-creator/meetscribe)
[![License: PolyForm Noncommercial](https://img.shields.io/badge/license-PolyForm%20NC%201.0-blue)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

<img src="docs/demo.gif" alt="MeetScribe demo" width="720">

</div>

---

## Why MeetScribe?

Need a tool that take the recording of a mixed lanuage meeting, but cost nothing and also can export transcribe and talk with AI? MeetScribe can do them all.

You download one file, open it in Chrome, and everything happens on your computer. Your recordings, transcripts, and conversations never leave your browser. You bring your own API key from Google or OpenAI, so there's no middleman and no recurring fee.

### What makes it different

🔒 **Private by design** — Your video, audio, and transcripts stay on your machine.

🗣️ **Knows who's talking** — Automatically labels each person in the conversation (Speaker 1, Speaker 2, etc.) with timestamps.

🌏 **Speaks your language mix** — Built for real-world meetings with mixed-language support. Auto-detects language without configuration.

💬 **Ask your meeting questions** — Built-in chat lets you summarize and ask questions about the transcript.

🔍 **Transcript search** — Search by keyword to find specific moments without re-watching.

🔗 **Interactive transcript** — Click any line to jump to that moment in the video. Current segment highlights as the video plays.

📦 **Multi-format export** — Export transcripts as Markdown, SRT subtitles, or JSON. Download the video and chat history too.

🤖 **AI chat** — Ask questions about the meeting. Get summaries, action items, or specific speaker quotes.

📂 **One file, zero install** — The entire app is a single HTML file. Double-click to open in any browser.

💸 **Free to use** — MeetScribe itself replaced your $25 subscription meeting recorder. You only pay your API provider for what you use. Gemini's free tier covers most personal use. 
---

## Get started in 3 minutes

### Step 1: Download and Open MeetScribe File

[![Download MeetScribe (dist zip)](https://img.shields.io/badge/Download-dist%20zip-aa3bff?style=for-the-badge&logo=github)](https://github.com/anne-creator/meetscribe/releases/latest/download/dist.zip) 

Unzip and double clikc the file index.html

### Step 2: Get an API key (pick one)

You need an API key from **one** of these providers. Both have free tiers.

<details>
<summary><strong>Option A: Google Gemini (recommended)</strong></summary>

Gemini is recommended because its free tier is generous and it handles speaker identification and mixed languages natively.

1. Go to [Google AI Studio](https://aistudio.google.com)
2. Sign in with your Google account
3. Click **"Get API Key"** in the left sidebar
4. Click **"Create API key"**, then select a Google Cloud project (or create one — it's free)
5. Copy the key (starts with `AIza...`)

Free tier: 1,000 requests/day with Gemini Flash models. More than enough for personal use.

</details>

<details>
<summary><strong>Option B: OpenAI</strong></summary>

1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign in or create an OpenAI account
3. Click **"Create new secret key"**, give it a name, and click **"Create"**
4. Copy the key (starts with `sk-...`). You won't be able to see it again.
5. You need to add credit to your account (minimum $5) at [Billing](https://platform.openai.com/account/billing)

Pricing: ~$0.006/min for transcription (Whisper). A 1-hour meeting costs roughly $0.36.

</details>

### Step 3: Open and go

1. Double-click `index.html` — it opens in your browser
<img width="189" height="108" alt="Screenshot 2026-04-07 at 9 19 37 PM" src="https://github.com/user-attachments/assets/2f4f83fb-4c63-44e2-a715-b76dab4ef164" />


2. Click the **Settings** icon at right top, paste your API key, choose your provider, and save
API key is saved in your browser's local storage. You won't need to enter it again unless you clear your browser data.

---

## How much does it cost?

MeetScribe is free. You pay your API provider directly for usage. Here's a rough guide:

| What | Rough cost | Notes |
|---|---|---|
| Gemini Flash transcription | Often **free** | Free tier covers ~1,000 requests/day |
| Gemini chat analysis | Often **free** | Same free tier |
| OpenAI Whisper transcription | ~$0.36/hour | $0.006 per minute of audio |
| OpenAI chat (gpt-4o-mini) | ~$0.01/session | Casual Q&A is tiny |

Official pricing: [Google Gemini](https://ai.google.dev/gemini-api/docs/pricing) · [OpenAI](https://openai.com/pricing)

---

## Who is this for?

**Students and researchers** — Record lectures, study groups, or interviews. Search and quote from transcripts later.

**Remote workers** — Never take meeting notes again. Let MeetScribe do it while you focus on the conversation.

**Freelancers and consultants** — Keep records of client calls without paying for Otter, Fireflies, or tl;dv.

**Privacy-conscious teams** — Your recordings stay on your device. Nothing is uploaded anywhere.

**Developers** — Fork it, extend it, build on it. The codebase is clean and contributions are welcome.

**Tech stack:** Single-file HTML build, Gemini/OpenAI API (client-side), `getDisplayMedia` for screen capture, `getUserMedia` for microphone, Web Audio API for stream mixing.

---

## License

[PolyForm Noncommercial 1.0.0](LICENSE) — Source is open. Commercial use is not allowed.

---

<div align="center">

[Download](https://github.com/anne-creator/meetscribe/releases) · [Report a bug](https://github.com/anne-creator/meetscribe/issues) · [中文版](README_chinese.md)

</div>
