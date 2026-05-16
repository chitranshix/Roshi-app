'use client'

import { useState, useCallback, useRef } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import type { GREWord } from '@/lib/gre-words'
import styles from './play.module.css'

type Face = 'word' | 'mcq' | 'definition' | 'result'

interface Props {
  word: GREWord
  level: number
  onMastered: (pts: number) => void
  onRetry: (pts: number) => void
}

const SWIPE_THRESHOLD = 90

export default function WordCard({ word, level, onMastered, onRetry }: Props) {
  const [face, setFace] = useState<Face>('word')
  const [sentences] = useState(() => [...word.sentences].sort(() => Math.random() - 0.5))
  const [selected, setSelected] = useState<number | null>(null)
  const [mcqCorrect, setMcqCorrect] = useState(false)
  const [userDef, setUserDef] = useState('')
  const [checking, setChecking] = useState(false)
  const [defCorrect, setDefCorrect] = useState<boolean | null>(null)
  const [pts, setPts] = useState(0)
  const [swiping, setSwiping] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // x drives drag tilt + swipe hint opacity
  const x             = useMotionValue(0)
  const yMV           = useMotionValue(0)
  const sMV           = useMotionValue(1)
  const aMV           = useMotionValue(1)
  const rotate         = useTransform(x, [-220, 220], [-8, 8])
  const masteredOpacity = useTransform(x, [20, SWIPE_THRESHOLD], [0, 1])
  const retryOpacity   = useTransform(x, [-20, -SWIPE_THRESHOLD], [0, 1])

  // Fly-away: diagonal + shrink (matches POC)
  const flyAway = useCallback(async (direction: 'left' | 'right', earnedPts: number) => {
    setSwiping(true)
    const tx = direction === 'right' ? 1100 : -1100
    await Promise.all([
      animate(x,   tx,   { duration: 0.42, ease: [0.4, 0, 0.8, 0.2] }),
      animate(yMV, 360,  { duration: 0.42, ease: [0.4, 0, 0.8, 0.2] }),
      animate(sMV, 0.05, { duration: 0.42, ease: [0.4, 0, 0.8, 0.2] }),
      animate(aMV, 0,    { duration: 0.26 }),
    ])
    if (direction === 'right') onMastered(earnedPts)
    else onRetry(earnedPts)
  }, [x, yMV, sMV, aMV, onMastered, onRetry])

  const speak = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (typeof window === 'undefined') return
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(word.word)
    utt.rate = 0.82
    window.speechSynthesis.speak(utt)
  }, [word.word])

  const pickSentence = useCallback((i: number) => {
    if (selected !== null) return
    const correct = sentences[i]?.correct ?? false
    setSelected(i)
    setMcqCorrect(correct)
    if (correct) {
      setTimeout(() => {
        setFace('definition')
        setTimeout(() => textareaRef.current?.focus(), 80)
      }, 700)
    } else {
      setTimeout(() => void flyAway('left', 0), 950)
    }
  }, [selected, sentences, flyAway])

  const submitDefinition = useCallback(async () => {
    if (userDef.trim().length < 3 || checking) return
    setChecking(true)
    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: word.word, definition: userDef, actualDefinition: word.definition }),
      })
      const { correct } = await res.json()
      const earned = correct ? 5 : 3
      setDefCorrect(correct)
      setPts(earned)
    } catch {
      setDefCorrect(null)
      setPts(3)
    } finally {
      setChecking(false)
      setFace('result')
    }
  }, [word.word, word.definition, userDef, checking])

  const handleDragEnd = useCallback((_: unknown, info: { offset: { x: number } }) => {
    const dx = info.offset.x
    if (dx > SWIPE_THRESHOLD)       void flyAway('right', pts)
    else if (dx < -SWIPE_THRESHOLD) void flyAway('left', 0)
    else void animate(x, 0, { type: 'spring', stiffness: 400, damping: 25 })
  }, [x, pts, flyAway])

  const canDrag   = face === 'result' && !swiping
  const isFlipped = face !== 'word'
  const correctSentence = sentences.find(s => s.correct)?.sentence
  const resultMeta = !mcqCorrect ? 'WRONG' : defCorrect === true ? 'NAILED IT' : 'CLOSE ENOUGH'

  return (
    <div className={styles.cardWrap}>

      {/* Swipe hints */}
      <motion.div className={styles.swipeLabelRight} style={{ opacity: masteredOpacity }}>MASTERED</motion.div>
      <motion.div className={styles.swipeLabelLeft}  style={{ opacity: retryOpacity }}>RETRY</motion.div>

      {/*
        CSS wrapper handles the drop-in entry animation (reliable, no JS timing issues).
        motion.div inside handles drag + fly-away via motion values.
      */}
      <div className={styles.cardEntry}>
        <motion.div
          style={{ x, y: yMV, scale: sMV, opacity: aMV, rotate, cursor: canDrag ? 'grab' : 'default' }}
          drag={canDrag ? 'x' : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.65}
          onDragEnd={handleDragEnd}
        >
          {/* Perspective for 3D flip */}
          <div className={styles.perspective}>
            <div className={[styles.cardFlip, isFlipped ? styles.flipped : ''].filter(Boolean).join(' ')}>

              {/* FRONT — word */}
              <div
                className={[styles.cardFace, styles.faceFront].join(' ')}
                onClick={face === 'word' ? () => setFace('mcq') : undefined}
                style={{ cursor: face === 'word' ? 'pointer' : 'default' }}
              >
                <div className={styles.faceTopRow}>
                  <span className={styles.metaLabel}>CLASSIC</span>
                  <span className={styles.metaPtsGreen}>+5</span>
                </div>
                <div className={styles.wordArea}>
                  <h1 className={styles.wordDisplay}>{word.word}</h1>
                  <div className={styles.wordDivider} />
                </div>
                <div className={styles.levelLabel}>LEVEL {level}</div>
              </div>

              {/* BACK — mcq / definition / result */}
              <div className={[styles.cardFace, styles.faceBack].join(' ')}>

                {face === 'mcq' && <>
                  <div className={styles.faceTopRow}>
                    <span className={styles.metaLabel}>SELECT CONTEXT</span>
                    <button className={styles.speakBtn} onClick={speak} aria-label="Pronounce">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M11 5L6 9H2v6h4l5 4V5Z" fill="currentColor"/>
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                  <div className={styles.wordSmall}>{word.word}</div>
                  <div className={styles.options}>
                    {sentences.map((s, i) => {
                      const isSel   = selected === i
                      const isRight = selected !== null && isSel && s.correct
                      const isWrong = selected !== null && isSel && !s.correct
                      return (
                        <button
                          key={i}
                          className={[styles.option, isRight ? styles.optionCorrect : '', isWrong ? styles.optionWrong : ''].filter(Boolean).join(' ')}
                          onClick={() => pickSentence(i)}
                          disabled={selected !== null}
                        >
                          {s.sentence}
                        </button>
                      )
                    })}
                  </div>
                </>}

                {face === 'definition' && <>
                  <div className={styles.faceTopRow}>
                    <span className={styles.metaLabel}>DEFINE IT</span>
                  </div>
                  <div className={styles.wordSmall}>{word.word}</div>
                  <div className={styles.defArea}>
                    <textarea
                      ref={textareaRef}
                      className={styles.defInput}
                      placeholder="Define…"
                      value={userDef}
                      onChange={e => setUserDef(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey && userDef.trim().length >= 3) {
                          e.preventDefault()
                          void submitDefinition()
                        }
                      }}
                      maxLength={200}
                      inputMode="text"
                      enterKeyHint="done"
                    />
                  </div>
                  <div className={styles.defActions}>
                    <button className={styles.submitBtn} onClick={() => void submitDefinition()} disabled={userDef.trim().length < 3 || checking}>
                      {checking ? 'Checking…' : 'Submit'}
                    </button>
                    <button className={styles.skipBtn} onClick={() => void flyAway('left', 1)}>
                      I don&apos;t know (+1)
                    </button>
                  </div>
                </>}

                {face === 'result' && <>
                  <div className={styles.faceTopRow}>
                    <span className={styles.metaLabel}>{resultMeta}</span>
                    <span className={[
                      styles.metaPtsGreen,
                      !mcqCorrect ? styles.metaPtsRed : defCorrect === false ? styles.metaPtsAmber : '',
                    ].filter(Boolean).join(' ')}>
                      {pts > 0 ? `+${pts}` : '0'}
                    </span>
                  </div>
                  <div className={styles.wordArea}>
                    <h1 className={styles.wordDisplay}>{word.word}</h1>
                    <div className={styles.wordDivider} />
                  </div>
                  <div className={styles.resultBody}>
                    {!mcqCorrect && correctSentence && (
                      <div className={styles.correctSentence}>
                        <div className={styles.correctSentenceLabel}>CORRECT USAGE</div>
                        <p className={styles.correctSentenceText}>{correctSentence}</p>
                      </div>
                    )}
                    <p className={styles.defRevealText}>{word.definition}</p>
                  </div>
                  <div className={styles.swipeCue}>
                    <span>← retry</span>
                    <span>mastered →</span>
                  </div>
                </>}

              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
