'use client'

import { useEffect, useState } from 'react'
import { getStarred, toggleStar } from '@/lib/starred'
import type { StarredWord } from '@/lib/starred'
import styles from './StarredDrawer.module.css'

interface Props {
  playerName: string
  open:       boolean
  onClose:    () => void
}

export default function StarredDrawer({ playerName, open, onClose }: Props) {
  const [words, setWords] = useState<StarredWord[]>([])

  useEffect(() => {
    if (!open) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading localStorage must happen in useEffect
    setWords(getStarred())
  }, [open])

  const unstar = (word: string, definition: string) => {
    toggleStar(word, definition)
    setWords(getStarred())
  }

  return (
    <>
      {open && <div className={styles.backdrop} onClick={onClose} />}
      <div className={[styles.drawer, open ? styles.open : ''].join(' ')}>
        <div className={styles.header}>
          <div className={styles.playerName}>{playerName}</div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className={styles.section}>Starred words</div>

        {words.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyText}>nothing starred yet.</div>
            <div className={styles.emptyHint}>tap ★ on any word after a round.</div>
          </div>
        ) : (
          <div className={styles.list}>
            {words.map(w => (
              <div key={w.word} className={styles.row}>
                <div className={styles.info}>
                  <div className={styles.word}>{w.word}</div>
                  <div className={styles.def}>{w.definition}</div>
                </div>
                <button
                  className={styles.unstar}
                  onClick={() => unstar(w.word, w.definition)}
                  aria-label="Remove star"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
