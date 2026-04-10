import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  const { word, definition, actualDefinition } = await req.json()

  if (!word || !definition) {
    return NextResponse.json({ error: 'Missing word or definition' }, { status: 400 })
  }

  const context = actualDefinition
    ? `The correct definition is: "${actualDefinition}".`
    : ''

  const message = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 10,
    messages: [
      {
        role: 'user',
        content: `You are grading a vocabulary game. Word: "${word}". ${context} Player's definition: "${definition}". Say "yes" if the player's definition demonstrates they understand the word's meaning — even if informal, incomplete, or just a synonym. Be generous: "lie, cheating" for "bluff" is yes. Only say "no" if it's clearly wrong or shows no understanding. Reply with only "yes" or "no".`,
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
