'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { getProgress, completedInLevel } from '@/lib/progress'
import styles from './LevelHero.module.css'

const WORDS_PER_LEVEL = 100

export const LEVEL_NAMES: Record<number, string> = {
  1: 'Foundations',    2: 'Essentials',    3: 'Building Blocks',
  4: 'Expanding',      5: 'Intermediate',  6: 'Advanced',
  7: 'Proficient',     8: 'Expert',        9: 'Master',
  10: 'Scholar',       11: 'Virtuoso',
}

const DIFF: Record<number, string> = {
  1: 'Easy',   2: 'Easy',   3: 'Easy',
  4: 'Medium', 5: 'Medium', 6: 'Medium',
  7: 'Hard',   8: 'Hard',   9: 'Hard', 10: 'Hard', 11: 'Hard',
}

function MountainSilhouette() {
  return (
    <svg className={styles.worldSvg} width="120" height="72" viewBox="0 0 120 72" fill="none" aria-hidden="true">
      <path
        d="M0 72 L22 32 L40 50 L62 10 L84 38 L98 20 L120 44 L120 72 Z"
        fill="var(--muted)" opacity="0.14"
      />
      <path
        d="M0 72 L22 32 L40 50 L62 10 L84 38 L98 20 L120 44"
        stroke="var(--muted)" strokeWidth="1.5" strokeLinejoin="round" opacity="0.4"
      />
    </svg>
  )
}

function OceanSilhouette() {
  return (
    <svg className={styles.worldSvg} width="120" height="72" viewBox="0 0 120 72" fill="none" aria-hidden="true">
      {/* water body */}
      <path
        d="M0,30 C15,20 30,20 45,30 C60,40 75,40 90,30 C105,20 112,22 120,26 L120,72 L0,72 Z"
        fill="var(--muted)" opacity="0.14"
      />
      {/* surface wave */}
      <path
        d="M0,30 C15,20 30,20 45,30 C60,40 75,40 90,30 C105,20 112,22 120,26"
        stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round" opacity="0.45"
      />
      {/* deeper undercurrent */}
      <path
        d="M0,46 C15,40 30,40 45,46 C60,52 75,52 90,46 C105,40 112,41 120,43"
        stroke="var(--muted)" strokeWidth="1" strokeLinecap="round" opacity="0.22"
      />
    </svg>
  )
}

export default function LevelHero() {
  const { resolvedTheme } = useTheme()
  const isWater = resolvedTheme === 'dark'

  const [progress] = useState(() => getProgress())
  const currentLevel = progress.level
  const completed    = completedInLevel(currentLevel).length
  const remaining    = WORDS_PER_LEVEL - completed
  const pct          = Math.round((completed / WORDS_PER_LEVEL) * 100)
  const isDone       = completed === WORDS_PER_LEVEL
  const href         = isDone ? `/play/${Math.min(currentLevel + 1, 11)}` : `/play/${currentLevel}`
  const btnLabel     = isDone
    ? `Start Mission ${currentLevel + 1}`
    : completed === 0 ? 'Begin Mission' : 'Continue'

  return (
    <div className={styles.wrap}>

      {/* ── Hero card ── */}
      <Link href={href} className={styles.heroLink}>
        <div className={styles.heroCard}>
          <div className={styles.heroBody}>
            <div className={styles.heroLeft}>
              <div className={styles.heroEyebrow}>
                Mission {currentLevel}
                <span className={styles.heroEyebrowDot}>·</span>
                {DIFF[currentLevel]}
              </div>
              <div className={styles.heroTitle}>{LEVEL_NAMES[currentLevel]}</div>
              <div className={styles.heroStats}>
                <span className={styles.heroStatNum}>{remaining}</span>
                <span className={styles.heroStatLabel}> words left</span>
                {completed > 0 && (
                  <span className={styles.heroStatSub}> · {pct}% done</span>
                )}
              </div>
            </div>
            {isWater ? <OceanSilhouette /> : <MountainSilhouette />}
          </div>
          <div className={styles.playBtn}>{btnLabel} →</div>
        </div>
      </Link>

      {/* ── Mission strip ── */}
      <div className={styles.strip}>
        {Array.from({ length: 11 }, (_, i) => i + 1).map(level => {
          const done     = completedInLevel(level).length
          const isActive = level === currentLevel
          const isLocked = level > currentLevel
          const pctDone  = Math.round((done / WORDS_PER_LEVEL) * 100)

          return (
            <Link
              key={level}
              href={isLocked ? '#' : `/play/${level}`}
              onClick={isLocked ? e => e.preventDefault() : undefined}
              className={[
                styles.miniCard,
                isActive ? styles.miniActive   : '',
                isLocked ? styles.miniLocked   : '',
                done === WORDS_PER_LEVEL ? styles.miniDone : '',
              ].filter(Boolean).join(' ')}
            >
              <div className={styles.miniTop}>
                <div className={styles.miniNum}>{level}</div>
                <div className={styles.miniRight}>
                  {isLocked ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className={styles.lockIcon}>
                      <rect x="5" y="11" width="14" height="10" rx="2" fill="currentColor"/>
                      <path d="M8 11V7a4 4 0 018 0v4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
                    </svg>
                  ) : done === WORDS_PER_LEVEL ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={styles.doneIcon}>
                      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <span className={styles.miniDiff}>{DIFF[level]}</span>
                  )}
                </div>
              </div>
              <div className={styles.miniName}>{LEVEL_NAMES[level]}</div>
              <div className={styles.miniBar}>
                <div className={styles.miniBarFill} style={{ width: `${pctDone}%` }} />
              </div>
            </Link>
          )
        })}
      </div>

    </div>
  )
}
