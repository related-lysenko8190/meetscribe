/**
 * Minimal Gemini check using the same stack as the app: `@google/genai` + `GoogleGenAI`.
 *
 * Usage:
 *   GEMINI_API_KEY=your_key node scripts/test-gemini.mjs
 *   GEMINI_API_KEY=your_key node scripts/test-gemini.mjs --model=gemini-2.5-flash
 *
 * Note: gemini-2.0-flash often returns 404 for new API keys ("no longer available to new users").
 * Use --list or pick gemini-2.5-flash / gemini-3-flash-preview.
 *   GEMINI_API_KEY=your_key node scripts/test-gemini.mjs --list
 *
 * Or: npm run test:gemini
 */

import { GoogleGenAI } from '@google/genai'

function parseArgs(argv) {
  const list = argv.includes('--list')
  let model = process.env.GEMINI_MODEL?.trim() || 'gemini-2.5-flash'
  for (const a of argv) {
    if (a.startsWith('--model=')) {
      model = a.slice('--model='.length).trim()
    }
  }
  return { list, model }
}

async function listModels(apiKey) {
  const url = new URL('https://generativelanguage.googleapis.com/v1beta/models')
  url.searchParams.set('key', apiKey)
  url.searchParams.set('pageSize', '100')
  const res = await fetch(url)
  const body = await res.text()
  if (!res.ok) {
    console.error(`List models failed: HTTP ${res.status}`)
    console.error(body.slice(0, 2000))
    process.exit(1)
  }
  const data = JSON.parse(body)
  const models = data.models ?? []
  console.log(`Models with generateContent (${models.length} total in page):\n`)
  for (const m of models) {
    const methods = m.supportedGenerationMethods ?? []
    if (!methods.includes('generateContent')) continue
    const id = m.name?.replace(/^models\//, '') ?? m.name
    console.log(`  ${id}`)
  }
  console.log('\nUse one of the ids above with --model=...')
}

async function testGenerate(apiKey, model) {
  const ai = new GoogleGenAI({ apiKey })
  console.log(`Calling generateContent with model: "${model}"\n`)
  try {
    const response = await ai.models.generateContent({
      model,
      contents: 'Reply with exactly the word: ok',
      config: {
        temperature: 0.1,
        maxOutputTokens: 32,
      },
    })
    const text = response.text
    console.log('Success. response.text:', JSON.stringify(text))
  } catch (err) {
    console.error('generateContent threw:')
    console.error(err?.message ?? err)
    if (err?.cause) console.error('cause:', err.cause)
    process.exit(1)
  }
}

const apiKey = process.env.GEMINI_API_KEY?.trim()
if (!apiKey) {
  console.error('Missing GEMINI_API_KEY in environment.')
  process.exit(1)
}

const { list, model } = parseArgs(process.argv.slice(2))

if (list) {
  await listModels(apiKey)
} else {
  await testGenerate(apiKey, model)
}
