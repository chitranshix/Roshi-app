import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  const { word, definition } = await req.json()

  if (!word || !definition) {
    return NextResponse.json({ error: 'Missing word or definition' }, { status: 400 })
  }

  const message = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 10,
    messages: [
      {
        role: 'user',
        content: `You are grading a vocabulary game. Word: "${word}". Player's definition: "${definition}". Say "yes" only if the definition captures the core meaning of the word — a vague association, loose synonym, or surface-level guess does not count. For example, "ice-like" for "polar" is no. "Relating to opposites" or "of or near the poles" would be yes. Reply with only "yes" or "no".`,
      },
    ],
  })

  const text = message.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map(b => b.text)
    .join('')
    .trim()
    .toLowerCase()

  const correct = text.startsWith('yes')

  return NextResponse.json({ correct })
}
