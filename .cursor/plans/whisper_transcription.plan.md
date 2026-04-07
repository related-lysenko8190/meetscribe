---
name: OpenAI stack Whisper + Chat
overview: User picks AI stack — Gemini (one Google key, transcribe + chat as today) or OpenAI (one OpenAI key, Whisper transcription + OpenAI chat model streaming). Single API key field in UI per stack. Volcengine not in this doc.
todos:
  - id: types-settings
    content: "types.ts: add ServiceStack, rename model→geminiModel, add openaiApiKey/openaiChatModel/whisperModel; SettingsState/Actions expanded. settings-provider: new LS keys + migration of legacy meetscribe_api_key → geminiApiKey and meetscribe_model → geminiModel."
    status: pending
  - id: openai-whisper
    content: "New src/core/openai-whisper-client.ts: FormData + verbose_json; chunk max ~600s; map segments to GeminiTranscriptionResult shape."
    status: pending
  - id: openai-chat
    content: "New src/core/openai-chat-client.ts: POST /v1/chat/completions stream:true; hand-roll SSE parser (ReadableStream + TextDecoder); yield delta.content tokens; same system prompt as Gemini chat."
    status: pending
  - id: chat-engine-branch
    content: "chat-engine.ts: chatWithTranscript takes ChatConfig object; routes to Gemini streamChat or OpenAI streamOpenAIChat. chat-provider.tsx: check activeApiKey (gemini or openai) before sending; pass correct model/key."
    status: pending
  - id: transcription-branch
    content: "transcription-engine.ts: runTranscription takes config object (stack, keys, models); Whisper branch uses smaller chunk + transcribeAudioWhisper; diarize step relabeled. transcription-provider.tsx: validate key for active stack."
    status: pending
  - id: settings-ui
    content: "settings-dialog.tsx: stack radio/segmented control; single key field bound to active stack; Gemini → geminiModel dropdown; OpenAI → openaiChatModel dropdown (whisper model fixed whisper-1, show as text not dropdown). App.tsx + header-bar.tsx: pass active key for preview."
    status: pending
  - id: migrate-ls
    content: "On load: meetscribe_api_key → geminiApiKey, meetscribe_model → geminiModel if new keys empty; default stack gemini."
    status: pending
  - id: cors-qa
    content: Test api.openai.com from deployed HTTPS origin; document proxy if CORS blocks browser fetch.
    status: pending
isProject: true
---

# OpenAI stack: Whisper + OpenAI chat (one API key)

## Product intent

- **One API key per stack** (not two keys visible simultaneously):
  - **Gemini stack** (default): one **Google** key → transcription ([`gemini-client.ts`](src/core/gemini-client.ts)) + chat ([`streamChat`](src/core/gemini-client.ts)) using **`geminiModel`**.
  - **OpenAI stack**: one **OpenAI** key → transcription (**Whisper** `whisper-1`) + chat (**OpenAI chat model** via `/v1/chat/completions` streaming).

Internally both `geminiApiKey` and `openaiApiKey` are persisted in `localStorage` so switching stacks does not force re-entry.

## Settings model

- `serviceStack`: `'gemini' | 'openai'` (default `'gemini'`)
- `geminiApiKey`: Google key (renamed from current `apiKey`)
- `geminiModel`: Gemini model id (renamed from current `model`)
- `openaiApiKey`: OpenAI key
- `openaiChatModel`: e.g. `gpt-4o-mini` (default), `gpt-4o`
- `whisperModel`: fixed `'whisper-1'` (only one model exists; show as read-only text, not a dropdown)

### localStorage migration

On first load of updated app, in [`settings-provider.tsx`](src/providers/settings-provider.tsx):

- If `meetscribe_api_key` exists and `meetscribe_gemini_api_key` is empty → copy value to `meetscribe_gemini_api_key`.
- If `meetscribe_model` exists and `meetscribe_gemini_model` is empty → copy value to `meetscribe_gemini_model`.
- If `meetscribe_service_stack` is missing → write `'gemini'`.
- Keep old keys in storage (no delete) so a rollback scenario is safe.

## Files to touch (8 existing + 2 new)

- [`src/lib/types.ts`](src/lib/types.ts) — `ServiceStack` type; `OPENAI_CHAT_MODELS` const; rename + expand `SettingsState` / `SettingsActions`
- [`src/providers/settings-provider.tsx`](src/providers/settings-provider.tsx) — new LS keys, migration, new state + actions
- [`src/components/compound/settings-dialog.tsx`](src/components/compound/settings-dialog.tsx) — stack selector, conditional key/model fields
- [`src/App.tsx`](src/App.tsx) — wire new settings props to dialog + header
- [`src/components/blocks/header-bar.tsx`](src/components/blocks/header-bar.tsx) — show active key preview
- [`src/providers/transcription-provider.tsx`](src/providers/transcription-provider.tsx) — validate key per stack; pass config to engine
- [`src/core/transcription-engine.ts`](src/core/transcription-engine.ts) — accept config object; branch Gemini vs Whisper
- [`src/core/chat-engine.ts`](src/core/chat-engine.ts) — route to Gemini or OpenAI stream
- [`src/providers/chat-provider.tsx`](src/providers/chat-provider.tsx) — check `activeApiKey` per stack; pass correct model
- **New** [`src/core/openai-whisper-client.ts`](src/core/openai-whisper-client.ts)
- **New** [`src/core/openai-chat-client.ts`](src/core/openai-chat-client.ts)

## Transcription

- **Gemini:** unchanged pipeline (extract → chunk 1200s → `transcribeAudio` → dedupe → finalize).
- **Whisper:** extract → chunk **600s** (stay under ~25 MB WAV limit) → `transcribeAudioWhisper` per chunk → merge (no cross-chunk diarization, just time-offset concat + simple dedupe) → finalize. Diarize step label changed to **"Merging transcript"**. All segments get `speaker: 'Speaker 1'`, `speakerIndex: 0`.

## Chat

- **New** `src/core/openai-chat-client.ts`:
  - `streamOpenAIChat(apiKey, model, systemPrompt, userMessage)` → `AsyncGenerator<string>`
  - Uses `fetch` to `POST https://api.openai.com/v1/chat/completions` with `stream: true`.
  - **SSE parsing:** read `response.body` as `ReadableStream`, split on `\n\n`, parse lines starting with `data: `; extract `choices[0].delta.content`; stop on `data: [DONE]`.
  - Same system prompt framing as Gemini: `"You are analyzing a meeting transcript..."` + [`formatTranscriptForChat`](src/core/chat-engine.ts).

- **Updated** [`src/core/chat-engine.ts`](src/core/chat-engine.ts):

```typescript
interface ChatConfig {
  stack: ServiceStack
  geminiApiKey: string
  geminiModel: string
  openaiApiKey: string
  openaiChatModel: string
}

export async function* chatWithTranscript(
  config: ChatConfig,
  segments: TranscriptSegment[],
  question: string
): AsyncGenerator<string> {
  const context = formatTranscriptForChat(segments)
  if (config.stack === 'openai') {
    yield* streamOpenAIChat(config.openaiApiKey, config.openaiChatModel, ..., question)
  } else {
    yield* streamChat(config.geminiApiKey, config.geminiModel, context, question)
  }
}
```

- **Updated** [`src/providers/chat-provider.tsx`](src/providers/chat-provider.tsx):
  - Key guard: `stack === 'openai' ? !openaiApiKey : !geminiApiKey` → early return.
  - Build `ChatConfig` from `useSettings()` state and pass to `chatWithTranscript`.

## Settings UI

- **Stack selector** (radio or segmented): "Google Gemini" / "OpenAI"
- **Key field:** label + placeholder change with stack ("Gemini API Key" / "OpenAI API Key"); `type="password"`.
- **Gemini selected:** show `geminiModel` dropdown (`AVAILABLE_MODELS`).
- **OpenAI selected:** show `openaiChatModel` dropdown (`OPENAI_CHAT_MODELS`); show fixed text "Transcription model: Whisper" (no dropdown for one option); brief note: "Speaker diarization is not available with Whisper."

## Header

- Show `truncateApiKey(stack === 'openai' ? openaiApiKey : geminiApiKey)`.

## Error handling

- Transcription with wrong/missing key → existing error display in [`processing-panel`](src/components/blocks/processing-panel.tsx).
- Chat with missing key for active stack → skip send (current behavior with `if (!activeKey) return`).
- OpenAI CORS failure → throw with message: "Network error calling OpenAI. Ensure the app is served over HTTPS, or use a backend proxy."

## Acceptance

- Default **Gemini** stack: behavior identical to current app (key migrated transparently).
- **OpenAI** stack: one key → Whisper transcript + OpenAI streamed chat; no Gemini key needed.
- Switching stack preserves both keys in storage; no re-entry on switch-back.

## Out of scope

- [Volcengine ASR](volcengine_asr_later_fbe80bdd.plan.md).
- OpenAI GPT-4o-audio multimodal transcription (different endpoint; future option).
