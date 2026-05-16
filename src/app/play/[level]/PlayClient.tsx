'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getProgress, saveProgress, completedInLevel, markWordComplete, addRetryWord, removeRetryWord } from '@/lib/progress'
import { markDailyDone, markActivityToday, recordDailyPoints } from '@/lib/daily'
import { createClient } from '@/lib/supabase'
import type { GREWord } from '@/lib/gre-words'
import WordCard from './WordCard'
import styles from './play.module.css'

interface Props {
  level: number
  words: GREWord[]
}

export default function PlayClient({ level, words }: Props) {
  const router = useRouter()
  const userIdRef = useRef<string | null>(null)

  const [deck, setDeck] = useState<GREWord[]>(() =>
    words.filter(w => !completedInLevel(level).includes(w.word))
  )
  const [retryCount, setRetryCount]       = useState(0)
  const [masteredCount, setMasteredCount] = useState(0)
  const [totalPts, setTotalPts]           = useState(() => {
    if (typeof window === 'undefined') return 0
    return parseInt(localStorage.getItem(`roshi_pts_${level}`) ?? '0', 10)
  })
  const [cardKey, setCardKey]             = useState(0)
  const [muted, setMuted]                 = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('roshi_muted') === 'true'
  })

  useEffect(() => {
    localStorage.setItem(`roshi_pts_${level}`, String(totalPts))
  }, [totalPts, level])

  // Fetch auth + sync server-completed words in the background — non-blocking
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      userIdRef.current = user.id
      const { data } = await supabase
        .from('point_events')
        .select('word')
        .eq('user_id', user.id)
        .eq('source', 'level')
        .eq('level', level)
        .not('word', 'is', null)
      const serverCompleted = [...new Set((data ?? []).map(e => e.word as string).filter(Boolean))]
      if (!serverCompleted.length) return
      const local = completedInLevel(level)
      const merged = [...new Set([...local, ...serverCompleted])]
      if (merged.length > local.length) {
        const p = getProgress()
        saveProgress({ ...p, completed: { ...p.completed, [level]: merged } })
        setDeck(prev => prev.filter(w => !merged.includes(w.word)))
      }
    })
  }, [level])

  const toggleMute = useCallback(() => {
    setMuted(prev => {
      const next = !prev
      localStorage.setItem('roshi_muted', String(next))
      if (next) window.speechSynthesis.cancel()
      return next
    })
  }, [])

  const recordPoints = useCallback(async (word: GREWord, pts: number) => {
    const uid = userIdRef.current
    if (!uid) return
    const supabase = createClient()
    await supabase.from('point_events').insert({
      user_id:    uid,
      points:     pts,
      word:       word.word,
      definition: word.definition ?? null,
      sentence:   word.sentences.find(s => s.correct)?.sentence ?? null,
      source:     'level',
      level,
    })
  }, [level])

  const handleMastered = useCallback(async (pts: number) => {
    const current = deck[0]
    if (!current) return
    markWordComplete(current.word, level)
    removeRetryWord(current.word, level)
    markDailyDone()
    markActivityToday()
    recordDailyPoints(pts)
    setTotalPts(n => n + pts)
    setMasteredCount(n => n + 1)
    void recordPoints(current, pts)
    setDeck(prev => prev.slice(1))
    setCardKey(k => k + 1)
  }, [deck, level, recordPoints])

  const handleRetry = useCallback((pts: number) => {
    const current = deck[0]
    if (!current) return
    addRetryWord(current.word, level)
    setTotalPts(n => n + pts)
    setRetryCount(n => n + 1)
    if (pts > 0) void recordPoints(current, pts)
    setDeck(prev => [...prev.slice(1), current])
    setCardKey(k => k + 1)
  }, [deck, level, recordPoints])

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

      {/* Back + Mute — top left */}
      <div className={styles.topLeft}>
        <button className={styles.backBtn} onClick={() => router.push('/')} aria-label="Home">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15.5 5L8.5 12L15.5 19" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button className={styles.muteBtn} onClick={toggleMute} aria-label={muted ? 'Unmute' : 'Mute'}>
        {muted ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M11 5L6 9H2v6h4l5 4V5Z" fill="currentColor"/>
            <line x1="22" y1="9" x2="16" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <line x1="16" y1="9" x2="22" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M11 5L6 9H2v6h4l5 4V5Z" fill="currentColor"/>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        )}
        </button>
      </div>

      {/* Floating points HUD — top right */}
      <div className={styles.hud}>
        <div className={styles.hudPoints}>{totalPts}</div>
        <div className={styles.hudLabel}>POINTS</div>
      </div>

      {/* Card stage */}
      <div className={styles.cardArea}>
        <div className={styles.ghost} />
        <WordCard
          key={cardKey}
          word={current}
          level={level}
          muted={muted}
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
