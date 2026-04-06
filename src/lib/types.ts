// ─── Application Phase State Machine ─────────────────────────────────────────

export type AppPhase =
  | 'initial'
  | 'countdown'
  | 'recording'
  | 'video_loaded'
  | 'processing'
  | 'transcript_ready'

// ─── Settings ────────────────────────────────────────────────────────────────

export interface AppSettings {
  apiKey: string
  model: string // e.g. 'gemini-2.0-flash-lite', 'gemini-2.0-flash'
}

export const DEFAULT_MODEL = 'gemini-2.0-flash'

export const AVAILABLE_MODELS = [
  { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
  { id: 'gemini-2.0-flash-lite', label: 'Gemini 2.0 Flash Lite' },
  { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
] as const

// ─── Transcript ──────────────────────────────────────────────────────────────

export interface TranscriptSegment {
  id: string
  speaker: string
  speakerIndex: number // For color mapping
  startTime: number    // Seconds
  endTime: number      // Seconds
  text: string
}

// ─── Processing Progress ─────────────────────────────────────────────────────

export interface ProcessingStep {
  id: string
  label: string
  status: 'pending' | 'active' | 'done' | 'error'
}

export interface ProcessingProgress {
  steps: ProcessingStep[]
  currentChunk: number
  totalChunks: number
  estimatedTimeRemaining: number | null
}

// ─── Chat ────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

// ─── Export ──────────────────────────────────────────────────────────────────

export type ExportFormat = 'markdown' | 'srt' | 'json' | 'video' | 'chat'

export interface ExportOption {
  format: ExportFormat
  label: string
  description: string
}

export const EXPORT_OPTIONS: ExportOption[] = [
  { format: 'markdown', label: 'Transcript (Markdown)', description: 'Speaker labels, timestamps, full text' },
  { format: 'srt', label: 'Transcript (SRT subtitles)', description: 'Standard subtitle format for video players' },
  { format: 'json', label: 'Transcript (JSON)', description: 'Structured data for developers' },
  { format: 'video', label: 'Video recording', description: '.webm file, original quality' },
  { format: 'chat', label: 'Chat analysis history', description: 'All Q&A from the chat panel' },
]

// ─── Speaker Colors ──────────────────────────────────────────────────────────

export const SPEAKER_COLORS = [
  '#FF6B00', // marker orange
  '#A04100', // primary brown
  '#5E5F5A', // tertiary
  '#8E7164', // outline
  '#BA1A1A', // error red
  '#1A1A18', // ink
] as const

// ─── Provider Interfaces ─────────────────────────────────────────────────────

export interface SettingsState {
  apiKey: string
  model: string
}

export interface SettingsActions {
  setApiKey: (key: string) => void
  setModel: (model: string) => void
}

export interface AppState {
  phase: AppPhase
}

export interface AppActions {
  goToCountdown: () => void
  goToRecording: () => void
  loadVideo: (blob: Blob, fileName: string) => void
  startProcessing: () => void
  finishProcessing: () => void
  reset: () => void
}

export interface RecordingState {
  isRecording: boolean
  duration: number
}

export interface RecordingActions {
  start: () => Promise<void>
  stop: () => void
}

export interface MediaState {
  videoUrl: string | null
  fileName: string | null
  videoBlob: Blob | null
}

export interface MediaActions {
  setVideo: (blob: Blob, fileName: string) => void
  seekTo: (time: number) => void
  clear: () => void
}

export interface TranscriptionState {
  segments: TranscriptSegment[]
  progress: ProcessingProgress | null
  isProcessing: boolean
  error: string | null
}

export interface TranscriptionActions {
  transcribe: (videoBlob: Blob) => Promise<void>
}

export interface ChatState {
  messages: ChatMessage[]
  isStreaming: boolean
}

export interface ChatActions {
  send: (question: string) => Promise<void>
  clear: () => void
}
