'use client'

import { useState, useCallback, useRef } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import type { GREWord } from '@/lib/gre-words'
import styles from './play.module.css'

type Face = 'word' | 'mcq' | 'definition' | 'result'

interface Props {
  word: GREWord
  onMastered: (pts: number) => void
  onRetry: () => void
}

const SWIPE_THRESHOLD = 100

export default function WordCard({ word, onMastered, onRetry }: Props) {
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

  const x = useMotionValue(0)
  const rotate = useTransform(x, [-220, 220], [-12, 12])
  const masteredOpacity = useTransform(x, [20, 100], [0, 1])
  const retryOpacity = useTransform(x, [-20, -100], [0, 1])

  const speak = useCallback(() => {
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
      setPts(0)
      setTimeout(() => setFace('result'), 900)
    }
  }, [selected, sentences])

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
    if (dx > SWIPE_THRESHOLD) {
      setSwiping(true)
      animate(x, 600, { duration: 0.25, ease: 'easeIn' }).then(() => onMastered(pts))
    } else if (dx < -SWIPE_THRESHOLD) {
      setSwiping(true)
      animate(x, -600, { duration: 0.25, ease: 'easeIn' }).then(() => onRetry())
    } else {
      animate(x, 0, { type: 'spring', stiffness: 400, damping: 25 })
    }
  }, [x, pts, onMastered, onRetry])

  const canDrag = face === 'result' && !swiping

  const correctSentence = sentences.find(s => s.correct)?.sentence

  const resultLabel = !mcqCorrect
    ? 'Wrong sentence.'
    : defCorrect === true ? 'Nailed it.'
    : 'Close enough.'

  return (
    <div className={styles.cardWrap}>

      {/* Swipe direction labels — fade in as user drags */}
      <motion.div className={styles.swipeHintRight} style={{ opacity: masteredOpacity }}>
        MASTERED
      </motion.div>
      <motion.div className={styles.swipeHintLeft} style={{ opacity: retryOpacity }}>
        RETRY
      </motion.div>

      <motion.div
        className={styles.card}
        style={{ x, rotate, cursor: canDrag ? 'grab' : 'default' }}
        drag={canDrag ? 'x' : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.7}
        onDragEnd={handleDragEnd}
      >

        {/* ── WORD FACE ── */}
        {face === 'word' && (
          <div className={styles.face}>
            <div className={styles.faceLabel}>MISSION WORD</div>
            <div className={styles.wordDisplay}>{word.word}</div>
            <button className={styles.speakBtn} onClick={speak} aria-label="Pronounce">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M11 5L6 9H2v6h4l5 4V5Z" fill="currentColor"/>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Pronounce
            </button>
            <button className={styles.flipBtn} onClick={() => setFace('mcq')}>
              Test yourself →
            </button>
          </div>
        )}

        {/* ── MCQ FACE ── */}
        {face === 'mcq' && (
          <div className={styles.face}>
            <div className={styles.faceLabel}>SENTENCE CHECK</div>
            <div className={styles.wordSmall}>{word.word}</div>
            <p className={styles.mcqPrompt}>Which sentence uses this word correctly?</p>
            <div className={styles.options}>
              {sentences.map((s, i) => {
                const isSelected = selected === i
                const isCorrect = selected !== null && isSelected && s.correct
                const isWrong = selected !== null && isSelected && !s.correct
                return (
                  <button
                    key={i}
                    className={[
                      styles.option,
                      isCorrect ? styles.optionCorrect : '',
                      isWrong ? styles.optionWrong : '',
                      isSelected && !isCorrect && !isWrong ? styles.optionSelected : '',
                    ].filter(Boolean).join(' ')}
                    onClick={() => pickSentence(i)}
                    disabled={selected !== null}
                  >
                    {s.sentence}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ── DEFINITION FACE ── */}
        {face === 'definition' && (
          <div className={styles.face}>
            <div className={styles.faceLabel}>DEFINE IT</div>
            <div className={styles.wordSmall}>{word.word}</div>
            <p className={styles.defPrompt}>Define it in your own words.</p>
            <textarea
              ref={textareaRef}
              className={styles.defInput}
              placeholder="Plain English is fine…"
              value={userDef}
              onChange={e => setUserDef(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey && userDef.trim().length >= 3) {
                  e.preventDefault()
                  submitDefinition()
                }
              }}
              maxLength={200}
              inputMode="text"
              enterKeyHint="done"
            />
            <button
              className={styles.submitBtn}
              onClick={submitDefinition}
              disabled={userDef.trim().length < 3 || checking}
            >
              {checking ? 'Checking…' : 'Submit'}
            </button>
          </div>
        )}

        {/* ── RESULT FACE ── */}
        {face === 'result' && (
          <div className={[
            styles.face,
            styles.resultFace,
            !mcqCorrect ? styles.resultFaceWrong : defCorrect ? styles.resultFaceCorrect : '',
          ].filter(Boolean).join(' ')}>
            <div className={styles.ptsDisplay}>{pts > 0 ? `+${pts}` : '0'}</div>
            <div className={styles.resultLabel}>{resultLabel}</div>

            {/* Show correct sentence when MCQ was wrong */}
            {!mcqCorrect && correctSentence && (
              <div className={styles.correctSentenceReveal}>
                <div className={styles.correctSentenceLabel}>Correct usage</div>
                <div className={styles.correctSentenceText}>{correctSentence}</div>
              </div>
            )}

            <div className={styles.definitionReveal}>
              <div className={styles.defRevealWord}>{word.word}</div>
              <div className={styles.defRevealText}>{word.definition}</div>
            </div>

            <div className={styles.swipeCue}>
              <span>← retry</span>
              <span>mastered →</span>
            </div>
          </div>
        )}

      </motion.div>
    </div>
  )
}
