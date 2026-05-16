'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { completedInLevel } from '@/lib/progress'
import type { GREWord } from '@/lib/gre-words'
import styles from './mastered.module.css'

interface Props { level: number; words: GREWord[] }

export default function MasteredClient({ level, words }: Props) {
  const router = useRouter()
  const [mastered, setMastered] = useState<GREWord[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const completed = completedInLevel(level)
    setMastered(words.filter(w => completed.includes(w.word)))
  }, [level, words])

  const handleScroll = useCallback(() => {
    const el = carouselRef.current
    if (!el) return
    setCurrentIdx(Math.round(el.scrollLeft / el.clientWidth))
  }, [])

  const len = mastered.length

  return (
    <div className={styles.page}>

      <button className={styles.back} onClick={() => router.back()} aria-label="Back">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M15.5 5L8.5 12L15.5 19" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <div className={styles.heading}>
        <div className={styles.title}>Level {level}</div>
        <div className={styles.subtitle}>
          {len === 0 ? 'No words mastered yet' : `${len} mastered`}
        </div>
      </div>

      {len === 0 ? (
        <div className={styles.empty}>Start playing to build your collection.</div>
      ) : (
        <>
          <div className={styles.carousel} ref={carouselRef} onScroll={handleScroll}>
            {mastered.map((w, i) => {
              const wlen = w.word.length
              const fontSize = wlen <= 8 ? undefined : wlen <= 11 ? '1.9rem' : wlen <= 14 ? '1.55rem' : '1.25rem'
              return (
                <div key={w.word} className={styles.slide}>
                  <div className={styles.card}>
                    <div className={styles.cardMeta}>
                      <span className={styles.cardNum}>{i + 1} / {len}</span>
                    </div>
                    <div className={styles.cardBody}>
                      <div className={styles.cardWord} style={fontSize ? { fontSize } : undefined}>
                        {w.word}
                      </div>
                      <div className={styles.cardDivider} />
                      <div className={styles.cardDef}>{w.definition}</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <div className={styles.hint}>flick to browse</div>
        </>
      )}

    </div>
  )
}
