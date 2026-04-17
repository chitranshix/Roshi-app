'use client'

import { useState } from 'react'
import Link from 'next/link'
import { completedInLevel, isLevelUnlocked } from '@/lib/progress'
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

interface Tier { id: string; name: string; sub: string; levels: number[]; color: string }

const TIERS: Tier[] = [
  { id: 'coast',  name: 'The Coast',   sub: 'Levels 1 – 3',   levels: [1,2,3],         color: '#2a9d8f' },
  { id: 'wild',   name: 'The Wild',    sub: 'Levels 4 – 6',   levels: [4,5,6],         color: '#5a8a3a' },
  { id: 'summit', name: 'The Summit',  sub: 'Levels 7 – 11',  levels: [7,8,9,10,11],   color: '#5272a0' },
]

function getTier(level: number): Tier {
  return TIERS.find(t => t.levels.includes(level))!
}

// ── Tiny Roshi ───────────────────────────────────────────────────
function TinyRoshi() {
  return (
    <g>
      <path d="M112 82 Q124 80 136 96 Q138 102 134 108 Q126 112 116 96 Q112 90 112 82Z" fill="#2DAF7A" />
      <path d="M84 88 Q78 100 76 114 Q76 120 82 120 Q88 118 92 106 Q92 94 84 88Z" fill="#2DAF7A" />
      <ellipse cx="80" cy="96" rx="38" ry="9" fill="#D4C878" />
      <path d="M38 90 Q34 62 58 44 Q82 28 114 50 Q130 66 122 90Z" fill="#8B6420" />
      <path d="M50 82 Q46 62 66 50 Q86 38 110 56 Q120 68 114 82Z" fill="#A87830" opacity="0.4" />
      <path d="M44 82 Q26 78 8 96 Q6 102 8 108 Q18 116 40 96 Q44 88 44 82Z" fill="#3DBF90" />
      <path d="M42 68 Q34 60 28 56 Q26 50 30 46 Q38 42 46 50 Q50 58 46 68Z" fill="#3DBF90" />
      <g className={styles.miniHeadBob}>
        <circle cx="28" cy="36" r="22" fill="#3DBF90" />
        <circle cx="18" cy="34" r="10" fill="white" />
        <circle cx="38" cy="34" r="10" fill="white" />
        <circle cx="19" cy="35" r="5.5" fill="#1A1A08" className={styles.miniPupil} />
        <circle cx="39" cy="35" r="5.5" fill="#1A1A08" className={styles.miniPupil} />
        <circle cx="21" cy="32" r="2.2" fill="white" className={styles.miniPupil} />
        <circle cx="41" cy="32" r="2.2" fill="white" className={styles.miniPupil} />
        <path d="M18 50 Q28 51 38 45" stroke="#1A1A08" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <g className={styles.miniLeafChew}>
          <path d="M38 45 Q52 30 62 36 Q58 50 38 45Z" fill="#4DB330" stroke="#2D8018" strokeWidth="1.4" />
          <path d="M38 45 Q52 32 60 37" stroke="#2D8018" strokeWidth="1" fill="none" opacity="0.7" />
        </g>
      </g>
    </g>
  )
}

// ── World illustrations (hero card corner) ───────────────────────

const SNOWFLAKES = [
  { x: 10, dur: '3.8s', delay: '0s' }, { x: 28, dur: '5.2s', delay: '1.2s' },
  { x: 48, dur: '4.4s', delay: '0.5s' }, { x: 65, dur: '3.5s', delay: '2.4s' },
  { x: 82, dur: '5.8s', delay: '0.9s' }, { x: 100, dur: '4.1s', delay: '1.8s' },
  { x: 118, dur: '4.9s', delay: '3.1s' }, { x: 133, dur: '3.3s', delay: '0.3s' },
]

function CoastHero() {
  return (
    <svg className={styles.worldSvg} width="240" height="80" viewBox="0 0 240 80" fill="none" aria-hidden="true">
      <defs><clipPath id="ch"><rect width="240" height="80"/></clipPath></defs>
      <g clipPath="url(#ch)">
        <g className={styles.waveScroll}>
          <path d="M-80,28 C-60,8 -20,48 0,28 C20,8 60,48 80,28 C100,8 140,48 160,28 C180,8 220,48 240,28 C260,8 300,48 320,28 C340,8 380,48 400,28 L400,80 L-80,80 Z" fill="currentColor" opacity="0.13"/>
          <path d="M-80,28 C-60,8 -20,48 0,28 C20,8 60,48 80,28 C100,8 140,48 160,28 C180,8 220,48 240,28 C260,8 300,48 320,28 C340,8 380,48 400,28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5"/>
        </g>
        <g className={styles.waveScrollSlow}>
          <path d="M-80,46 C-60,40 -20,52 0,46 C20,40 60,52 80,46 C100,40 140,52 160,46 C180,40 220,52 240,46 C260,40 300,52 320,46 C340,40 380,52 400,46" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.35"/>
        </g>
      </g>
      <g transform="translate(82,2) scale(0.48)">
        <g className={styles.oceanBob}><TinyRoshi /></g>
      </g>
    </svg>
  )
}

function WildHero() {
  return (
    <svg className={styles.worldSvg} width="240" height="80" viewBox="0 0 240 80" fill="none" aria-hidden="true">
      <path d="M0,80 C20,78 36,52 72,44 C108,36 114,62 144,58 C174,54 184,36 214,32 C244,28 260,56 280,62 L280,80 Z" fill="currentColor" opacity="0.14"/>
      <path d="M0,80 C20,78 36,52 72,44 C108,36 114,62 144,58 C174,54 184,36 214,32 C244,28 260,56 280,62" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4"/>
      <line x1="78" y1="44" x2="78" y2="62" stroke="currentColor" strokeWidth="1.8" opacity="0.32" strokeLinecap="round"/>
      <path d="M67,48 Q78,29 89,48Z" fill="currentColor" opacity="0.24"/>
      <line x1="198" y1="33" x2="198" y2="52" stroke="currentColor" strokeWidth="1.8" opacity="0.32" strokeLinecap="round"/>
      <path d="M187,38 Q198,19 209,38Z" fill="currentColor" opacity="0.24"/>
      <g transform="translate(108,12) scale(0.46)">
        <g className={styles.miniHeadBob}><TinyRoshi /></g>
      </g>
    </svg>
  )
}

function SummitHero() {
  return (
    <svg className={styles.worldSvg} width="240" height="80" viewBox="0 -42 240 122" overflow="visible" fill="none" aria-hidden="true">
      {SNOWFLAKES.map((s, i) => (
        <circle key={i} cx={s.x} cy={-20} r={3.5} fill="#c8e8ff"
          className={styles.snowflake}
          style={{ '--dur': s.dur, '--delay': s.delay } as React.CSSProperties}
        />
      ))}
      <path d="M0,80 C25,78 35,22 65,10 C90,0 92,44 115,50 C138,56 142,14 172,20 C198,26 210,58 240,74 L240,80 Z" fill="currentColor" opacity="0.14"/>
      <path d="M0,80 C25,78 35,22 65,10 C90,0 92,44 115,50 C138,56 142,14 172,20 C198,26 210,58 240,74" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4"/>
      <path d="M46,28 C55,16 60,10 65,10 C70,6 76,10 82,14 L78,19 L74,14 L70,19 L65,14 L60,19 L55,14 L50,19 Z" fill="#c8e8ff" opacity="0.85"/>
      <path d="M152,34 C162,22 168,20 172,20 C178,20 183,24 190,28 L186,33 L182,28 L178,33 L174,28 L170,33 L166,28 L162,33 L158,28 L154,33 Z" fill="#c8e8ff" opacity="0.9"/>
      <g transform="translate(119,-39) scale(0.66)"><TinyRoshi /></g>
    </svg>
  )
}

// ── Tier banner SVGs (full-width, short) ─────────────────────────

function CoastBanner() {
  return (
    <svg className={styles.bannerSvg} viewBox="0 0 360 60" fill="none" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
      <defs><clipPath id="cb"><rect width="360" height="60"/></clipPath></defs>
      <g clipPath="url(#cb)">
        <g className={styles.waveScroll}>
          <path d="M-80,34 C-60,14 -20,54 0,34 C20,14 60,54 80,34 C100,14 140,54 160,34 C180,14 220,54 240,34 C260,14 300,54 320,34 C340,14 380,54 400,34 C420,14 460,54 480,34 L480,60 L-80,60 Z" fill="currentColor" opacity="0.14"/>
          <path d="M-80,34 C-60,14 -20,54 0,34 C20,14 60,54 80,34 C100,14 140,54 160,34 C180,14 220,54 240,34 C260,14 300,54 320,34 C340,14 380,54 400,34" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.55"/>
        </g>
        <g className={styles.waveScrollSlow}>
          <path d="M-80,48 C-60,42 -20,54 0,48 C20,42 60,54 80,48 C100,42 140,54 160,48 C180,42 220,54 240,48 C260,42 300,54 320,48 C340,42 380,54 400,48" stroke="currentColor" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.35"/>
        </g>
      </g>
    </svg>
  )
}

function WildBanner() {
  return (
    <svg className={styles.bannerSvg} viewBox="0 0 360 60" fill="none" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
      <path d="M0,60 C30,60 50,40 90,36 C130,32 140,54 180,50 C220,46 232,28 272,24 C312,20 335,44 360,42 L360,60 Z" fill="currentColor" opacity="0.14"/>
      <path d="M0,60 C30,60 50,40 90,36 C130,32 140,54 180,50 C220,46 232,28 272,24 C312,20 335,44 360,42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4"/>
      <line x1="106" y1="36" x2="106" y2="54" stroke="currentColor" strokeWidth="1.8" opacity="0.3" strokeLinecap="round"/>
      <path d="M95,40 Q106,22 117,40Z" fill="currentColor" opacity="0.22"/>
      <line x1="256" y1="25" x2="256" y2="44" stroke="currentColor" strokeWidth="1.8" opacity="0.3" strokeLinecap="round"/>
      <path d="M245,30 Q256,12 267,30Z" fill="currentColor" opacity="0.22"/>
      <line x1="316" y1="43" x2="316" y2="58" stroke="currentColor" strokeWidth="1.5" opacity="0.25" strokeLinecap="round"/>
      <path d="M308,46 Q316,32 324,46Z" fill="currentColor" opacity="0.18"/>
    </svg>
  )
}

function SummitBanner() {
  return (
    <svg className={styles.bannerSvg} viewBox="0 0 360 60" fill="none" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
      <circle cx="50"  cy="14" r="2.5" fill="#c8e8ff" className={styles.snowflake} style={{ '--dur': '3.8s', '--delay': '0s'   } as React.CSSProperties}/>
      <circle cx="140" cy="8"  r="2.5" fill="#c8e8ff" className={styles.snowflake} style={{ '--dur': '5.2s', '--delay': '1s'   } as React.CSSProperties}/>
      <circle cx="240" cy="12" r="2"   fill="#c8e8ff" className={styles.snowflake} style={{ '--dur': '4.4s', '--delay': '0.5s' } as React.CSSProperties}/>
      <circle cx="320" cy="20" r="2"   fill="#c8e8ff" className={styles.snowflake} style={{ '--dur': '3.5s', '--delay': '2s'   } as React.CSSProperties}/>
      <path d="M0,60 C18,58 36,28 72,16 C96,6 102,48 130,56 C158,64 164,20 200,26 C236,32 246,58 280,60 L360,60 Z" fill="currentColor" opacity="0.14"/>
      <path d="M0,60 C18,58 36,28 72,16 C96,6 102,48 130,56 C158,64 164,20 200,26 C236,32 246,58 280,60" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4"/>
      <path d="M59,30 C65,20 69,16 72,16 C75,12 78,16 84,20 L80,24 L76,20 L72,24 L68,20 L64,24Z" fill="#c8e8ff" opacity="0.85"/>
      <path d="M188,38 C193,28 197,26 200,26 C203,22 206,26 211,30 L207,34 L203,30 L200,34 L197,30 L193,34Z" fill="#c8e8ff" opacity="0.85"/>
    </svg>
  )
}

const TIER_BANNERS = { coast: CoastBanner, wild: WildBanner, summit: SummitBanner }
const TIER_HEROES  = { coast: CoastHero,  wild: WildHero,  summit: SummitHero  }

// ── Level node ───────────────────────────────────────────────────

function LevelNode({ level, side, currentLevel }: { level: number; side: 'left' | 'right'; currentLevel: number }) {
  const done       = completedInLevel(level).length
  const isLocked   = !isLevelUnlocked(level)
  const isCurrent  = level === currentLevel
  const isComplete = done === WORDS_PER_LEVEL
  const pct        = Math.round((done / WORDS_PER_LEVEL) * 100)
  const tier       = getTier(level)

  const inner = (
    <div className={[styles.nodeOuter, side === 'right' ? styles.nodeRight : styles.nodeLeft].join(' ')}>
      {isCurrent && <div className={styles.nodeRing} />}
      <div
        className={[
          styles.nodeCircle,
          isCurrent  ? styles.nodeCurrent  : '',
          isComplete ? styles.nodeComplete : '',
          isLocked   ? styles.nodeLocked   : '',
        ].filter(Boolean).join(' ')}
        style={isComplete && !isCurrent ? { background: tier.color, borderColor: tier.color } as React.CSSProperties : undefined}
      >
        {isLocked ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="5" y="11" width="14" height="10" rx="2" fill="currentColor"/>
            <path d="M8 11V7a4 4 0 018 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
          </svg>
        ) : isComplete ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          <span className={styles.nodeNum}>{level}</span>
        )}
      </div>
      <div className={styles.nodeMeta}>
        <div className={styles.nodeName}>{LEVEL_NAMES[level]}</div>
        {isCurrent && pct > 0 && <div className={styles.nodePct}>{pct}%</div>}
      </div>
    </div>
  )

  if (isLocked) return <div className={styles.nodeRow}>{inner}</div>
  return <Link href={`/play/${level}`} className={styles.nodeRow}>{inner}</Link>
}

// ── Main component ───────────────────────────────────────────────

export default function LevelHero() {
  const [currentLevel] = useState(() => {
    for (let lvl = 1; lvl <= 11; lvl++) {
      if (isLevelUnlocked(lvl) && completedInLevel(lvl).length < WORDS_PER_LEVEL) return lvl
    }
    return 11
  })

  const completed = completedInLevel(currentLevel).length
  const remaining = WORDS_PER_LEVEL - completed
  const pct       = Math.round((completed / WORDS_PER_LEVEL) * 100)
  const currentTier = getTier(currentLevel)
  const HeroIllustration = TIER_HEROES[currentTier.id as keyof typeof TIER_HEROES]

  return (
    <div className={styles.wrap} style={{ '--tier-color': currentTier.color } as React.CSSProperties}>

      {/* ── Active mission hero card ── */}
      <Link href={`/play/${currentLevel}`} className={styles.heroLink}>
        <div className={styles.heroCard}>
          <div className={styles.heroBody}>
            <div className={styles.heroLeft}>
              <div className={styles.heroEyebrow} style={{ color: currentTier.color }}>
                Mission {currentLevel}
                <span className={styles.heroEyebrowDot}>·</span>
                {DIFF[currentLevel]}
              </div>
              <div className={styles.heroTitle}>{LEVEL_NAMES[currentLevel]}</div>
              <div className={styles.heroStats}>
                <span className={styles.heroStatNum}>{remaining}</span>
                <span className={styles.heroStatLabel}> words left</span>
                {completed > 0 && <span className={styles.heroStatSub}> · {pct}%</span>}
              </div>
            </div>
            <div style={{ color: currentTier.color }}>
              <HeroIllustration />
            </div>
          </div>
          <div className={styles.playBtn}>
            {completed === 0 ? 'Begin Mission' : 'Continue'}
          </div>
        </div>
      </Link>

      {/* ── World map ── */}
      <div className={styles.mapLabel}>All missions</div>

      {TIERS.map(tier => {
        const Banner = TIER_BANNERS[tier.id as keyof typeof TIER_BANNERS]
        return (
          <div
            key={tier.id}
            className={styles.tierSection}
            style={{ '--tier-color': tier.color } as React.CSSProperties}
          >
            {/* Tier banner */}
            <div className={styles.tierBanner}>
              <Banner />
              <div className={styles.tierMeta}>
                <span className={styles.tierName}>{tier.name}</span>
                <span className={styles.tierSub}>{tier.sub}</span>
              </div>
            </div>

            {/* Level nodes — zigzag */}
            <div className={styles.nodesWrap}>
              {/* Vertical connector line */}
              <div className={styles.nodeLine} />

              {tier.levels.map((level, idx) => (
                <LevelNode
                  key={level}
                  level={level}
                  side={idx % 2 === 0 ? 'left' : 'right'}
                  currentLevel={currentLevel}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
