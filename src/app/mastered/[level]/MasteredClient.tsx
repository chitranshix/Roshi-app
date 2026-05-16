'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { completedInLevel } from '@/lib/progress'
import type { GREWord } from '@/lib/gre-words'
import styles from './mastered.module.css'

interface Props { level: number; words: GREWord[] }

export default function MasteredClient({ level, words }: Props) {
  const router = useRouter()
  const [mastered, setMastered] = useState<GREWord[]>([])

  useEffect(() => {
    const completed = completedInLevel(level)
    setMastered(words.filter(w => completed.includes(w.word)))
  }, [level, words])

  return (
    <div className={styles.page}>

      <button className={styles.back} onClick={() => router.back()} aria-label="Back">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M15.5 5L8.5 12L15.5 19" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <div className={styles.heading}>
        <div className={styles.title}>Mission {level}</div>
        <div className={styles.subtitle}>{mastered.length} mastered</div>
      </div>

      {mastered.length === 0 ? (
        <div className={styles.empty}>No words mastered yet — start playing!</div>
      ) : (
        <div className={styles.list}>
          {mastered.map(w => (
            <div key={w.word} className={styles.wordCard}>
              <div className={styles.word}>{w.word}</div>
              <div className={styles.definition}>{w.definition}</div>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}
