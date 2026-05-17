'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getStarred } from '@/lib/starred'
import BookmarkButton from '@/components/ui/BookmarkButton'
import type { StarredWord } from '@/lib/starred'
import styles from './bookmarks.module.css'

function speakWord(word: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  const ss = window.speechSynthesis
  if (ss.paused) ss.resume()
  ss.cancel()
  const utt = new SpeechSynthesisUtterance(word)
  utt.rate = 0.82; utt.lang = 'en-US'
  const go = () => {
    const v = ss.getVoices().find(v => v.lang.startsWith('en-US')) ?? ss.getVoices().find(v => v.lang.startsWith('en'))
    if (v) utt.voice = v
    ss.speak(utt)
  }
  ss.getVoices().length > 0 ? go() : ss.addEventListener('voiceschanged', go, { once: true })
}

// Small fixed rotations so cards feel like a scattered collection
const ROTATIONS = [-1.5, 1.2, -0.8, 1.8, -1.2, 0.6, -1.8, 1.0]

export default function BookmarksPage() {
  const router = useRouter()
  const [words, setWords] = useState<StarredWord[]>([])

  const reload = useCallback(() => setWords(getStarred()), [])
  useEffect(() => { reload() }, [reload])

  return (
    <div className={styles.page}>

      <button className={styles.back} onClick={() => router.back()} aria-label="Back">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M15.5 5L8.5 12L15.5 19" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <div className={styles.header}>
        <div className={styles.title}>Bookmarks</div>
        {words.length > 0 && (
          <div className={styles.count}>{words.length} word{words.length !== 1 ? 's' : ''}</div>
        )}
      </div>

      {words.length === 0 ? (
        <div className={styles.empty}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
          <div className={styles.emptyTitle}>Nothing saved yet.</div>
          <div className={styles.emptyHint}>Tap the bookmark on any card while playing to save a word here.</div>
        </div>
      ) : (
        <div className={styles.grid}>
          {words.map((w, i) => (
            <div
              key={w.word}
              className={styles.card}
              style={{ transform: `rotate(${ROTATIONS[i % ROTATIONS.length]}deg)` }}
            >
              <div className={styles.cardTop}>
                <button
                  className={styles.speakBtn}
                  onClick={() => speakWord(w.word)}
                  aria-label="Pronounce"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M11 5L6 9H2v6h4l5 4V5Z" fill="currentColor"/>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
                  </svg>
                </button>
                <BookmarkButton word={w.word} definition={w.definition} size={16} onToggle={reload} />
              </div>

              <div className={styles.cardWord}>{w.word}</div>
              <div className={styles.cardDivider} />
              {w.definition && <div className={styles.cardDef}>{w.definition}</div>}
            </div>
          ))}
        </div>
      )}

    </div>
  )
}
