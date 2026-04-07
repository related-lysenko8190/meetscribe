<div align="center">

# MeetScribe

**Turn meetings into transcripts and notes — in your browser, with your own API keys.**

[![Download MeetScribe (dist zip)](https://img.shields.io/badge/Download-dist%20zip-aa3bff?style=for-the-badge&logo=github)](https://github.com/anne-creator/meetscribe/releases/latest/download/dist.zip)

[中文版说明 → README_chinese.md](./README_chinese.md)

</div>

---

### Start here (no code required)

1. **Download** the zip [![Download MeetScribe (dist zip)](https://img.shields.io/badge/Download-dist%20zip-aa3bff?style=for-the-badge&logo=github)](https://github.com/anne-creator/meetscribe/releases/latest/download/dist.zip)using the button above (same file as [Releases](https://github.com/anne-creator/meetscribe/releases/latest) → `dist.zip`).
2. **Unzip** the folder. Open **`index.html`** — that is the full app (single-file build). Double-click it, or open it with Chrome or Edge.
3. Click **Settings** (or the key icon), paste your **OpenAI** or **Google Gemini** API key, choose the provider, and save. Keys stay in your browser only — about **one minute**.
4. Load a video or start recording. Transcription and chat are billed by the provider using your key.

If the download returns **404**, the release may not include `dist.zip` yet. Create a new release (the [workflow](.github/workflows/release-dist-zip.yml) attaches it automatically), or run `npm run build` and `npm run zip:dist` locally and upload `dist.zip` to the release yourself.

---

### API cost (reference only)

Indicative prices — providers change rates. Check official pages before you budget.

| Item | Ballpark |
|------|----------|
| OpenAI speech-to-text (e.g. `whisper-1`) | ~US$0.006 per minute of audio (billed per minute) |
| Gemini transcription (default: Gemini 2.5 Flash) | Token-based (audio + text). For typical short clips, often **similar to or lower than** per-minute APIs; varies with length and output. |
| OpenAI chat (default: `gpt-4o-mini`) | ~US$0.15 / 1M input tokens, ~US$0.60 / 1M output — casual Q&A is usually **very small** per session. |
| OpenAI chat (`gpt-4o`) | Higher than mini — on the order of a few $/1M input and ~US$10+/1M output (see OpenAI pricing). |
| Gemini chat (e.g. Gemini 2.5 Pro) | Tiered by context; often **~US$1.25–2.50 / 1M input** and **~US$10–15 / 1M output** (verify on Google AI pricing). |

Official: [OpenAI pricing](https://openai.com/api/pricing/) · [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing)

---

### License

**PolyForm Noncommercial 1.0.0** — source is open; **commercial use is not allowed**. See [`LICENSE`](./LICENSE).

---

### For developers

```bash
npm install
npm run dev          # development
npm run build        # production build → dist/
npm run zip:dist     # dist → dist.zip (for manual upload)
```

Repository: [github.com/anne-creator/meetscribe](https://github.com/anne-creator/meetscribe)
