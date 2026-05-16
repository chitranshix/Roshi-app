import fs from 'fs'
import path from 'path'
import { notFound } from 'next/navigation'
import type { GREWord } from '@/lib/gre-words'
import MasteredClient from './MasteredClient'

interface Props { params: Promise<{ level: string }> }

export function generateStaticParams() {
  return [1,2,3,4,5,6,7,8,9].map(level => ({ level: String(level) }))
}

export default async function MasteredPage({ params }: Props) {
  const { level } = await params
  const levelNum = parseInt(level, 10)
  if (isNaN(levelNum) || levelNum < 1 || levelNum > 9) notFound()

  let words: GREWord[]
  try {
    const filePath = path.join(process.cwd(), `public/data/gre-level-${levelNum}.json`)
    words = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  } catch {
    notFound()
  }

  return <MasteredClient level={levelNum} words={words!} />
}
