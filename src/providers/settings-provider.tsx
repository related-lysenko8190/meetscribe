import { createContext, use, useState, useMemo, type ReactNode } from 'react'
import type { SettingsState, SettingsActions } from '@/lib/types'
import { DEFAULT_MODEL, DEPRECATED_GEMINI_MODEL_IDS } from '@/lib/types'

interface SettingsContextValue {
  state: SettingsState
  actions: SettingsActions
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

const LS_API_KEY = 'meetscribe_api_key'
const LS_MODEL = 'meetscribe_model'

function readLocalStorage(key: string, fallback: string): string {
  try {
    return localStorage.getItem(key) ?? fallback
  } catch {
    return fallback
  }
}

const legacyIds = DEPRECATED_GEMINI_MODEL_IDS as readonly string[]

function readStoredModel(): string {
  const raw = readLocalStorage(LS_MODEL, DEFAULT_MODEL)
  if (legacyIds.includes(raw)) {
    try {
      localStorage.setItem(LS_MODEL, DEFAULT_MODEL)
    } catch {
      // localStorage may be unavailable
    }
    return DEFAULT_MODEL
  }
  return raw
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKeyState] = useState(() =>
    readLocalStorage(LS_API_KEY, '')
  )
  const [model, setModelState] = useState(() => readStoredModel())

  const actions = useMemo<SettingsActions>(
    () => ({
      setApiKey: (key: string) => {
        setApiKeyState(key)
        try {
          localStorage.setItem(LS_API_KEY, key)
        } catch {
          // localStorage may be unavailable
        }
      },
      setModel: (m: string) => {
        setModelState(m)
        try {
          localStorage.setItem(LS_MODEL, m)
        } catch {
          // localStorage may be unavailable
        }
      },
    }),
    []
  )

  const state: SettingsState = { apiKey, model }

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
