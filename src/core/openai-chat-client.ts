const OPENAI_CHAT_URL = 'https://api.openai.com/v1/chat/completions'

export async function* streamOpenAIChat(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userMessage: string
): AsyncGenerator<string> {
  let res: Response
  try {
    res = await fetch(OPENAI_CHAT_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        stream: true,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    throw new Error(
      `OpenAI chat request failed (network/CORS). Ensure the app is served over HTTPS or use a backend proxy. ${msg}`
    )
  }

  if (!res.ok) {
    const body = await res.text()
    let detail = body.slice(0, 500)
    try {
      const j = JSON.parse(body) as { error?: { message?: string } }
      if (j.error?.message) detail = j.error.message
    } catch {
      // keep raw text
    }
    throw new Error(`OpenAI chat API error (${res.status}): ${detail}`)
  }

  if (!res.body) {
    throw new Error('OpenAI chat: response body is null (streaming not supported)')
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })

      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data: ')) continue

        const payload = trimmed.slice(6)
        if (payload === '[DONE]') return

        try {
          const parsed = JSON.parse(payload) as {
            choices?: Array<{ delta?: { content?: string } }>
          }
          const content = parsed.choices?.[0]?.delta?.content
          if (content) yield content
        } catch {
          // skip malformed SSE lines
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}
