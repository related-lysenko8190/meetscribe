import * as React from "react"
import { Send } from "lucide-react"
import { ChatBubble } from "@/components/custom/chat-bubble"
import type { ChatMessage } from "@/lib/types"

interface ChatPanelProps {
  messages: ChatMessage[]
  onSend: (message: string) => void
  isStreaming?: boolean
}

export function ChatPanel({ messages, onSend, isStreaming = false }: ChatPanelProps) {
  const [input, setInput] = React.useState("")
  const scrollRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = input.trim()
    if (trimmed && !isStreaming) {
      onSend(trimmed)
      setInput("")
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-sm text-graphite">
              Ask questions about the transcript...
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))
        )}
        {isStreaming && (
          <div className="flex justify-start">
            <div className="bg-surface-container-low px-3 py-2 text-sm text-graphite">
              Thinking...
            </div>
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3 border-t border-ruler">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about the meeting..."
          disabled={isStreaming}
          className="flex-1 h-9 border border-graphite bg-transparent px-3 text-sm font-body text-on-surface placeholder:text-graphite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || isStreaming}
          aria-label="Send message"
          className="flex items-center justify-center size-9 bg-primary text-on-primary hover:bg-primary-container disabled:opacity-50 disabled:pointer-events-none"
        >
          <Send className="size-4" />
        </button>
      </form>
    </div>
  )
}
