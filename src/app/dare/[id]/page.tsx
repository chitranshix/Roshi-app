import fs from 'fs'
import path from 'path'
import { notFound } from 'next/navigation'
import { MOCK_DARES, MOCK_SENTENCES } from '@/lib/mock'
import type { Sentence } from '@/lib/gre-words'
import DareFlow from './DareFlow'

interface GREWord { word: string; definition: string; level: number; sentences: Sentence[] }

interface Props { params: Promise<{ id: string }> }

function loadWordData(word: string): { sentences: Sentence[]; definition: string } | null {
  try {
    // Look up the word's level from the small index, then load only that level file
    const indexPath = path.join(process.cwd(), 'public/data/gre-word-index.json')
    const index: Record<string, number> = JSON.parse(fs.readFileSync(indexPath, 'utf-8'))
    const level = index[word]
    if (!level) return null
    const levelPath = path.join(process.cwd(), `public/data/gre-level-${level}.json`)
    const words: GREWord[] = JSON.parse(fs.readFileSync(levelPath, 'utf-8'))
    const found = words.find(w => w.word === word)
    if (found) return { sentences: found.sentences, definition: found.definition }
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
