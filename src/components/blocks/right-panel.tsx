import { TabPanel } from "@/components/compound/tab-panel"
import { TranscriptPanel } from "./transcript-panel"
import { ChatPanel } from "./chat-panel"
import { ProcessingPanel } from "./processing-panel"
import type {
  AppPhase,
  TranscriptSegment,
  ChatMessage,
  ProcessingProgress,
} from "@/lib/types"

interface RightPanelProps {
  phase: AppPhase
  segments: TranscriptSegment[]
  activeSegmentId?: string
  onSegmentClick?: (segmentId: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  messages: ChatMessage[]
  onSendMessage: (message: string) => void
  isStreaming?: boolean
  progress?: ProcessingProgress | null
  transcriptionError?: string | null
  onRetryTranscribe?: () => void
}

export function RightPanel({
  phase,
  segments,
  activeSegmentId,
  onSegmentClick,
  searchQuery,
  onSearchChange,
  messages,
  onSendMessage,
  isStreaming,
  progress,
  transcriptionError,
  onRetryTranscribe,
}: RightPanelProps) {
  if (phase === "processing" && progress) {
    return <ProcessingPanel progress={progress} />
  }

  if (phase === "video_loaded" && transcriptionError) {
    return (
      <div className="flex h-full p-6">
        <div className="m-auto w-full max-w-md border border-destructive/30 bg-destructive/5 p-4">
          <h3 className="text-sm font-medium text-destructive mb-2">Transcription failed</h3>
          <p className="text-sm text-on-surface mb-4">{transcriptionError}</p>
          <button
            type="button"
            onClick={onRetryTranscribe}
            className="px-3 py-1.5 text-xs font-label border border-ink text-on-surface hover:bg-surface-container"
          >
            Retry transcription
          </button>
        </div>
      </div>
    )
  }

  if (phase === "transcript_ready") {
    return (
      <TabPanel
        tabs={[
          { id: "transcript", label: "Transcript" },
          { id: "chat", label: "Chat" },
        ]}
        className="h-full"
      >
        <TranscriptPanel
          segments={segments}
          activeSegmentId={activeSegmentId}
          onSegmentClick={onSegmentClick}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
        />
        <ChatPanel
          messages={messages}
          onSend={onSendMessage}
          isStreaming={isStreaming}
        />
      </TabPanel>
    )
  }

  return (
    <div className="flex items-center justify-center h-full p-6">
      <p className="text-sm text-graphite text-center">
        Transcript and chat will appear here after processing
      </p>
    </div>
  )
}
