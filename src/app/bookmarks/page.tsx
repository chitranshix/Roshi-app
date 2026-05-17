'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getStarred } from '@/lib/starred'
import BookmarkButton from '@/components/ui/BookmarkButton'
import type { StarredWord } from '@/lib/starred'
import styles from './bookmarks.module.css'

export default function BookmarksPage() {
  const router = useRouter()
  const [words, setWords] = useState<StarredWord[]>([])

  const reload = useCallback(() => {
    setWords(getStarred())
  }, [])

  useEffect(() => { reload() }, [reload])

  return (
    <div className={styles.page}>

      <button className={styles.back} onClick={() => router.back()} aria-label="Back">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M15.5 5L8.5 12L15.5 19" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <div className={styles.heading}>Bookmarks</div>

      {words.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyTitle}>Nothing saved yet.</div>
          <div className={styles.emptyHint}>Tap the bookmark on any card while playing to save a word here.</div>
        </div>
      ) : (
        <div className={styles.list}>
          {words.map(w => (
            <div key={w.word} className={styles.row}>
              <div className={styles.rowText}>
                <div className={styles.word}>{w.word}</div>
                {w.definition && <div className={styles.def}>{w.definition}</div>}
              </div>
              <BookmarkButton
                word={w.word}
                definition={w.definition}
                size={18}
                onToggle={reload}
              />
            </div>
          ))}
        </div>
      )}

    </div>
  )
}
