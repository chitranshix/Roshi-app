import { notFound } from 'next/navigation'
import PlayClient from './PlayClient'

interface Props { params: Promise<{ level: string }> }

export default async function PlayPage({ params }: Props) {
  const { level } = await params
  const levelNum = parseInt(level, 10)
  if (isNaN(levelNum) || levelNum < 1 || levelNum > 11) notFound()

  // Load word data server-side
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'}/data/gre-level-${levelNum}.json`,
    { cache: 'force-cache' }
  )
  if (!res.ok) notFound()
  const words = await res.json()

  return <PlayClient level={levelNum} words={words} />
}
