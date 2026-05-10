import fs from 'fs'
import path from 'path'
import { notFound } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase-server'
import PlayClient from './PlayClient'

interface Props { params: Promise<{ level: string }> }

export default async function PlayPage({ params }: Props) {
  const { level } = await params
  const levelNum = parseInt(level, 10)
  if (isNaN(levelNum) || levelNum < 1 || levelNum > 9) notFound()

  let words: unknown
  try {
    const filePath = path.join(process.cwd(), `public/data/gre-level-${levelNum}.json`)
    words = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  } catch {
    notFound()
  }

  const supabase = await createServerSupabase()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user ?? null

  let serverCompleted: string[] = []
  if (user) {
    const { data } = await supabase
      .from('point_events')
      .select('word')
      .eq('user_id', user.id)
      .eq('source', 'level')
      .eq('level', levelNum)
      .not('word', 'is', null)
    serverCompleted = [...new Set((data ?? []).map(e => e.word as string).filter(Boolean))]
  }

  return <PlayClient level={levelNum} words={words as Parameters<typeof PlayClient>[0]['words']} userId={user?.id ?? null} serverCompleted={serverCompleted} />
}
