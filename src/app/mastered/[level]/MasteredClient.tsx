'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { completedInLevel } from '@/lib/progress'
import { isStarred, toggleStar } from '@/lib/starred'
import type { GREWord } from '@/lib/gre-words'
import styles from './mastered.module.css'

function BookmarkButton({ word, definition }: { word: string; definition: string }) {
  const [saved, setSaved] = useState(false)
  useEffect(() => { setSaved(isStarred(word)) }, [word])

  const handle = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const now = await toggleStar(word, definition)
    setSaved(now)
    if (navigator.vibrate) navigator.vibrate(30)
  }

  return (
    <button
      className={`${styles.bookmarkBtn} ${saved ? styles.bookmarkBtnActive : ''}`}
      onClick={handle}
      aria-label={saved ? 'Remove bookmark' : 'Bookmark word'}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
      </svg>
    </button>
  )
}

interface Props { level: number; words: GREWord[] }

export default function MasteredClient({ level, words }: Props) {
  const router = useRouter()
  const [mastered, setMastered] = useState<GREWord[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const carouselRef  = useRef<HTMLDivElement>(null)
  const stripRef     = useRef<HTMLDivElement>(null)
  const activeChipRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    const completed = completedInLevel(level)
    setMastered(words.filter(w => completed.includes(w.word)))
  }, [level, words])

  // Keep active chip centred in the strip
  useEffect(() => {
    activeChipRef.current?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }, [currentIdx])

  const handleScroll = useCallback(() => {
    const el = carouselRef.current
    if (!el) return
    const idx = Math.round(el.scrollLeft / el.clientWidth)
    setCurrentIdx(idx)
  }, [])

  const jumpTo = useCallback((idx: number) => {
    const el = carouselRef.current
    if (!el) return
    el.scrollTo({ left: idx * el.clientWidth, behavior: 'smooth' })
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
          {len === 0 ? 'No words mastered yet' : `${currentIdx + 1} of ${len} mastered`}
        </div>
      </div>

      {len === 0 ? (
        <div className={styles.empty}>Start playing to build your collection.</div>
      ) : (
        <>
          <div className={styles.carousel} ref={carouselRef} onScroll={handleScroll}>
            {mastered.map((w, i) => {
              const correctSentence = w.sentences.find(s => s.correct)?.sentence ?? ''
              const wlen = w.word.length
              const wordSize = wlen <= 8 ? undefined : wlen <= 11 ? '1.8rem' : wlen <= 14 ? '1.5rem' : '1.2rem'
              return (
                <div key={w.word} className={styles.slide}>
                  <div className={styles.card}>
                    <div className={styles.cardMeta}>{i + 1} / {len}</div>

                    <div className={styles.cardContent}>
                      <div className={styles.cardBody}>
                        <div className={styles.cardWord} style={wordSize ? { fontSize: wordSize } : undefined}>
                          {w.word}
                        </div>
                        <div className={styles.cardDivider} />
                        <div className={styles.cardDef}>{w.definition}</div>
                      </div>

                    <div className={styles.cardSentence}>
                      <div className={styles.sentenceLabel}>USED IN A SENTENCE</div>
                      <p className={styles.sentenceText}>&ldquo;{correctSentence}&rdquo;</p>
                    </div>
                    </div>

                  <div className={styles.cardActions}>
                    <BookmarkButton word={w.word} definition={w.definition} />
                  </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Word strip */}
          <div className={styles.wordStrip} ref={stripRef}>
            {mastered.map((w, i) => (
              <button
                key={w.word}
                ref={i === currentIdx ? activeChipRef : null}
                className={`${styles.wordChip} ${i === currentIdx ? styles.wordChipActive : ''}`}
                onClick={() => jumpTo(i)}
              >
                <span className={styles.chipNum}>{i + 1}</span>
                {w.word}
              </button>
            ))}
          </div>
        </>
      )}

    </div>
  )
}
