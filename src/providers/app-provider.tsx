import {
  createContext,
  use,
  useReducer,
  useMemo,
  useCallback,
  type ReactNode,
} from 'react'
import type { AppPhase, AppState, AppActions } from '@/lib/types'

interface AppContextValue {
  state: AppState
  actions: AppActions
}

const AppContext = createContext<AppContextValue | null>(null)

type AppAction =
  | { type: 'GO_TO_COUNTDOWN' }
  | { type: 'GO_TO_RECORDING' }
  | { type: 'LOAD_VIDEO'; blob: Blob; fileName: string }
  | { type: 'START_PROCESSING' }
  | { type: 'FINISH_PROCESSING' }
  | { type: 'RESET' }
  | { type: 'DEV_SET_PHASE'; phase: AppPhase }

interface InternalAppState {
  phase: AppPhase
  videoBlob: Blob | null
  fileName: string | null
}

function appReducer(state: InternalAppState, action: AppAction): InternalAppState {
  switch (action.type) {
    case 'GO_TO_COUNTDOWN':
      if (state.phase !== 'initial') return state
      return { ...state, phase: 'countdown' }

    case 'GO_TO_RECORDING':
      if (state.phase !== 'countdown') return state
      return { ...state, phase: 'recording' }

    case 'LOAD_VIDEO':
      if (state.phase !== 'initial' && state.phase !== 'recording') return state
      return {
        ...state,
        phase: 'video_loaded',
        videoBlob: action.blob,
        fileName: action.fileName,
      }

    case 'START_PROCESSING':
      if (state.phase !== 'video_loaded' && state.phase !== 'transcript_ready')
        return state
      return { ...state, phase: 'processing' }

    case 'FINISH_PROCESSING':
      if (state.phase !== 'processing') return state
      return { ...state, phase: 'transcript_ready' }

    case 'RESET':
      return { phase: 'initial', videoBlob: null, fileName: null }

    case 'DEV_SET_PHASE':
      // Dev/debug: bypass guards
      return { ...state, phase: action.phase }

    default:
      return state
  }
}

// We need a way for loadVideo to also notify the media provider.
// The app provider stores the blob/fileName internally so the
// media provider can be notified via a callback. However, to keep
// providers decoupled, the loadVideo action is also exposed through
// an onLoadVideo callback prop.

interface AppProviderProps {
  children: ReactNode
  onLoadVideo?: (blob: Blob, fileName: string) => void
}

export function AppProvider({ children, onLoadVideo }: AppProviderProps) {
  const [internalState, dispatch] = useReducer(appReducer, {
    phase: 'initial',
    videoBlob: null,
    fileName: null,
  })

  const loadVideoCallback = useCallback(
    (blob: Blob, fileName: string) => {
      dispatch({ type: 'LOAD_VIDEO', blob, fileName })
      onLoadVideo?.(blob, fileName)
    },
    [onLoadVideo]
  )

  const actions = useMemo<AppActions>(
    () => ({
      goToCountdown: () => dispatch({ type: 'GO_TO_COUNTDOWN' }),
      goToRecording: () => dispatch({ type: 'GO_TO_RECORDING' }),
      loadVideo: loadVideoCallback,
      startProcessing: () => dispatch({ type: 'START_PROCESSING' }),
      finishProcessing: () => dispatch({ type: 'FINISH_PROCESSING' }),
      reset: () => dispatch({ type: 'RESET' }),
      _setPhase: (phase) => dispatch({ type: 'DEV_SET_PHASE', phase }),
    }),
    [loadVideoCallback]
  )

  const state: AppState = { phase: internalState.phase }

  return (
    <AppContext value={{ state, actions }}>
      {children}
    </AppContext>
  )
}

export function useApp() {
  const context = use(AppContext)
  if (!context) throw new Error('useApp must be used within AppProvider')
  return context
}
