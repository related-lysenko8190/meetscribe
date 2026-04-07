import type { ChatMessage } from '@/lib/types'

export function toChatHistory(messages: ChatMessage[]): string {
  const lines = ['# Chat Analysis History', '']

  for (const msg of messages) {
    const role = msg.role === 'user' ? 'You' : 'Assistant'
    const time = new Date(msg.timestamp).toLocaleTimeString()
    lines.push(`### ${role} (${time})`)
    lines.push(msg.content)
    lines.push('')
  }

  return lines.join('\n')
}
