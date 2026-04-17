'use client'

import { useState } from 'react'
import { completedInLevel, isLevelUnlocked } from '@/lib/progress'
import styles from './LevelHero.module.css'

// ── Data ─────────────────────────────────────────────────────────

const WORDS_PER_MISSION = 100

export const MISSION_NAMES: Record<number, string> = {
  1: 'Foundations',  2: 'Essentials',    3: 'Building Blocks',
  4: 'Expanding',    5: 'Intermediate',  6: 'Advanced',
  7: 'Proficient',   8: 'Expert',        9: 'Master',
  10: 'Scholar',     11: 'Virtuoso',
}

type WorldKey = 'coast' | 'wild' | 'summit'

const WORLD_COLORS: Record<WorldKey, string> = {
  coast:  '#00c4b4',
  wild:   '#2ecc71',
  summit: '#4a9ef5',
}

const MISSION_WORLD: Record<number, WorldKey> = {
  1: 'coast', 2: 'coast', 3: 'coast',
  4: 'wild',  5: 'wild',  6: 'wild',
  7: 'summit', 8: 'summit', 9: 'summit', 10: 'summit', 11: 'summit',
}

// ── Grid ─────────────────────────────────────────────────────────
// 3 cols × 8 rows = 24 cells.
// Missions fill in L→R T→B order so they stay findable.

type GridCell = { kind: 'mission'; mission: number } | { kind: 'symbol'; idx: number }

const GRID: GridCell[] = (() => {
  const pattern: Array<'M' | number> = [
     1,  'M',  2,
    'M',  3,  'M',
     4,  'M',  5,
    'M',  6,  'M',
     7,  'M',  8,
    'M',  9,  'M',
    10,  'M', 11,
    'M', 12,  13,
  ]
  let m = 0
  return pattern.map(p =>
    p === 'M'
      ? { kind: 'mission', mission: ++m }
      : { kind: 'symbol',  idx: p as number }
  )
})()

// ── Symbol colours ────────────────────────────────────────────────
const SYM_COLORS = [
  '#f0a800', '#e8304a', '#2ecc71', '#ff6b35',
  '#4a9ef5', '#c84fe8', '#06d4c4', '#f0a800',
  '#e8304a', '#2ecc71', '#ff6b35', '#4a9ef5', '#c84fe8',
]

// ── Turtle symbols — bold, 3-path max ────────────────────────────
// All in viewBox "-30 -30 60 60".

function SymShell({ c }: { c: string }) {
  return (
    <g stroke={c} strokeWidth="3" strokeLinejoin="round">
      <polygon points="0,-22 19,-11 19,11 0,22 -19,11 -19,-11"
        fill={c} fillOpacity="0.25"/>
      <line x1="0" y1="-22" x2="0" y2="22"/>
      <line x1="-19" y1="-11" x2="19" y2="11"/>
      <line x1="-19" y1="11"  x2="19" y2="-11"/>
    </g>
  )
}

function SymStar({ c }: { c: string }) {
  return (
    <path
      d="M0,-26 L5,-9 L22,-9 L9,2 L14,19 L0,9 L-14,19 L-9,2 L-22,-9 L-5,-9 Z"
      fill={c} stroke={c} strokeWidth="2" strokeLinejoin="round"
      fillOpacity="0.85"
    />
  )
}

function SymSeaweed({ c }: { c: string }) {
  return (
    <g stroke={c} fill="none" strokeLinecap="round">
      <path d="M-3,28 C-18,16 8,4 -3,-12 C-14,-26 4,-32 0,-30" strokeWidth="5.5"/>
      <path d="M7,26 C18,12 -4,2 8,-12 C18,-24 6,-30 4,-28"   strokeWidth="3.5" opacity="0.55"/>
    </g>
  )
}

function SymBubble({ c }: { c: string }) {
  return (
    <g fill={c} stroke={c} strokeWidth="2.5">
      <circle cx={0}   cy={4}   r={14} fillOpacity="0.25"/>
      <circle cx={-14} cy={-12} r={9}  fillOpacity="0.25"/>
      <circle cx={13}  cy={-14} r={7}  fillOpacity="0.25"/>
      <circle cx={-4}  cy={-2}  r={3}  fill={c} fillOpacity="0.6" stroke="none"/>
    </g>
  )
}

function SymFish({ c }: { c: string }) {
  return (
    <g fill={c} strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx={5} cy={0} rx={16} ry={11} fillOpacity="0.85"/>
      <path d="M-10,-11 L-28,0 L-10,11 Z"/>
      <ellipse cx={-11} cy={-2} rx={4} ry={3}
        fill={c} transform="rotate(-15,-11,-2)" opacity="0.35"/>
      <circle cx={14} cy={-4} r={3} fill="white"/>
      <circle cx={15} cy={-5} r={1} fill="#111"/>
    </g>
  )
}

function SymCoral({ c }: { c: string }) {
  return (
    <g stroke={c} strokeWidth="4" fill="none" strokeLinecap="round">
      <line x1="0" y1="28" x2="0" y2="-4"/>
      <path d="M0,-4 Q-14,-16 -16,-26"/>
      <path d="M0,-4 Q14,-16 16,-26"/>
      <path d="M0,8  Q-14,-2  -20,-12"/>
      <path d="M0,8  Q14,-2   20,-12"/>
    </g>
  )
}

function SymFlipper({ c }: { c: string }) {
  return (
    <g>
      <path
        d="M-26,-8 Q-16,-28 0,-22 Q16,-28 26,-8 Q16,12 0,8 Q-16,12 -26,-8 Z"
        fill={c} fillOpacity="0.8" stroke={c} strokeWidth="3" strokeLinejoin="round"
      />
      <ellipse cx={-7} cy={-15} rx={5} ry={3}
        fill="white" opacity="0.45" transform="rotate(-30,-7,-15)"/>
    </g>
  )
}

function SymPearl({ c }: { c: string }) {
  return (
    <g>
      <path d="M-24,2 Q-22,-14 0,-18 Q22,-14 24,2 Q14,10 0,8 Q-14,10 -24,2 Z"
        fill={c} fillOpacity="0.3" stroke={c} strokeWidth="3"/>
      <path d="M-24,2 Q-12,-6 0,-4 Q12,-6 24,2" stroke={c} strokeWidth="2.5" fill="none"/>
      <circle cx={0} cy={16} r={10} fill="white" fillOpacity="0.9" stroke={c} strokeWidth="2.5"/>
      <ellipse cx={-3} cy={12} rx={3} ry={2} fill="white"/>
    </g>
  )
}

function SymAnchor({ c }: { c: string }) {
  return (
    <g stroke={c} strokeWidth="4" fill="none" strokeLinecap="round">
      <circle cx={0} cy={-18} r={6.5} strokeWidth="3.5"/>
      <line x1="0" y1="-11.5" x2="0" y2="16"/>
      <path d="M-14,6 Q-14,22 0,22 Q14,22 14,6"/>
      <line x1="-10" y1="-18" x2="10" y2="-18"/>
    </g>
  )
}

const SYM_FNS = [
  SymShell, SymStar, SymSeaweed, SymBubble, SymFish,
  SymCoral, SymFlipper, SymPearl, SymAnchor,
]

// ── Number text (the "7") ─────────────────────────────────────────
// Rendered twice: stroke layer behind, fill on top.

function BigNum({ n, color }: { n: number; color: string }) {
  const fs = n < 10 ? 78 : 56
  const y  = n < 10 ? 72  : 68
  return (
    <>
      <text x="50" y={y} textAnchor="middle"
        fontFamily="Nunito, system-ui, sans-serif"
        fontSize={fs} fontWeight="900"
        stroke="#000" strokeWidth="10"
        fill="none" strokeLinejoin="round"
      >{n}</text>
      <text x="50" y={y} textAnchor="middle"
        fontFamily="Nunito, system-ui, sans-serif"
        fontSize={fs} fontWeight="900"
        fill={color}
      >{n}</text>
    </>
  )
}

// ── Main component ────────────────────────────────────────────────

export default function LevelHero() {
  const [currentMission] = useState(() => {
    for (let m = 1; m <= 11; m++) {
      if (isLevelUnlocked(m) && completedInLevel(m).length < WORDS_PER_MISSION) return m
    }
    return 11
  })

  return (
    <div className={styles.machine}>

      <div className={styles.grid}>
        {GRID.map((cell, i) => {

          // ── Symbol cell ──
          if (cell.kind === 'symbol') {
            const color = SYM_COLORS[(cell.idx - 1) % SYM_COLORS.length]
            const SymFn = SYM_FNS[(cell.idx - 1) % SYM_FNS.length]
            return (
              <div key={i} className={styles.cell}>
                <svg viewBox="-30 -30 60 60" className={styles.symSvg}>
                  <SymFn c={color}/>
                </svg>
                <div className={styles.gloss}/>
              </div>
            )
          }

          // ── Mission cell ──
          const { mission } = cell
          const world     = MISSION_WORLD[mission]
          const wc        = WORLD_COLORS[world]
          const isCurrent = mission === currentMission
          const isDone    = mission <  currentMission
          const isLocked  = mission >  currentMission

          const numColor = isCurrent
            ? '#FFD700'
            : isDone
              ? wc
              : '#444'

          return (
            <div key={i}
              className={[
                styles.cell,
                styles.missionCell,
                isCurrent ? styles.current : '',
                isLocked  ? styles.locked  : '',
              ].filter(Boolean).join(' ')}
              onClick={isLocked ? undefined : () => { window.location.href = `/play/${mission}` }}
            >
              <svg viewBox="0 0 100 100" className={styles.numSvg}>
                <BigNum n={mission} color={numColor}/>
              </svg>
              <div className={styles.gloss}/>
            </div>
          )
        })}
      </div>

      {/* "SLOTS"-style label */}
      <div className={styles.machineLabel}>Missions</div>

    </div>
  )
}
