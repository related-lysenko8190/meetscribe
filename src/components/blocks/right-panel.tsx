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
}: RightPanelProps) {
  if (phase === "processing" && progress) {
    return <ProcessingPanel progress={progress} />
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
