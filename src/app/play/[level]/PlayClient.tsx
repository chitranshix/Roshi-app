'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
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
  const [cardKey, setCardKey] = useState(0)

  const recordPoints = useCallback(async (word: GREWord, pts: number) => {
    markWordComplete(word.word, level)
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
    await recordPoints(current, pts)
    setMasteredCount(n => n + 1)
    setDeck(prev => prev.slice(1))
    setCardKey(k => k + 1)
  }, [deck, recordPoints])

  const handleRetry = useCallback(() => {
    const current = deck[0]
    if (!current) return
    // push to back of deck for spaced retry
    setRetryCount(n => n + 1)
    setDeck(prev => [...prev.slice(1), current])
    setCardKey(k => k + 1)
  }, [deck])

  const total = initialCompleted.length + deck.length + masteredCount

  // All mastered — session done (retry words are re-queued so deck empties when all words mastered)
  const allDone = deck.length === 0

  if (allDone && masteredCount > 0) {
    return (
      <div className={styles.container}>
        <div className={styles.completeScreen}>
          <div className={styles.completeEmoji}>✦</div>
          <div className={styles.completeTitle}>Mission {level} complete</div>
          <div className={styles.completeSub}>
            {masteredCount} word{masteredCount !== 1 ? 's' : ''} mastered this session.
          </div>
          <Link href="/" className={styles.homeLink}>Back to home</Link>
        </div>
      </div>
    )
  }

  if (allDone && masteredCount === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.completeScreen}>
          <div className={styles.completeEmoji}>✦</div>
          <div className={styles.completeSub}>You&apos;ve already mastered all words in Mission {level}.</div>
          <Link href="/" className={styles.homeLink}>Back to home</Link>
        </div>
      </div>
    )
  }

  const current = deck[0]
  const doneCount = initialCompleted.length + masteredCount

  return (
    <div className={styles.container}>

      {/* ── Top bar ── */}
      <div className={styles.topBar}>
        <Link href="/" className={styles.backBtn}>←</Link>
        <div className={styles.missionLabel}>Mission {level}</div>
        <div className={styles.progressText}>{doneCount} / {total}</div>
      </div>

      {/* ── Progress bar ── */}
      <div className={styles.progressBarWrap}>
        <div className={styles.progressBarFill} style={{ width: `${Math.round((doneCount / total) * 100)}%` }} />
      </div>

      {/* ── Card area ── */}
      <div className={styles.cardArea}>
        <AnimatePresence mode="wait">
          {current && (
            <motion.div
              key={cardKey}
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              style={{ width: '100%' }}
            >
              <WordCard
                word={current}
                onMastered={handleMastered}
                onRetry={handleRetry}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Pile counters ── */}
      <div className={styles.piles}>
        <div className={styles.pile}>
          <span className={styles.pileCount}>{retryCount}</span>
          <span className={styles.pileLabel}>Retry</span>
        </div>
        <div className={styles.pileCenter}>
          <span className={styles.deckCount}>{deck.length} left</span>
        </div>
        <div className={[styles.pile, styles.pileMastered].join(' ')}>
          <span className={styles.pileCount}>{masteredCount}</span>
          <span className={styles.pileLabel}>Mastered</span>
        </div>
      </div>

    </div>
  )
}
