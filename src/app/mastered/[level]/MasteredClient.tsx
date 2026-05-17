'use client'

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { completedInLevel } from '@/lib/progress'
import BookmarkButton from '@/components/ui/BookmarkButton'
import type { GREWord } from '@/lib/gre-words'
import styles from './mastered.module.css'

function speak(word: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  const ss = window.speechSynthesis
  if (ss.paused) ss.resume()
  ss.cancel()
  const utt = new SpeechSynthesisUtterance(word)
  utt.rate = 0.82
  utt.lang = 'en-US'
  const go = () => {
    const voices = ss.getVoices()
    const v = voices.find(v => v.lang.startsWith('en-US')) ?? voices.find(v => v.lang.startsWith('en'))
    if (v) utt.voice = v
    ss.speak(utt)
  }
  if (ss.getVoices().length > 0) go()
  else ss.addEventListener('voiceschanged', go, { once: true })
}

const SWIPE_THRESHOLD = 60

const variants = {
  enter: (dir: number) => ({ x: dir >= 0 ? '55%' : '-55%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (dir: number) => ({ x: dir >= 0 ? '-55%' : '55%', opacity: 0 }),
}

const transition = {
  type: 'spring' as const,
  stiffness: 340,
  damping: 30,
  mass: 0.85,
}

interface Props { level: number; words: GREWord[] }

export default function MasteredClient({ level, words }: Props) {
  const router = useRouter()
  const [mastered, setMastered] = useState<GREWord[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [direction, setDirection]   = useState(1)
  const activeChipRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    const completed = completedInLevel(level)
    setMastered(words.filter(w => completed.includes(w.word)))
  }, [level, words])

  useEffect(() => {
    activeChipRef.current?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }, [currentIdx])

  const goTo = useCallback((idx: number) => {
    setDirection(idx >= currentIdx ? 1 : -1)
    setCurrentIdx(idx)
  }, [currentIdx])

  const len = mastered.length
  const w = mastered[currentIdx]

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
          {/* Card stage — clips entering/exiting cards */}
          <div className={styles.cardStage}>
            <AnimatePresence custom={direction} mode="popLayout">
              <motion.div
                key={currentIdx}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={transition}
                className={styles.slide}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.12}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -SWIPE_THRESHOLD && currentIdx < len - 1) goTo(currentIdx + 1)
                  else if (info.offset.x > SWIPE_THRESHOLD && currentIdx > 0)   goTo(currentIdx - 1)
                }}
              >
                {w && (() => {
                  const correctSentence = w.sentences.find(s => s.correct)?.sentence ?? ''
                  const wlen = w.word.length
                  const wordSize = wlen <= 8 ? undefined : wlen <= 11 ? '1.8rem' : wlen <= 14 ? '1.5rem' : '1.2rem'
                  return (
                    <div className={styles.card}>
                      <div className={styles.cardTop}>
                        <BookmarkButton word={w.word} definition={w.definition} size={18} />
                        <button
                          className={styles.speakBtn}
                          onClick={e => { e.stopPropagation(); speak(w.word) }}
                          aria-label="Pronounce"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M11 5L6 9H2v6h4l5 4V5Z" fill="currentColor"/>
                            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        </button>
                      </div>

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
                    </div>
                  )
                })()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Word strip */}
          <div className={styles.wordStrip}>
            {mastered.map((word, i) => (
              <button
                key={word.word}
                ref={i === currentIdx ? activeChipRef : null}
                className={`${styles.wordChip} ${i === currentIdx ? styles.wordChipActive : ''}`}
                onClick={() => goTo(i)}
              >
                <span className={styles.chipNum}>{i + 1}</span>
                {word.word}
              </button>
            ))}
          </div>
        </>
      )}

    </div>
  )
}
