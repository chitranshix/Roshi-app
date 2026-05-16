'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { syncAll } from '@/lib/sync'
import { completedInLevel, getRetryWords, isLevelUnlocked } from '@/lib/progress'
import { getStreak } from '@/lib/daily'
import Avatar from '@/components/ui/Avatar'
import styles from './page.module.css'

const WORDS_PER_LEVEL = 100
const LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9]

function getCurrentLevel(): number {
  for (const lv of LEVELS) {
    if (isLevelUnlocked(lv) && completedInLevel(lv).length < WORDS_PER_LEVEL) return lv
  }
  return 9
}

export default function Home() {
  const router = useRouter()
  const [ready, setReady]       = useState(false)
  const [level, setLevel]       = useState(1)
  const [mastered, setMastered] = useState<string[]>([])
  const [retry, setRetry]       = useState<string[]>([])
  const [streak, setStreak]     = useState(0)
  const [name, setName]         = useState('')

  useEffect(() => {
    function load() {
      const lv = getCurrentLevel()
      setLevel(lv)
      setMastered(completedInLevel(lv))
      setRetry(getRetryWords(lv))
      setStreak(getStreak().count)
      setReady(true)
    }

    const name = localStorage.getItem('roshi_name')
    if (name) setName(name)
    if (!name) {
      createClient().auth.getUser().then(({ data: { user } }) => {
        if (!user) { router.replace('/login'); return }
        createClient().from('users').select('name').eq('id', user.id).single()
          .then(({ data: profile }) => {
            if (!profile?.name) { router.replace('/login'); return }
            localStorage.setItem('roshi_name', profile.name)
            setName(profile.name)
            load()
          })
      })
      return
    }
    load()
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (user) syncAll(user.id)
    })
  }, [router])

  const activeTileRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    activeTileRef.current?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }, [level])

  function selectLevel(lv: number) {
    if (!isLevelUnlocked(lv)) return
    setLevel(lv)
    setMastered(completedInLevel(lv))
    setRetry(getRetryWords(lv))
  }

  if (!ready) return <div className={styles.table} />

  const remaining    = WORDS_PER_LEVEL - mastered.length
  const lastMastered = mastered[mastered.length - 1] ?? null
  const lastRetry    = retry[retry.length - 1] ?? null

  return (
    <div className={styles.table}>

      <div className={styles.header}>
        <span className={styles.levelTag}>LEVEL {level}</span>
        <div className={styles.topNav}>
          <Link href="/streak" className={styles.navIcon} aria-label="Streak">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="17" rx="2" stroke="rgba(255,255,255,0.65)" strokeWidth="1.8"/>
              <path d="M3 9h18" stroke="rgba(255,255,255,0.65)" strokeWidth="1.8"/>
              <path d="M8 2v4M16 2v4" stroke="rgba(255,255,255,0.65)" strokeWidth="1.8" strokeLinecap="round"/>
              <circle cx="8" cy="13" r="1.2" fill="rgba(255,255,255,0.65)"/>
              <circle cx="12" cy="13" r="1.2" fill="rgba(255,255,255,0.65)"/>
              <circle cx="16" cy="13" r="1.2" fill="rgba(255,255,255,0.65)"/>
              <circle cx="8" cy="17" r="1.2" fill="rgba(255,255,255,0.65)"/>
              <circle cx="12" cy="17" r="1.2" fill="rgba(255,255,255,0.65)"/>
            </svg>
            {streak > 0 && <span className={styles.navBadge}>{streak}</span>}
          </Link>
          <Link href="/leaderboard" className={styles.navIcon} aria-label="Leaderboard">
            <svg width="26" height="38" viewBox="0 0 24 24" fill="none">
              <path d="M8 21H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h3v8z" stroke="rgba(255,255,255,0.65)" strokeWidth="1.6" fill="none"/>
              <path d="M15 21H9V8a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v13z" stroke="rgba(255,255,255,0.65)" strokeWidth="1.6" fill="none"/>
              <path d="M21 21h-6v-8a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v8z" stroke="rgba(255,255,255,0.65)" strokeWidth="1.6" fill="none"/>
              <path d="M3 21h18" stroke="rgba(255,255,255,0.65)" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </Link>
          <Link href="/profile" className={styles.navIcon} aria-label="Profile">
            <Avatar name={name} size={28} className={styles.navAvatar} />
          </Link>
        </div>
      </div>

      <div className={styles.piles}>

        {/* Retry pile */}
        <div className={styles.pile}>
          {lastRetry ? (
            <div className={`${styles.card} ${styles.cardRetry}`}>
              <span className={styles.pileWord}>{lastRetry}</span>
            </div>
          ) : (
            <div className={`${styles.card} ${styles.cardGhost}`}>
              <span className={styles.ghostHint}>words you miss land here</span>
            </div>
          )}
          <div className={styles.pileMeta}>
            <span className={styles.pileNum}>{retry.length}</span>
            <span className={styles.pileLabel}>RETRY</span>
          </div>
        </div>

        {/* Center deck — tap to play */}
        <div className={styles.deckPile} onClick={() => router.push(`/play/${level}`)}>
          <div className={`${styles.card} ${styles.cardDeck}`}>
            <div className={styles.deckInner}>
              <span className={styles.deckNum}>{remaining}</span>
              <span className={styles.deckRemLabel}>{mastered.length === 0 ? 'words await' : 'left'}</span>
            </div>
          </div>
          <div className={styles.pileMeta}>
            <span className={styles.playHint}>
              {mastered.length === 0 ? 'Begin →' : 'Continue →'}
            </span>
          </div>
        </div>

        {/* Mastered pile */}
        <div className={styles.pile}>
          {lastMastered ? (
            <div className={`${styles.card} ${styles.cardMastered}`}>
              <span className={styles.pileWord}>{lastMastered}</span>
            </div>
          ) : (
            <div className={`${styles.card} ${styles.cardGhost}`}>
              <span className={styles.ghostHint}>words you nail stack here</span>
            </div>
          )}
          <div className={styles.pileMeta}>
            <span className={styles.pileNum}>{mastered.length}</span>
            <span className={styles.pileLabel}>MASTERED</span>
          </div>
        </div>

      </div>

      {/* Level strip */}
      <div className={styles.levelStrip}>
        {LEVELS.map(lv => {
          const locked   = !isLevelUnlocked(lv)
          const active   = lv === level
          const count    = completedInLevel(lv).length
          const done     = count >= WORDS_PER_LEVEL
          return (
            <button
              key={lv}
              ref={active ? activeTileRef : null}
              className={[
                styles.levelTile,
                active  ? styles.levelTileActive : '',
                locked  ? styles.levelTileLocked : '',
                done    ? styles.levelTileDone   : '',
              ].filter(Boolean).join(' ')}
              onClick={() => selectLevel(lv)}
              disabled={locked}
              aria-label={`Level ${lv}`}
            >
              <span className={styles.levelTileNum}>{done ? '✓' : lv}</span>
              <div className={styles.levelTileBar}>
                <div
                  className={styles.levelTileBarFill}
                  style={{ width: `${Math.round((count / WORDS_PER_LEVEL) * 100)}%` }}
                />
              </div>
            </button>
          )
        })}
      </div>

    </div>
  )
}
