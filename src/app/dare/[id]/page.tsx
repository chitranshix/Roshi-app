import fs from 'fs'
import path from 'path'
import { notFound } from 'next/navigation'
import { MOCK_DARES, MOCK_SENTENCES } from '@/lib/mock'
import type { Sentence } from '@/lib/gre-words'
import DareFlow from './DareFlow'

interface GREWord { word: string; definition: string; level: number; sentences: Sentence[] }

interface Props { params: Promise<{ id: string }> }

function loadWordData(word: string): { sentences: Sentence[]; definition: string; pos: string } | null {
  try {
    const filePath = path.join(process.cwd(), 'public/data/gre-words.json')
    const data: GREWord[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    const found = data.find(w => w.word === word)
    if (found) return { sentences: found.sentences, definition: found.definition, pos: 'word' }
  } catch { /* fall through */ }
  return null
}

export default async function DarePage({ params }: Props) {
  const { id } = await params
  const dare = MOCK_DARES.find(d => d.id === id)
  if (!dare) notFound()

  const greData = loadWordData(dare.word)
  const sentences = greData?.sentences ?? MOCK_SENTENCES[dare.word] ?? []
  const definition = greData?.definition ?? null

  return <DareFlow dare={dare} sentences={sentences} definition={definition} />
}
