import { cn } from "@/lib/utils"
import type { ChatMessage } from "@/lib/types"

interface ChatBubbleProps {
  message: ChatMessage
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === "user"

  return (
    <div
      className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[85%] px-3 py-2 text-sm font-body",
          isUser
            ? "bg-surface-container-high text-on-surface"
            : "bg-surface-container-low text-on-surface"
        )}
      >
        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
      </div>
    </div>
  )
}
