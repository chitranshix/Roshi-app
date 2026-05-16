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
        content: `You are grading a GRE/GMAT vocabulary game. Word: "${word}". ${context} Player's definition: "${definition}". Say "yes" only if the player's definition captures the core meaning clearly — a correct synonym or a description that shows real understanding. Say "no" if the answer is vague, too general, only partially right, or could describe many other words. A one-word answer like "bad" or "good" for a nuanced word is "no". Reply with only "yes" or "no".`,
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
