import * as React from "react"
import { HeaderBar } from "@/components/blocks/header-bar"
import { InitialView } from "@/components/blocks/initial-view"
import { CountdownView } from "@/components/blocks/countdown-view"
import { RecordingView } from "@/components/blocks/recording-view"
import { VideoPanel } from "@/components/blocks/video-panel"
import { ControlBar } from "@/components/blocks/control-bar"
import { RightPanel } from "@/components/blocks/right-panel"
import { ExportOverlay } from "@/components/blocks/export-overlay"
import { SettingsDialog } from "@/components/compound/settings-dialog"
import { FadeIn } from "@/components/animations/fade-in"
import { SettingsProvider, useSettings } from "@/providers/settings-provider"
import { AppProvider, useApp } from "@/providers/app-provider"
import { MediaProvider, useMedia } from "@/providers/media-provider"
import { RecordingProvider, useRecording } from "@/providers/recording-provider"
import {
  TranscriptionProvider,
  useTranscription,
} from "@/providers/transcription-provider"
import { ChatProvider, useChat } from "@/providers/chat-provider"
import { useCountdown } from "@/hooks/use-countdown"
import { downloadBlob, downloadText } from "@/lib/utils"
import { toMarkdown } from "@/core/exporters/markdown"
import { toSRT } from "@/core/exporters/srt"
import { toJSON } from "@/core/exporters/json"
import { toChatHistory } from "@/core/exporters/chat-history"
import type { AppPhase, ExportFormat } from "@/lib/types"

// ─── Phase list (for dev navigation) ────────────────────────────────────────

const PHASES: AppPhase[] = [
  "initial",
  "countdown",
  "recording",
  "video_loaded",
  "processing",
  "transcript_ready",
]

// ─── App Content (consumes providers) ───────────────────────────────────────

function AppContent() {
  const { state: appState, actions: appActions } = useApp()
  const { state: settings, actions: settingsActions } = useSettings()
  const { state: media, actions: mediaActions, videoRef } = useMedia()
  const {
    state: recording,
    actions: recordingActions,
    recordedBlob,
  } = useRecording()
  const {
    state: transcription,
    actions: transcriptionActions,
  } = useTranscription()
  const { state: chat, actions: chatActions } = useChat()

  const phase = appState.phase

  // Local UI-only state ───────────────────────────────────────────────────
  const [settingsOpen, setSettingsOpen] = React.useState(false)
  const [exportOpen, setExportOpen] = React.useState(false)
  const [selectedFormats, setSelectedFormats] = React.useState<
    Set<ExportFormat>
  >(new Set())
  const [searchQuery, setSearchQuery] = React.useState("")
  const [activeSegmentId, setActiveSegmentId] = React.useState<
    string | undefined
  >()
  const [showSubtitles, setShowSubtitles] = React.useState(false)

  // ─── Countdown wired through hook ───────────────────────────────────────
  const countdown = useCountdown({
    startFrom: 3,
    onComplete: () => {
      appActions.goToRecording()
      void recordingActions.start()
    },
  })

  React.useEffect(() => {
    if (phase === "countdown" && !countdown.isActive) {
      countdown.start()
    }
    if (phase !== "countdown" && countdown.isActive) {
      countdown.cancel()
    }
    // Only react to phase changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  // ─── Handlers ───────────────────────────────────────────────────────────

  function handleFileDrop(file: File) {
    mediaActions.setVideo(file, file.name)
    appActions.loadVideo(file, file.name)
  }

  function handleBrowse() {
    // File input handled inside DropZone
  }

  function handleRecord() {
    appActions.goToCountdown()
  }

  function handleCancelCountdown() {
    countdown.cancel()
    appActions._setPhase("initial")
  }

  function handleStopRecording() {
    recordingActions.stop()
    // The recording provider will produce a blob asynchronously;
    // we watch for it via effect below
  }

  // Watch for the recorded blob and forward it to media + app providers.
  // This bridges RecordingProvider -> MediaProvider + AppProvider.
  React.useEffect(() => {
    if (recordedBlob) {
      const fileName = `recording-${new Date().toISOString()}.webm`
      mediaActions.setVideo(recordedBlob, fileName)
      appActions.loadVideo(recordedBlob, fileName)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordedBlob])

  function handleTranscribe() {
    if (!media.videoBlob) return
    void transcriptionActions.transcribe(media.videoBlob)
  }

  function handleToggleFormat(format: ExportFormat) {
    setSelectedFormats((prev) => {
      const next = new Set(prev)
      if (next.has(format)) {
        next.delete(format)
      } else {
        next.add(format)
      }
      return next
    })
  }

  function handleDownloadSelected() {
    const baseName = media.fileName?.replace(/\.[^/.]+$/, "") || "meetscribe"

    for (const format of selectedFormats) {
      switch (format) {
        case "markdown":
          downloadText(
            toMarkdown(transcription.segments),
            `${baseName}.md`,
            "text/markdown"
          )
          break
        case "srt":
          downloadText(
            toSRT(transcription.segments),
            `${baseName}.srt`,
            "application/x-subrip"
          )
          break
        case "json":
          downloadText(
            toJSON(transcription.segments),
            `${baseName}.json`,
            "application/json"
          )
          break
        case "video":
          if (media.videoBlob) {
            downloadBlob(media.videoBlob, `${baseName}.webm`)
          }
          break
        case "chat":
          downloadText(
            toChatHistory(chat.messages),
            `${baseName}-chat.md`,
            "text/markdown"
          )
          break
      }
    }
    setExportOpen(false)
  }

  function handleExportVideo() {
    if (media.videoBlob) {
      const baseName = media.fileName || "meetscribe.webm"
      downloadBlob(media.videoBlob, baseName)
    }
  }

  function handleSendMessage(message: string) {
    void chatActions.send(message)
  }

  function handleTimeUpdate(time: number) {
    const active = transcription.segments.find(
      (s) => time >= s.startTime && time <= s.endTime
    )
    setActiveSegmentId(active?.id)
  }

  function handleSegmentClick(segmentId: string) {
    setActiveSegmentId(segmentId)
    const segment = transcription.segments.find((s) => s.id === segmentId)
    if (segment) {
      mediaActions.seekTo(segment.startTime)
    }
  }

  // ─── Phase cycling for dev testing ────────────────────────────────────────

  const currentPhaseIndex = PHASES.indexOf(phase)

  function nextPhase() {
    const nextIndex = (currentPhaseIndex + 1) % PHASES.length
    appActions._setPhase(PHASES[nextIndex])
  }

  function prevPhase() {
    const prevIndex =
      (currentPhaseIndex - 1 + PHASES.length) % PHASES.length
    appActions._setPhase(PHASES[prevIndex])
  }

  // ─── Determine if we have video phases ────────────────────────────────────

  const hasVideo =
    phase === "video_loaded" ||
    phase === "processing" ||
    phase === "transcript_ready"

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-screen bg-surface drafting-grid">
      <HeaderBar
        phase={phase}
        apiKey={settings.serviceStack === 'openai' ? settings.openaiApiKey : settings.geminiApiKey}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {/* Dev phase navigation */}
      <div className="flex items-center justify-center gap-2 py-1.5 px-4 bg-surface-container border-b border-ruler">
        <button
          type="button"
          onClick={prevPhase}
          className="px-2 py-0.5 text-xs font-mono border border-graphite text-graphite hover:text-on-surface hover:border-ink"
        >
          Prev
        </button>
        <span className="text-xs font-mono text-graphite">
          Phase: <span className="text-on-surface font-medium">{phase}</span>
          {" "}
          ({currentPhaseIndex + 1}/{PHASES.length})
        </span>
        <button
          type="button"
          onClick={nextPhase}
          className="px-2 py-0.5 text-xs font-mono border border-graphite text-graphite hover:text-on-surface hover:border-ink"
        >
          Next
        </button>
      </div>

      <main className="flex flex-1 min-h-0">
        {/* Left Panel (~60%) */}
        <section className="flex flex-col w-[60%] border-r border-ruler">
          <div className="flex-1 min-h-0">
            <FadeIn key={phase}>
              {phase === "initial" && (
                <InitialView
                  onFileDrop={handleFileDrop}
                  onBrowse={handleBrowse}
                  onRecord={handleRecord}
                />
              )}
              {phase === "countdown" && (
                <CountdownView
                  count={countdown.count}
                  onCancel={handleCancelCountdown}
                />
              )}
              {phase === "recording" && (
                <RecordingView
                  duration={recording.duration}
                  onStop={handleStopRecording}
                />
              )}
              {hasVideo && (
                <VideoPanel
                  videoUrl={media.videoUrl ?? ""}
                  phase={phase}
                  onTimeUpdate={handleTimeUpdate}
                  videoRef={videoRef}
                  showSubtitles={showSubtitles}
                  onToggleSubtitles={() => setShowSubtitles(!showSubtitles)}
                  segments={transcription.segments}
                  activeSegmentId={activeSegmentId}
                />
              )}
            </FadeIn>
          </div>
          {hasVideo && (
            <ControlBar
              phase={phase}
              onTranscribe={handleTranscribe}
              onRetranscribe={handleTranscribe}
              onExportVideo={handleExportVideo}
              onExportAll={() => setExportOpen(true)}
              showSubtitles={showSubtitles}
              onToggleSubtitles={() => setShowSubtitles(!showSubtitles)}
            />
          )}
        </section>

        {/* Right Panel (~40%) */}
        <section className="flex flex-col w-[40%] min-h-0">
          <RightPanel
            phase={phase}
            segments={transcription.segments}
            activeSegmentId={activeSegmentId}
            onSegmentClick={handleSegmentClick}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            messages={chat.messages}
            onSendMessage={handleSendMessage}
            isStreaming={chat.isStreaming}
            progress={transcription.progress}
          />
        </section>
      </main>

      {/* Modals */}
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        serviceStack={settings.serviceStack}
        geminiApiKey={settings.geminiApiKey}
        geminiModel={settings.geminiModel}
        openaiApiKey={settings.openaiApiKey}
        openaiChatModel={settings.openaiChatModel}
        onSaveServiceStack={settingsActions.setServiceStack}
        onSaveGeminiApiKey={settingsActions.setGeminiApiKey}
        onSaveGeminiModel={settingsActions.setGeminiModel}
        onSaveOpenaiApiKey={settingsActions.setOpenaiApiKey}
        onSaveOpenaiChatModel={settingsActions.setOpenaiChatModel}
      />

      <ExportOverlay
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        selectedFormats={selectedFormats}
        onToggleFormat={handleToggleFormat}
        onDownload={handleDownloadSelected}
      />
    </div>
  )
}

// ─── App with provider tree ─────────────────────────────────────────────────

export default function App() {
  return (
    <SettingsProvider>
      <AppProvider>
        <MediaProvider>
          <RecordingProvider>
            <TranscriptionProvider>
              <ChatProvider>
                <AppContent />
              </ChatProvider>
            </TranscriptionProvider>
          </RecordingProvider>
        </MediaProvider>
      </AppProvider>
    </SettingsProvider>
  )
}
