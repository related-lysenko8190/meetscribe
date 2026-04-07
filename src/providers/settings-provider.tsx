import { createContext, use, useState, useMemo, type ReactNode } from 'react'
import type { SettingsState, SettingsActions, ServiceStack } from '@/lib/types'
import {
  DEFAULT_GEMINI_MODEL,
  DEFAULT_OPENAI_CHAT_MODEL,
  DEFAULT_WHISPER_MODEL,
  DEFAULT_SERVICE_STACK,
  DEPRECATED_GEMINI_MODEL_IDS,
} from '@/lib/types'

interface SettingsContextValue {
  state: SettingsState
  actions: SettingsActions
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

// ─── localStorage keys ───────────────────────────────────────────────────────

const LS_STACK = 'meetscribe_service_stack'
const LS_GEMINI_KEY = 'meetscribe_gemini_api_key'
const LS_GEMINI_MODEL = 'meetscribe_gemini_model'
const LS_OPENAI_KEY = 'meetscribe_openai_api_key'
const LS_OPENAI_CHAT_MODEL = 'meetscribe_openai_chat_model'

const LEGACY_LS_API_KEY = 'meetscribe_api_key'
const LEGACY_LS_MODEL = 'meetscribe_model'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function readLS(key: string, fallback: string): string {
  try {
    return localStorage.getItem(key) ?? fallback
  } catch {
    return fallback
  }
}

function writeLS(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    // localStorage may be unavailable
  }
}

const legacyIds = DEPRECATED_GEMINI_MODEL_IDS as readonly string[]

function migrateOnce(): void {
  try {
    const legacyKey = localStorage.getItem(LEGACY_LS_API_KEY)
    if (legacyKey && !localStorage.getItem(LS_GEMINI_KEY)) {
      localStorage.setItem(LS_GEMINI_KEY, legacyKey)
    }

    const legacyModel = localStorage.getItem(LEGACY_LS_MODEL)
    if (legacyModel && !localStorage.getItem(LS_GEMINI_MODEL)) {
      const m = legacyIds.includes(legacyModel) ? DEFAULT_GEMINI_MODEL : legacyModel
      localStorage.setItem(LS_GEMINI_MODEL, m)
    }

    if (!localStorage.getItem(LS_STACK)) {
      localStorage.setItem(LS_STACK, DEFAULT_SERVICE_STACK)
    }
  } catch {
    // localStorage unavailable
  }
}

function readStoredGeminiModel(): string {
  const raw = readLS(LS_GEMINI_MODEL, DEFAULT_GEMINI_MODEL)
  if (legacyIds.includes(raw)) {
    writeLS(LS_GEMINI_MODEL, DEFAULT_GEMINI_MODEL)
    return DEFAULT_GEMINI_MODEL
  }
  return raw
}

// ─── Provider ────────────────────────────────────────────────────────────────

migrateOnce()

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [serviceStack, setServiceStackState] = useState<ServiceStack>(
    () => (readLS(LS_STACK, DEFAULT_SERVICE_STACK) as ServiceStack)
  )
  const [geminiApiKey, setGeminiApiKeyState] = useState(
    () => readLS(LS_GEMINI_KEY, '')
  )
  const [geminiModel, setGeminiModelState] = useState(
    () => readStoredGeminiModel()
  )
  const [openaiApiKey, setOpenaiApiKeyState] = useState(
    () => readLS(LS_OPENAI_KEY, '')
  )
  const [openaiChatModel, setOpenaiChatModelState] = useState(
    () => readLS(LS_OPENAI_CHAT_MODEL, DEFAULT_OPENAI_CHAT_MODEL)
  )

  const actions = useMemo<SettingsActions>(
    () => ({
      setServiceStack: (stack: ServiceStack) => {
        setServiceStackState(stack)
        writeLS(LS_STACK, stack)
      },
      setGeminiApiKey: (key: string) => {
        setGeminiApiKeyState(key)
        writeLS(LS_GEMINI_KEY, key)
      },
      setGeminiModel: (m: string) => {
        setGeminiModelState(m)
        writeLS(LS_GEMINI_MODEL, m)
      },
      setOpenaiApiKey: (key: string) => {
        setOpenaiApiKeyState(key)
        writeLS(LS_OPENAI_KEY, key)
      },
      setOpenaiChatModel: (m: string) => {
        setOpenaiChatModelState(m)
        writeLS(LS_OPENAI_CHAT_MODEL, m)
      },
    }),
    []
  )

  const state: SettingsState = {
    serviceStack,
    geminiApiKey,
    geminiModel,
    openaiApiKey,
    openaiChatModel,
    whisperModel: DEFAULT_WHISPER_MODEL,
  }

  return (
    <SettingsContext value={{ state, actions }}>
      {children}
    </SettingsContext>
  )
}

export function useSettings() {
  const context = use(SettingsContext)
  if (!context) throw new Error('useSettings must be used within SettingsProvider')
  return context
}
