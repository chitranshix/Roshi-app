'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import ThemeToggle from '@/components/ui/ThemeToggle'
import RoshiDisplay from '@/components/mascot/RoshiDisplay'
import SpeechBubble from '@/components/ui/SpeechBubble'
import { createClient } from '@/lib/supabase'
import type { RoshiExpression } from '@/components/mascot/Roshi'
import styles from './page.module.css'

interface Slide {
  expression: RoshiExpression
  lines: string[]
}

const SLIDES: Slide[] = [
  {
    expression: 'idle',
    lines: [
      "Hii, I'm Roshi.",
      "I know a great many words. You probably don't. But I suppose I can help with that.",
    ],
  },
  {
    expression: 'idle',
    lines: [
      "Here's the game —",
      "You dare your friends with a word you know. They dare you back.",
      "No friends? You can play with me.",
    ],
  },
  {
    expression: 'happy',
    lines: [
      "Each dare comes with a word and 4 sentences. 1 of the sentences is correct. (The others exist purely to embarrass you...)",
      "Get the sentence right and you get to define the word. Get that right too and you get points. Fail either one and well... you try again.",
    ],
  },
  {
    expression: 'idle',
    lines: [
      "Now, what should I call you?",
    ],
  },
]

export default function OnboardingPage() {
  const [page, setPage] = useState(0)
  const [name, setName] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const router = useRouter()

  const slide      = SLIDES[page]
  const isLastPage = page === SLIDES.length - 1

  const handleContinue = async () => {
    if (!isLastPage) { setPage(p => p + 1); return }
    if (name.trim().length < 2) return
    setSending(true)
    localStorage.setItem('roshi_name', name.trim())
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInAnonymously()
    if (!error && data.user) {
      await supabase.from('users').upsert({ id: data.user.id, name: name.trim() })
    }
    setSending(false)
    if (!error) { setSent(true); router.replace('/') }

    // Email OTP flow (commented out — requires verified domain on Resend)
    // const { error } = await supabase.auth.signInWithOtp({
    //   email: email.trim(),
    //   options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    // })
  }

  return (
    <div className={styles.screen}>

      {/* ── Header: full-width, logo left, toggle right ── */}
      <div className={styles.header}>
        <img src="/logo-light.png" alt="Roshi's Word Game" className={`${styles.logo} ${styles.logoLight}`} />
        <img src="/logo-dark.png"  alt="Roshi's Word Game" className={`${styles.logo} ${styles.logoDark}`} />
        <ThemeToggle />
      </div>

      <div className={styles.body}>

        {/* ── Dots — clickable for direct navigation ── */}
        <div className={styles.dots}>
          {SLIDES.map((_, i) => (
            <button
              key={i}
              className={[styles.dot, i === page ? styles.dotActive : ''].join(' ')}
              onClick={() => setPage(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Only the bubble changes — Roshi and button stay fixed below */}
        <div className={styles.bubbleWrap}>
          <SpeechBubble key={page} className={styles.bubbleAnim} tail="bottom-right">
            {slide.lines.map((line, i) => (
              <p key={i} className={styles.bubbleLine}>{line}</p>
            ))}
          </SpeechBubble>
        </div>

        {/* Fixed bottom section — never shifts */}
        <div className={styles.bottomSection}>
          <div className={styles.mascotArea}>
            <RoshiDisplay expression={slide.expression} size={130} />
          </div>

          {isLastPage ? (
            sent ? (
              <p className={styles.sentMsg}>You&apos;re in. Loading…</p>
            ) : (
              <div className={styles.nameCol}>
                <div className={styles.nameRow}>
                  <input
                    className={[styles.input, name.length > 0 && name.trim().length < 2 ? styles.inputError : ''].join(' ')}
                    placeholder="Your name (required)..."
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleContinue()}
                    maxLength={20}
                    autoFocus
                  />
                  <Button
                    onClick={handleContinue}
                    disabled={name.trim().length < 2 || sending}
                  >
                    {sending ? '…' : "Let's go!"}
                  </Button>
                </div>
                {/* Email input commented out — re-enable when domain verified on Resend
                <div className={styles.nameRow}>
                  <input
                    className={[styles.input, email.length > 0 && !email.includes('@') ? styles.inputError : ''].join(' ')}
                    placeholder="Your email (required)..."
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div> */}
              </div>
            )
          ) : (
            <Button onClick={handleContinue}>Continue</Button>
          )}
        </div>

      </div>

    </div>
  )
}
