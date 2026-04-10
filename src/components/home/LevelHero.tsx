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

function TinyRoshi({ className }: { className?: string }) {
  return (
    <g className={className}>
      {/* rear flippers */}
      <path d="M112 82 Q124 80 136 96 Q138 102 134 108 Q126 112 116 96 Q112 90 112 82Z" fill="#2DAF7A" />
      <path d="M84 88 Q78 100 76 114 Q76 120 82 120 Q88 118 92 106 Q92 94 84 88Z" fill="#2DAF7A" />
      {/* plastron */}
      <ellipse cx="80" cy="96" rx="38" ry="9" fill="#D4C878" />
      {/* shell */}
      <path d="M38 90 Q34 62 58 44 Q82 28 114 50 Q130 66 122 90Z" fill="#8B6420" />
      <path d="M50 82 Q46 62 66 50 Q86 38 110 56 Q120 68 114 82Z" fill="#A87830" opacity="0.4" />
      {/* front flipper */}
      <path d="M44 82 Q26 78 8 96 Q6 102 8 108 Q18 116 40 96 Q44 88 44 82Z" fill="#3DBF90" />
      {/* neck */}
      <path d="M42 68 Q34 60 28 56 Q26 50 30 46 Q38 42 46 50 Q50 58 46 68Z" fill="#3DBF90" />
      {/* head group — bobs */}
      <g className={styles.miniHeadBob}>
        <circle cx="28" cy="36" r="22" fill="#3DBF90" />
        {/* eyes */}
        <circle cx="18" cy="34" r="10" fill="white" />
        <circle cx="38" cy="34" r="10" fill="white" />
        <circle cx="19" cy="35" r="5.5" fill="#1A1A08" className={styles.miniPupil} />
        <circle cx="39" cy="35" r="5.5" fill="#1A1A08" className={styles.miniPupil} />
        <circle cx="21" cy="32" r="2.2" fill="white" className={styles.miniPupil} />
        <circle cx="41" cy="32" r="2.2" fill="white" className={styles.miniPupil} />
        {/* smirk */}
        <path d="M18 50 Q28 51 38 45" stroke="#1A1A08" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        {/* leaf chew */}
        <g className={styles.miniLeafChew}>
          <path d="M38 45 Q52 30 62 36 Q58 50 38 45Z" fill="#4DB330" stroke="#2D8018" strokeWidth="1.4" />
          <path d="M38 45 Q52 32 60 37" stroke="#2D8018" strokeWidth="1" fill="none" opacity="0.7" />
        </g>
      </g>
    </g>
  )
}

const SNOWFLAKES = [
  { x: 10,  dur: '3.8s', delay: '0s'   },
  { x: 28,  dur: '5.2s', delay: '1.2s' },
  { x: 48,  dur: '4.4s', delay: '0.5s' },
  { x: 65,  dur: '3.5s', delay: '2.4s' },
  { x: 82,  dur: '5.8s', delay: '0.9s' },
  { x: 100, dur: '4.1s', delay: '1.8s' },
  { x: 118, dur: '4.9s', delay: '3.1s' },
  { x: 133, dur: '3.3s', delay: '0.3s' },
]

function MountainSilhouette() {
  return (
    <svg className={styles.worldSvg} width="240" height="80" viewBox="0 -42 240 122" overflow="visible" fill="none" aria-hidden="true">
      {/* snowflakes */}
      {SNOWFLAKES.map((s, i) => (
        <circle
          key={i} cx={s.x} cy={-20} r={3.5} fill="#c8e8ff"
          className={styles.snowflake}
          style={{ '--dur': s.dur, '--delay': s.delay } as React.CSSProperties}
        />
      ))}
      {/* 4 smooth sweeping peaks */}
      {/* peak 2 lowered to y=20 so Roshi has headroom */}
      <path
        d="M0,80 C25,78 35,22 65,10 C90,0 92,44 115,50 C138,56 142,14 172,20 C198,26 210,58 240,74 L240,80 Z"
        fill="var(--muted)" opacity="0.14"
      />
      <path
        d="M0,80 C25,78 35,22 65,10 C90,0 92,44 115,50 C138,56 142,14 172,20 C198,26 210,58 240,74"
        stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4"
      />
      {/* snow cap peak 1 at (65,10) */}
      <path
        d="M46,28 C55,16 60,10 65,10 C70,6 76,10 82,14 L78,19 L74,14 L70,19 L65,14 L60,19 L55,14 L50,19 Z"
        fill="#c8e8ff" opacity="0.85"
      />
      {/* snow cap peak 2 at (172,20) */}
      <path
        d="M152,34 C162,22 168,20 172,20 C178,20 183,24 190,28 L186,33 L182,28 L178,33 L174,28 L170,33 L166,28 L162,33 L158,28 L154,33 Z"
        fill="#c8e8ff" opacity="0.9"
      />
      {/* Roshi on peak 2 (172,20) — shell base y=90*0.66=59, translate_y=20-59=-39
          center-x: 172 - 80*0.66/2 = 172-26 = 146... use 80 as center: 172-80*0.66=119 */}
      <g transform="translate(119, -39) scale(0.66)">
        <TinyRoshi />
      </g>
    </svg>
  )
}

function OceanSilhouette() {
  // S-curve waves. Period = 70px, tiled from -70 to 210. translateX(-70px) = seamless loop.
  return (
    <svg className={styles.worldSvg} width="240" height="80" viewBox="0 0 240 65" fill="none" aria-hidden="true">
      <defs>
        <clipPath id="oceanClip">
          <rect x="0" y="0" width="240" height="65" />
        </clipPath>
      </defs>
      <g clipPath="url(#oceanClip)">
        {/* surface wave — period 80, big amplitude (y8 to y42), tiled -80 to 400 */}
        <g className={styles.waveScroll}>
          <path
            d="M-80,25 C-60,5 -20,45 0,25 C20,5 60,45 80,25 C100,5 140,45 160,25 C180,5 220,45 240,25 C260,5 300,45 320,25 C340,5 380,45 400,25 L400,65 L-80,65 Z"
            fill="var(--muted)" opacity="0.13"
          />
          <path
            d="M-80,25 C-60,5 -20,45 0,25 C20,5 60,45 80,25 C100,5 140,45 160,25 C180,5 220,45 240,25 C260,5 300,45 320,25 C340,5 380,45 400,25"
            stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5"
          />
        </g>
        {/* undercurrent — period 80, smaller amplitude */}
        <g className={styles.waveScrollSlow}>
          <path
            d="M-80,44 C-60,38 -20,50 0,44 C20,38 60,50 80,44 C100,38 140,50 160,44 C180,38 220,50 240,44 C260,38 300,50 320,44 C340,38 380,50 400,44"
            stroke="var(--muted)" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.35"
          />
        </g>
      </g>
      {/* Roshi in trough x≈120, y≈45 — shell base y=90*0.48=43, so translate_y=45-43=2
          center-x: 120 - 80*0.48/2=19 → 120-19=101... actually center at x=80: 120-80*0.48=82 */}
      <g transform="translate(82, 2) scale(0.48)">
        <g className={styles.oceanBob}>
          <TinyRoshi />
        </g>
      </g>
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
          <div className={styles.playBtn}>{btnLabel}</div>
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
