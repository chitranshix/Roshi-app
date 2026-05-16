'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from 'framer-motion'
import type { GREWord } from '@/lib/gre-words'
import styles from './play.module.css'

type Face = 'word' | 'mcq' | 'definition' | 'result'
type Glow = 'none' | 'correct' | 'wrong'

interface Props {
  word: GREWord
  level: number
  muted: boolean
  onMastered: (pts: number) => void
  onRetry: (pts: number) => void
  onMcqWrong: (word: string) => void
}

const SWIPE_THRESHOLD = 90

// ── Ink stamp result illustrations ─────────────────────────────────────────
function StampMiss() {
  return (
    <svg width="128" height="68" viewBox="0 0 128 68" fill="none">
      <g transform="rotate(-4, 64, 34)">
        <rect x="3" y="3" width="122" height="62" rx="5" stroke="#CC3333" strokeWidth="3" strokeOpacity="0.85"/>
        <rect x="9" y="9" width="110" height="50" rx="3" stroke="#CC3333" strokeWidth="1.5" strokeOpacity="0.85"/>
        <text x="64" y="43" textAnchor="middle" fontSize="21" fontWeight="900" letterSpacing="5" fill="#CC3333" fillOpacity="0.85" fontFamily="system-ui, sans-serif">MISS</text>
      </g>
    </svg>
  )
}

function StampAlmost() {
  return (
    <svg width="128" height="68" viewBox="0 0 128 68" fill="none">
      <g transform="rotate(3, 64, 34)">
        <rect x="3" y="3" width="122" height="62" rx="5" stroke="#b08d57" strokeWidth="3" strokeOpacity="0.85"/>
        <rect x="9" y="9" width="110" height="50" rx="3" stroke="#b08d57" strokeWidth="1.5" strokeOpacity="0.85"/>
        <text x="64" y="43" textAnchor="middle" fontSize="21" fontWeight="900" letterSpacing="5" fill="#b08d57" fillOpacity="0.85" fontFamily="system-ui, sans-serif">ALMOST</text>
      </g>
    </svg>
  )
}

function StampAce() {
  return (
    <svg width="148" height="68" viewBox="0 0 148 68" fill="none">
      <g transform="rotate(-2, 74, 34)">
        <rect x="3" y="3" width="142" height="62" rx="5" stroke="#1b4332" strokeWidth="3" strokeOpacity="0.85"/>
        <rect x="9" y="9" width="130" height="50" rx="3" stroke="#1b4332" strokeWidth="1.5" strokeOpacity="0.85"/>
        <text x="74" y="43" textAnchor="middle" fontSize="17" fontWeight="900" letterSpacing="3" fill="#1b4332" fillOpacity="0.85" fontFamily="system-ui, sans-serif">NAILED IT</text>
      </g>
    </svg>
  )
}
// ────────────────────────────────────────────────────────────────────────────

const DIFFICULTY: Record<number, string> = {
  1: 'EASY', 2: 'EASY', 3: 'EASY',
  4: 'MEDIUM', 5: 'MEDIUM', 6: 'MEDIUM',
  7: 'HARD', 8: 'HARD', 9: 'HARD',
}

export default function WordCard({ word, level, muted, onMastered, onRetry, onMcqWrong }: Props) {
  const [face, setFace] = useState<Face>('word')
  const [sentences] = useState(() => [...word.sentences].sort(() => Math.random() - 0.5))
  const [selected, setSelected] = useState<number | null>(null)
  const [mcqCorrect, setMcqCorrect] = useState(false)
  const [userDef, setUserDef] = useState('')
  const [checking, setChecking] = useState(false)
  const [defCorrect, setDefCorrect] = useState<boolean | null>(null)
  const [pts, setPts] = useState(0)
  const [swiping, setSwiping] = useState(false)
  const [glow, setGlow] = useState<Glow>('none')
  const [showFail, setShowFail] = useState(false)
  // floatingPts: earned points + screen coords to animate card→HUD
  const [floatingPts, setFloatingPts] = useState<{
    val: number; correct: boolean
    startX: number; startY: number
    dx: number; dy: number
  } | null>(null)
  const textareaRef  = useRef<HTMLTextAreaElement>(null)
  const defActionsRef = useRef<HTMLDivElement>(null)

  // Robust speak — handles Chrome's async voice loading and stuck-paused bug
  const doSpeak = useCallback((w: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    const ss = window.speechSynthesis
    if (ss.paused) ss.resume()
    ss.cancel()
    const utt = new SpeechSynthesisUtterance(w)
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
  }, [])

  // Auto-pronounce on mount
  useEffect(() => {
    if (muted) return
    const id = setTimeout(() => doSpeak(word.word), 150)
    return () => clearTimeout(id)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const x             = useMotionValue(0)
  const yMV           = useMotionValue(0)
  const sMV           = useMotionValue(1)
  const aMV           = useMotionValue(1)
  const rotate         = useTransform(x, [-220, 220], [-8, 8])
  const masteredOpacity = useTransform(x, [20, SWIPE_THRESHOLD], [0, 1])
  const retryOpacity   = useTransform(x, [-20, -SWIPE_THRESHOLD], [0, 1])

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

  // Auto-advance after result face — direction depends on whether MCQ was correct
  useEffect(() => {
    if (face !== 'result' || swiping) return
    const timer = mcqCorrect
      ? setTimeout(() => void flyAway('right', pts), 5000)  // mastered
      : setTimeout(() => void flyAway('left',  0),   6500)  // wrong — retry after absorbing
    return () => clearTimeout(timer)
  }, [face, swiping, pts, mcqCorrect, flyAway])

  const playSound = useCallback((file: string) => {
    if (muted || typeof window === 'undefined') return
    const audio = new Audio(`/${file}`)
    audio.play().catch(() => {})
  }, [muted])

  const speak = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    doSpeak(word.word)
  }, [doSpeak, word.word])

  const pickSentence = useCallback(async (i: number) => {
    if (selected !== null) return
    const correct = sentences[i]?.correct ?? false
    setSelected(i)
    setMcqCorrect(correct)

    if (correct) {
      // Subtle green glow, then transition to definition
      setGlow('correct')
      await new Promise(r => setTimeout(r, 1200))
      setGlow('none')
      setFace('definition')
      setTimeout(() => textareaRef.current?.focus(), 80)
    } else {
      onMcqWrong(word.word)  // save immediately — user may navigate away before auto-flyaway
      // Red vignette + shake, then reveal correct answer before flying away
      playSound('Disappointed - Sound Effect (HD).mp3')
      setGlow('wrong')
      setShowFail(true)
      await animate(x, [0, -18, 15, -11, 9, -5, 0], { duration: 0.5, ease: 'easeInOut' })
      setShowFail(false)
      setGlow('none')
      setFace('result')
    }
  }, [selected, sentences, flyAway, x, playSound])

  const spawnFloat = useCallback((val: number, correct: boolean) => {
    const vw = window.innerWidth
    const vh = window.innerHeight
    // Card is centered horizontally, vertically between top-pad (60px) and floor (160px)
    const startX = vw / 2
    const startY = (vh - 220) / 2 + 60
    // HUD lives at top-right: right:1.5rem, centred on the points number (~70px from right edge)
    const hudX = vw - 70
    const hudY = 36
    setFloatingPts({ val, correct, startX, startY, dx: hudX - startX, dy: hudY - startY })
    setTimeout(() => setFloatingPts(null), 2400)
  }, [])

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
      if (correct) playSound('Yayyy! Sound Effect.mp3')
      setDefCorrect(correct)
      setPts(earned)
      spawnFloat(earned, correct)
    } catch {
      setDefCorrect(null)
      setPts(3)
      spawnFloat(3, false)
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

  const len = word.word.length
  const wordFontSize = len <= 8 ? undefined : len <= 11 ? '2.4rem' : len <= 14 ? '1.9rem' : '1.5rem'

  const canDrag   = face === 'result' && !swiping && mcqCorrect
  const isFlipped = face !== 'word'
  const correctSentence = sentences.find(s => s.correct)?.sentence
  const resultMeta = !mcqCorrect ? 'WRONG' : defCorrect === true ? 'NAILED IT' : 'CLOSE ENOUGH'
  const difficulty = DIFFICULTY[level] ?? 'MEDIUM'

  const backFaceClass = [
    styles.cardFace, styles.faceBack,
    glow === 'correct' ? styles.cardGlowCorrect : '',
    glow === 'wrong'   ? styles.cardGlowWrong   : '',
    face === 'result' && !mcqCorrect ? styles.cardFaceWrongResult : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={styles.cardWrap}>

      <motion.div className={styles.swipeLabelRight} style={{ opacity: masteredOpacity }}>MASTERED</motion.div>
      <motion.div className={styles.swipeLabelLeft}  style={{ opacity: retryOpacity }}>RETRY</motion.div>

      {/* Crimson vignette — wrong answer */}
      <AnimatePresence>
        {showFail && (
          <motion.div
            className={styles.screenFlash}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.5, times: [0, 0.25, 1] }}
          />
        )}
      </AnimatePresence>

      {/* Floating points — fixed-position, travels from card center to HUD */}
      <AnimatePresence>
        {floatingPts && (
          <motion.div
            initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            animate={{ opacity: 0, x: floatingPts.dx, y: floatingPts.dy, scale: 0.55 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.0, ease: [0.25, 0.6, 0.3, 1] }}
            style={{
              position: 'fixed',
              left: floatingPts.startX,
              top: floatingPts.startY,
              translateX: '-50%',
              translateY: '-50%',
              fontFamily: 'var(--font-fraunces), Georgia, serif',
              fontStyle: 'italic',
              fontWeight: 900,
              fontSize: '3.5rem',
              color: floatingPts.correct ? '#538D4E' : '#b08d57',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              zIndex: 999,
            }}
          >
            +{floatingPts.val}
          </motion.div>
        )}
      </AnimatePresence>

      <div className={styles.cardEntry}>
        <motion.div
          style={{ x, y: yMV, scale: sMV, opacity: aMV, rotate, cursor: canDrag ? 'grab' : 'default' }}
          drag={canDrag ? 'x' : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.65}
          onDragEnd={handleDragEnd}
        >
          <div className={styles.perspective}>
            <div className={[styles.cardFlip, isFlipped ? styles.flipped : ''].filter(Boolean).join(' ')}>

              {/* FRONT — word */}
              <div
                className={[styles.cardFace, styles.faceFront].join(' ')}
                onClick={face === 'word' ? () => setFace('mcq') : undefined}
                style={{ cursor: face === 'word' ? 'pointer' : 'default' }}
              >
                <div className={styles.faceTopRow}>
                  <span className={styles.metaLabel}>LEVEL {level}</span>
                  <button className={styles.speakBtn} onClick={speak} aria-label="Pronounce">
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                      <path d="M11 5L6 9H2v6h4l5 4V5Z" fill="currentColor"/>
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
                <div className={styles.wordArea}>
                  <h1 className={styles.wordDisplay} style={wordFontSize ? { fontSize: wordFontSize } : undefined}>
                    {word.word}
                  </h1>
                  <div className={styles.wordDivider} />
                </div>
                <div className={styles.faceBottomRow}>
                  <span className={styles.difficultyLabel}>{difficulty}</span>
                  <span className={styles.frontPts}>+5</span>
                </div>
              </div>

              {/* BACK — mcq / definition / result */}
              <div className={backFaceClass}>

                {face === 'mcq' && <>
                  <div className={styles.faceTopRow}>
                    <span className={styles.metaLabel}>WHICH SENTENCE IS RIGHT?</span>
                    <button className={styles.speakBtn} onClick={speak} aria-label="Pronounce">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M11 5L6 9H2v6h4l5 4V5Z" fill="currentColor"/>
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                  <div className={styles.wordSmall} style={wordFontSize ? { fontSize: wordFontSize } : undefined}>
                    {word.word}
                  </div>
                  <div className={styles.options}>
                    {sentences.map((s, i) => {
                      const isSel   = selected === i
                      const isRight = selected !== null && isSel && s.correct
                      const isWrong = selected !== null && isSel && !s.correct
                      return (
                        <button
                          key={i}
                          className={[styles.option, isRight ? styles.optionCorrect : '', isWrong ? styles.optionWrong : ''].filter(Boolean).join(' ')}
                          onClick={() => void pickSentence(i)}
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
                  <div className={styles.wordSmall} style={wordFontSize ? { fontSize: wordFontSize } : undefined}>
                    {word.word}
                  </div>
                  <div className={styles.defArea}>
                    <textarea
                      ref={textareaRef}
                      className={styles.defInput}
                      placeholder="Define…"
                      value={userDef}
                      onChange={e => setUserDef(e.target.value)}
                      onFocus={() => setTimeout(() => defActionsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 350)}
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
                  <div ref={defActionsRef} className={styles.defActions}>
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
                  <div className={styles.resultMain}>
                    <div className={styles.resultIllustration}>
                      {!mcqCorrect && <StampMiss />}
                      {mcqCorrect && defCorrect === true && <StampAce />}
                      {mcqCorrect && defCorrect !== true && <StampAlmost />}
                    </div>
                    <div className={styles.resultInfo}>
                      <div className={styles.wordSmall} style={wordFontSize ? { fontSize: wordFontSize } : undefined}>
                        {word.word}
                      </div>
                      {!mcqCorrect && correctSentence && (
                        <div className={styles.correctSentence}>
                          <div className={styles.correctSentenceLabel}>CORRECT USAGE</div>
                          <p className={styles.correctSentenceText}>{correctSentence}</p>
                        </div>
                      )}
                      <div className={styles.correctSentence}>
                        <div className={styles.correctSentenceLabel}>DEFINITION</div>
                        <p className={styles.defRevealText}>{word.definition}</p>
                      </div>
                    </div>
                  </div>
                  {mcqCorrect && (
                    <div className={styles.swipeCue}>
                      <span>← retry</span>
                      <span>mastered →</span>
                    </div>
                  )}
                </>}

              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
