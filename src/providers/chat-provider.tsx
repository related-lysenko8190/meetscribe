import {
  createContext,
  use,
  useState,
  useRef,
  useMemo,
  useCallback,
  type ReactNode,
} from 'react'
import type { ChatMessage, ChatState, ChatActions } from '@/lib/types'
import { generateId } from '@/lib/utils'
import { useSettings } from './settings-provider'
import { useTranscription } from './transcription-provider'
import { chatWithTranscript } from '@/core/chat-engine'

interface ChatContextValue {
  state: ChatState
  actions: ChatActions
}

const ChatContext = createContext<ChatContextValue | null>(null)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const abortRef = useRef(false)

  const { state: settings } = useSettings()
  const { state: transcription } = useTranscription()

  const send = useCallback(
    async (question: string) => {
      if (isStreaming) return
      if (!settings.apiKey) return

      abortRef.current = false

      // Add user message
      const userMessage: ChatMessage = {
        id: generateId(),
        role: 'user',
        content: question,
        timestamp: Date.now(),
      }

      // Create initial assistant message
      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, userMessage, assistantMessage])
      setIsStreaming(true)

      try {
        const generator = chatWithTranscript(
          settings.apiKey,
          settings.model,
          transcription.segments,
          question
        )

        let accumulated = ''
        for await (const chunk of generator) {
          if (abortRef.current) break
          accumulated += chunk
          const updatedContent = accumulated
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessage.id
                ? { ...msg, content: updatedContent }
                : msg
            )
          )
        }
      } catch (err) {
        const errorText =
          err instanceof Error ? err.message : 'Failed to get response'
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessage.id
              ? { ...msg, content: `Error: ${errorText}` }
              : msg
          )
        )
      } finally {
        setIsStreaming(false)
      }
    },
    [isStreaming, settings.apiKey, settings.model, transcription.segments]
  )

  const clear = useCallback(() => {
    abortRef.current = true
    setMessages([])
    setIsStreaming(false)
  }, [])

  const actions = useMemo<ChatActions>(
    () => ({ send, clear }),
    [send, clear]
  )

  const state: ChatState = { messages, isStreaming }

  return (
    <ChatContext value={{ state, actions }}>
      {children}
    </ChatContext>
  )
}

export function useChat() {
  const context = use(ChatContext)
  if (!context) throw new Error('useChat must be used within ChatProvider')
  return context
}
