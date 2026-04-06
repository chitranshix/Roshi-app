import { notFound } from 'next/navigation'
import { MOCK_DARES, MOCK_SENTENCES, MOCK_DEFINITIONS } from '@/lib/mock'
import DareFlow from './DareFlow'

interface Props { params: Promise<{ id: string }> }

export default async function DarePage({ params }: Props) {
  const { id } = await params
  const dare = MOCK_DARES.find(d => d.id === id)
  if (!dare) notFound()

  const sentences = MOCK_SENTENCES[dare.word] ?? []
  const definition = MOCK_DEFINITIONS[dare.word] ?? null

  return <DareFlow dare={dare} sentences={sentences} definition={definition} />
}
