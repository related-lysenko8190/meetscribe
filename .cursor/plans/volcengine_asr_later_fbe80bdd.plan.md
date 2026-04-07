---
name: Volcengine ASR later
overview: Defer Doubao speech (Volcengine bigmodel file ASR) until the app is served over HTTPS with a fetchable audio URL or a small backend. Add a provider branch later so Gemini remains default.
todos:
  - id: hosting-prereq
    content: "Decide audio URL strategy: signed upload, object storage, or backend proxy (CORS-tested)."
    status: pending
  - id: types-settings
    content: Add transcribeProvider volcengine + Volc credentials; default gemini.
    status: pending
  - id: volc-client
    content: "Implement volc-asr-client: submit, poll, map utterances to TranscriptSegment."
    status: pending
  - id: engine-branch
    content: "Branch transcription-engine: volc path upload/URL → submit/poll."
    status: pending
  - id: wire-provider
    content: Update transcription-provider + settings-dialog; user-facing errors.
    status: pending
  - id: qa
    content: E2E on HTTPS; Gemini regression + Volc happy path.
    status: pending
isProject: true
---

# Volcengine Doubao ASR (post-hosting) — integration plan

## Goal

Add an optional **transcription provider**: keep **Gemini** as default, and allow **Volcengine 豆包语音 — 大模型录音文件识别（标准版）** when the user selects it. Document: [大模型录音文件识别标准版 API](https://www.volcengine.com/docs/6561/1354868?lang=zh).

**Whisper work is tracked separately:** [whisper_transcription.plan.md](whisper_transcription.plan.md).

## Why hosting (or upload) matters first

The Volcengine submit API expects **`audio.url`** — a URL their servers can **HTTP fetch**. A user’s local **Blob** in the browser is not sufficient by itself.

- **Option A:** Upload audio to your storage → public or signed URL → `submit`
- **Option B:** Backend proxy: browser → your API → Volcengine (hides key, fixes CORS)

## Non-breaking shape

- **Default:** `transcribeProvider = 'gemini'`; existing Gemini key + model.
- **Optional Volcengine:** `X-Api-Key`, `X-Api-Resource-Id` (e.g. `volc.seedasr.auc`), etc.

## Implementation sketch

1. **Types** — extend provider enum with `volcengine`; Volc credentials in settings.
2. **New** `src/core/volc-asr-client.ts` — submit + poll; map `result.utterances` (ms → seconds); `enable_speaker_info` optional.
3. **Transcription** — Volc branch after `extractAudio`: obtain URL → submit → poll → normalize.
4. **Settings UI** — Volc fields when selected.
5. **Hardening** — CORS test to `openspeech.bytedance.com`; error code mapping.

## Acceptance

- Default Gemini unchanged.
- Volc + valid URL + credentials → same `TranscriptSegment` UX.

```mermaid
flowchart LR
  subgraph today [Today_Gemini]
    Blob1[Video_Blob] --> Extract1[extractAudio]
    Extract1 --> Chunk1[chunkAudio]
    Chunk1 --> Gemini[gemini_client]
  end
  subgraph later [Later_Volcengine]
    Blob2[Video_Blob] --> Extract2[extractAudio]
    Extract2 --> Upload[upload_or_proxy_for_url]
    Upload --> Submit[volc_submit]
    Submit --> Poll[volc_query]
    Poll --> Map[map_to_TranscriptSegment]
  end
```

## Out of scope here

- OpenAI Whisper — see [whisper_transcription.plan.md](whisper_transcription.plan.md).
