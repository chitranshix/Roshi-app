'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { getProgress, saveProgress, completedInLevel, markWordComplete } from '@/lib/progress'
import { createClient } from '@/lib/supabase'
import type { GREWord } from '@/lib/gre-words'
import WordCard from './WordCard'
import styles from './play.module.css'

interface Props {
  level:           number
  words:           GREWord[]
  userId:          string | null
  serverCompleted: string[]
}

export default function PlayClient({ level, words, userId, serverCompleted }: Props) {
  const [initialCompleted] = useState<string[]>(() => {
    const local = completedInLevel(level)
    if (!serverCompleted.length) return local
    const merged = [...new Set([...local, ...serverCompleted])]
    if (merged.length > local.length) {
      const p = getProgress()
      saveProgress({ ...p, completed: { ...p.completed, [level]: merged } })
    }
    return merged
  })

  const [deck, setDeck] = useState<GREWord[]>(() =>
    words.filter(w => !initialCompleted.includes(w.word))
  )
  const [retryCount, setRetryCount] = useState(0)
  const [masteredCount, setMasteredCount] = useState(0)
  const [totalPts, setTotalPts] = useState(0)
  const [cardKey, setCardKey] = useState(0)

  const recordPoints = useCallback(async (word: GREWord, pts: number) => {
    if (!userId) return
    const supabase = createClient()
    await supabase.from('point_events').insert({
      user_id:    userId,
      points:     pts,
      word:       word.word,
      definition: word.definition ?? null,
      sentence:   word.sentences.find(s => s.correct)?.sentence ?? null,
      source:     'level',
      level,
    })
  }, [userId, level])

  const handleMastered = useCallback(async (pts: number) => {
    const current = deck[0]
    if (!current) return
    markWordComplete(current.word, level)
    setTotalPts(n => n + pts)
    setMasteredCount(n => n + 1)
    void recordPoints(current, pts)
    setDeck(prev => prev.slice(1))
    setCardKey(k => k + 1)
  }, [deck, level, recordPoints])

  const handleRetry = useCallback((pts: number) => {
    const current = deck[0]
    if (!current) return
    setTotalPts(n => n + pts)
    setRetryCount(n => n + 1)
    if (pts > 0) void recordPoints(current, pts)
    setDeck(prev => [...prev.slice(1), current])
    setCardKey(k => k + 1)
  }, [deck, recordPoints])

  // Session complete
  if (deck.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.completeScreen}>
          {masteredCount > 0 ? (
            <>
              <div className={styles.completeTitle}>Mission {level} complete.</div>
              <div className={styles.completeSub}>
                {masteredCount} mastered · {totalPts} pts
              </div>
            </>
          ) : (
            <div className={styles.completeSub}>
              You&apos;ve already mastered all words in Mission {level}.
            </div>
          )}
          <Link href="/" className={styles.homeLink}>← Home</Link>
        </div>
      </div>
    )
  }

  const current = deck[0]

  return (
    <div className={styles.container}>

      {/* Floating points HUD — top right */}
      <div className={styles.hud}>
        <div className={styles.hudPoints}>{totalPts}</div>
        <div className={styles.hudLabel}>POINTS</div>
      </div>

      {/* Card stage */}
      <div className={styles.cardArea}>
        {/* Ghost placeholder — suggests a deck behind the active card */}
        <div className={styles.ghost} />

        <WordCard
          key={cardKey}
          word={current}
          level={level}
          onMastered={handleMastered}
          onRetry={handleRetry}
        />
      </div>

      {/* Floor — pile indicators */}
      <div className={styles.floor}>
        <div className={styles.pileCard}>
          <div className={styles.pileCount}>{retryCount}</div>
          <div className={styles.pileLabel}>RETRY</div>
        </div>
        <div className={styles.pileCard}>
          <div className={styles.pileCount}>{masteredCount}</div>
          <div className={styles.pileLabel}>MASTERED</div>
        </div>
      </div>

    </div>
  )
}
