import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  AVAILABLE_GEMINI_MODELS,
  AVAILABLE_OPENAI_CHAT_MODELS,
  DEFAULT_WHISPER_MODEL,
  type ServiceStack,
} from "@/lib/types"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  serviceStack: ServiceStack
  geminiApiKey: string
  geminiModel: string
  openaiApiKey: string
  openaiChatModel: string
  onSaveServiceStack: (stack: ServiceStack) => void
  onSaveGeminiApiKey: (key: string) => void
  onSaveGeminiModel: (model: string) => void
  onSaveOpenaiApiKey: (key: string) => void
  onSaveOpenaiChatModel: (model: string) => void
}

const selectClass =
  "flex h-9 w-full border border-graphite bg-transparent px-3 py-1 text-sm font-body text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

export function SettingsDialog({
  open,
  onOpenChange,
  serviceStack,
  geminiApiKey,
  geminiModel,
  openaiApiKey,
  openaiChatModel,
  onSaveServiceStack,
  onSaveGeminiApiKey,
  onSaveGeminiModel,
  onSaveOpenaiApiKey,
  onSaveOpenaiChatModel,
}: SettingsDialogProps) {
  const [localStack, setLocalStack] = React.useState<ServiceStack>(serviceStack)
  const [localGeminiKey, setLocalGeminiKey] = React.useState(geminiApiKey)
  const [localGeminiModel, setLocalGeminiModel] = React.useState(geminiModel)
  const [localOpenaiKey, setLocalOpenaiKey] = React.useState(openaiApiKey)
  const [localOpenaiChatModel, setLocalOpenaiChatModel] = React.useState(openaiChatModel)

  React.useEffect(() => {
    setLocalStack(serviceStack)
    setLocalGeminiKey(geminiApiKey)
    setLocalGeminiModel(geminiModel)
    setLocalOpenaiKey(openaiApiKey)
    setLocalOpenaiChatModel(openaiChatModel)
  }, [serviceStack, geminiApiKey, geminiModel, openaiApiKey, openaiChatModel, open])

  function handleSave() {
    onSaveServiceStack(localStack)
    onSaveGeminiApiKey(localGeminiKey)
    onSaveGeminiModel(localGeminiModel)
    onSaveOpenaiApiKey(localOpenaiKey)
    onSaveOpenaiChatModel(localOpenaiChatModel)
    onOpenChange(false)
  }

  const isOpenAI = localStack === "openai"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Choose your AI provider and configure API keys.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-5 py-4">
          {/* Stack selector */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-label font-medium text-on-surface">
              AI Provider
            </label>
            <div className="flex gap-0 border border-graphite">
              <button
                type="button"
                onClick={() => setLocalStack("gemini")}
                className={`flex-1 px-3 py-1.5 text-sm font-body transition-colors ${
                  !isOpenAI
                    ? "bg-ink text-white"
                    : "bg-transparent text-graphite hover:text-on-surface"
                }`}
              >
                Google Gemini
              </button>
              <button
                type="button"
                onClick={() => setLocalStack("openai")}
                className={`flex-1 px-3 py-1.5 text-sm font-body border-l border-graphite transition-colors ${
                  isOpenAI
                    ? "bg-ink text-white"
                    : "bg-transparent text-graphite hover:text-on-surface"
                }`}
              >
                OpenAI
              </button>
            </div>
          </div>

          {/* API key (single field, switches target) */}
          <div className="flex flex-col gap-2">
            <label
              className="text-sm font-label font-medium text-on-surface"
              htmlFor="api-key"
            >
              {isOpenAI ? "OpenAI API Key" : "Gemini API Key"}
            </label>
            <Input
              id="api-key"
              type="password"
              placeholder={
                isOpenAI
                  ? "Enter your OpenAI API key"
                  : "Enter your Gemini API key"
              }
              value={isOpenAI ? localOpenaiKey : localGeminiKey}
              onChange={(e) =>
                isOpenAI
                  ? setLocalOpenaiKey(e.target.value)
                  : setLocalGeminiKey(e.target.value)
              }
              className="font-mono text-xs"
            />
          </div>

          {/* Gemini model */}
          {!isOpenAI && (
            <div className="flex flex-col gap-2">
              <label
                className="text-sm font-label font-medium text-on-surface"
                htmlFor="gemini-model-select"
              >
                Model
              </label>
              <select
                id="gemini-model-select"
                value={localGeminiModel}
                onChange={(e) => setLocalGeminiModel(e.target.value)}
                className={selectClass}
              >
                {AVAILABLE_GEMINI_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* OpenAI models */}
          {isOpenAI && (
            <>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-label font-medium text-on-surface">
                  Transcription Model
                </label>
                <span className="text-sm font-body text-graphite px-3 py-1.5 border border-dashed border-graphite">
                  {DEFAULT_WHISPER_MODEL}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <label
                  className="text-sm font-label font-medium text-on-surface"
                  htmlFor="openai-chat-model-select"
                >
                  Chat Model
                </label>
                <select
                  id="openai-chat-model-select"
                  value={localOpenaiChatModel}
                  onChange={(e) => setLocalOpenaiChatModel(e.target.value)}
                  className={selectClass}
                >
                  {AVAILABLE_OPENAI_CHAT_MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-graphite">
                Whisper does not support speaker diarization. All segments will
                be labeled as a single speaker.
              </p>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
