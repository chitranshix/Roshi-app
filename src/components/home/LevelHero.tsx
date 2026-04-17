'use client'

import { useState } from 'react'
import { completedInLevel, isLevelUnlocked } from '@/lib/progress'
import styles from './LevelHero.module.css'

// ── Data ─────────────────────────────────────────────────────────

const WORDS_PER_MISSION = 100

export const MISSION_NAMES: Record<number, string> = {
  1: 'Foundations',   2: 'Essentials',      3: 'Building Blocks',
  4: 'Expanding',     5: 'Intermediate',     6: 'Advanced',
  7: 'Proficient',    8: 'Expert',           9: 'Master',
  10: 'Scholar',      11: 'Virtuoso',
}

const DIFF: Record<number, string> = {
  1: 'Easy', 2: 'Easy', 3: 'Easy',
  4: 'Mid',  5: 'Mid',  6: 'Mid',
  7: 'Hard', 8: 'Hard', 9: 'Hard', 10: 'Hard', 11: 'Hard',
}

type WorldKey = 'coast' | 'wild' | 'summit'

const WORLD_COLORS: Record<WorldKey, string> = {
  coast:  '#00b5a5',
  wild:   '#22c55e',
  summit: '#3b82f6',
}

const MISSION_WORLD: Record<number, WorldKey> = {
  1: 'coast', 2: 'coast', 3: 'coast',
  4: 'wild',  5: 'wild',  6: 'wild',
  7: 'summit', 8: 'summit', 9: 'summit', 10: 'summit', 11: 'summit',
}

// ── Grid layout ──────────────────────────────────────────────────
// 3 cols × 8 rows = 24 cells.
// 'M' = next mission in order, number = symbol slot index (1-13).
// Missions read left→right, top→bottom so they stay discoverable.

type GridCell = { kind: 'mission'; mission: number } | { kind: 'symbol'; idx: number }

const GRID: GridCell[] = (() => {
  const pattern: Array<'M' | number> = [
    1,   'M',  2,
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

// ── Symbol colours (cycle) ────────────────────────────────────────
const SYM_COLORS = [
  '#f0a800', '#e84393', '#22c55e', '#ff6b35', '#3b82f6',
  '#a855f7', '#06b6d4', '#f0a800', '#22c55e', '#e84393',
  '#ff6b35', '#3b82f6', '#a855f7',
]

// ── Turtle-themed symbol SVGs ─────────────────────────────────────
// All drawn in viewBox "-28 -28 56 56".

function SymShell({ c }: { c: string }) {
  return (
    <g>
      <circle r={22} fill={c} fillOpacity="0.18" stroke={c} strokeWidth="2"/>
      <polygon points="0,-13 11,-6.5 11,6.5 0,13 -11,6.5 -11,-6.5"
        fill={c} fillOpacity="0.35" stroke={c} strokeWidth="2" strokeLinejoin="round"/>
      <line x1="0" y1="-13" x2="0" y2="13" stroke={c} strokeWidth="1.8"/>
      <line x1="-11" y1="-6.5" x2="11" y2="6.5" stroke={c} strokeWidth="1.8"/>
      <line x1="-11" y1="6.5"  x2="11" y2="-6.5" stroke={c} strokeWidth="1.8"/>
    </g>
  )
}
function SymStarfish({ c }: { c: string }) {
  return (
    <g fill={c} stroke={c} strokeWidth="1.5" strokeLinejoin="round">
      <path d="M0,-22 L3,-7 L14,-14 L7,0 L22,3 L7,7 L14,14 L0,8 L-14,14 L-7,7 L-22,3 L-7,0 L-14,-14 L-3,-7 Z"
        fillOpacity="0.28"/>
      <path d="M0,-16 L2,-5 L10,-10 L5,0 L16,2 L5,5 L10,10 L0,6 L-10,10 L-5,5 L-16,2 L-5,0 L-10,-10 L-2,-5 Z"
        fillOpacity="0.7"/>
    </g>
  )
}
function SymSeaweed({ c }: { c: string }) {
  return (
    <g stroke={c} strokeWidth="3" fill="none" strokeLinecap="round">
      <path d="M0,22 C-10,14 10,6 0,-2 C-10,-10 6,-18 0,-24"/>
      <path d="M8,20 C-2,12 14,4 6,-4 C0,-10 8,-18 4,-24" strokeWidth="2" opacity="0.55"/>
      <path d="M-8,20 C-18,12 -4,4 -12,-4 C-18,-10 -10,-18 -14,-22" strokeWidth="2" opacity="0.45"/>
    </g>
  )
}
function SymBubble({ c }: { c: string }) {
  return (
    <g fill={c} stroke={c} strokeWidth="2">
      <circle cx={0}   cy={-4}  r={12} fillOpacity="0.2"/>
      <circle cx={-12} cy={10}  r={8}  fillOpacity="0.2"/>
      <circle cx={12}  cy={10}  r={7}  fillOpacity="0.2"/>
      <ellipse cx={-4} cy={-9}  rx={3.5} ry={2.5} fill={c} fillOpacity="0.5" stroke="none"/>
      <ellipse cx={-15} cy={6}  rx={2.5} ry={1.8} fill={c} fillOpacity="0.4" stroke="none"/>
    </g>
  )
}
function SymFish({ c }: { c: string }) {
  return (
    <g fill={c} stroke={c} strokeLinecap="round" strokeLinejoin="round">
      <path d="M-20,0 L-8,-5 L8,0 L-8,5 Z" strokeWidth="2" fillOpacity="0.3"/>
      <ellipse cx={6} cy={0} rx={14} ry={9} fillOpacity="0.25" strokeWidth="2"/>
      <path d="M18,-9 L22,0 L18,9" fill="none" strokeWidth="2.5"/>
      <circle cx={-2} cy={-2} r={3} fill={c} stroke="none"/>
      <circle cx={-1} cy={-3} r={1} fill="white" stroke="none"/>
    </g>
  )
}
function SymCoral({ c }: { c: string }) {
  return (
    <g stroke={c} strokeWidth="3" fill="none" strokeLinecap="round">
      <line x1="0" y1="22" x2="0" y2="-4"/>
      <line x1="-14" y1="22" x2="-14" y2="2"/>
      <line x1="14"  y1="22" x2="14"  y2="4"/>
      <path d="M0,-4 Q-10,-16 -14,-22"/>
      <path d="M0,-4 Q10,-16 14,-22"/>
      <path d="M-14,2 Q-22,-8 -20,-16"/>
      <path d="M14,4 Q22,-6 20,-14"/>
      <path d="M0,-4 Q0,-20 0,-26"/>
    </g>
  )
}
function SymFlipper({ c }: { c: string }) {
  return (
    <g>
      <path d="M-22,-6 Q-14,-22 0,-18 Q14,-22 22,-6 Q14,10 0,6 Q-14,10 -22,-6 Z"
        fill={c} fillOpacity="0.25" stroke={c} strokeWidth="2.5" strokeLinejoin="round"/>
      <ellipse cx={-8} cy={-11} rx={4} ry={2.5}
        fill={c} fillOpacity="0.55" transform="rotate(-30,-8,-11)"/>
      <line x1="-10" y1="-4" x2="10" y2="2" stroke={c} strokeWidth="2" strokeLinecap="round" opacity="0.45"/>
    </g>
  )
}
function SymPearl({ c }: { c: string }) {
  return (
    <g>
      {/* Shell halves */}
      <path d="M-20,4 Q-18,-12 0,-16 Q18,-12 20,4 Q10,12 0,10 Q-10,12 -20,4 Z"
        fill={c} fillOpacity="0.2" stroke={c} strokeWidth="2.2"/>
      <path d="M-20,4 Q-10,-4 0,-2 Q10,-4 20,4" stroke={c} strokeWidth="2" fill="none"/>
      {/* Pearl */}
      <circle cx={0} cy={12} r={8} fill="white" fillOpacity="0.85" stroke={c} strokeWidth="1.8"/>
      <ellipse cx={-3} cy={9} rx={2.5} ry={1.8} fill="white" opacity="0.6"/>
    </g>
  )
}
function SymAnchor({ c }: { c: string }) {
  return (
    <g stroke={c} strokeWidth="3" fill="none" strokeLinecap="round">
      <circle cx={0} cy={-16} r={5}/>
      <line x1="0" y1="-11" x2="0" y2="14"/>
      <path d="M-13,5 Q-13,19 0,19 Q13,19 13,5"/>
      <line x1="-9" y1="-16" x2="9" y2="-16"/>
    </g>
  )
}

const SYM_FNS = [SymShell, SymStarfish, SymSeaweed, SymBubble, SymFish, SymCoral, SymFlipper, SymPearl, SymAnchor]

// ── Mission icons ─────────────────────────────────────────────────
// All drawn in viewBox "-28 -28 56 56".

function IcoWave({ c }: { c: string }) {
  return (
    <g stroke={c} strokeLinecap="round" fill="none">
      <path d="M-22,2 C-14,-13 -5,17 4,2 C13,-13 18,13 24,2" strokeWidth="3.8"/>
      <path d="M-22,12 C-14,6 -5,20 4,12 C13,6 18,18 24,12" strokeWidth="2.2" opacity="0.4"/>
    </g>
  )
}
function IcoAnchor({ c }: { c: string }) {
  return (
    <g stroke={c} strokeWidth="3.2" fill="none" strokeLinecap="round">
      <circle cx={0} cy={-13} r={5.5}/>
      <line x1="0" y1="-7.5" x2="0" y2="14"/>
      <path d="M-12,4 Q-12,18 0,18 Q12,18 12,4"/>
      <line x1="-9" y1="-13" x2="9" y2="-13"/>
    </g>
  )
}
function IcoBoat({ c }: { c: string }) {
  return (
    <g stroke={c} strokeWidth="2.8" strokeLinecap="round">
      <path d="M-18,11 Q0,20 18,11" fill={c} fillOpacity="0.2"/>
      <line x1="0" y1="-14" x2="0" y2="11"/>
      <path d="M0,-14 L18,7 L0,7 Z" fill={c} fillOpacity="0.3" strokeLinejoin="round"/>
    </g>
  )
}
function IcoHill({ c }: { c: string }) {
  return (
    <g>
      <path d="M-24,13 Q-11,-13 0,-1 Q11,-13 24,13 Z"
        fill={c} fillOpacity="0.25" stroke={c} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M-24,18 C-7,10 7,14 24,18"
        stroke={c} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.4"/>
    </g>
  )
}
function IcoTree({ c }: { c: string }) {
  return (
    <g stroke={c} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="0,-20 -14,0 14,0"  fill={c} fillOpacity="0.25" strokeWidth="2.5"/>
      <polygon points="0,-9 -18,11 18,11" fill={c} fillOpacity="0.18" strokeWidth="2.5"/>
      <line x1="0" y1="11" x2="0" y2="19" strokeWidth="3.5"/>
    </g>
  )
}
function IcoFire({ c }: { c: string }) {
  return (
    <g>
      <path d="M0,-20 Q15,-4 9,9 Q6,19 0,17 Q-6,19 -9,9 Q-15,-4 0,-20 Z"
        fill={c} fillOpacity="0.22" stroke={c} strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M0,-7 Q8,4 5,12 Q0,16 -5,12 Q-8,4 0,-7 Z"
        fill={c} fillOpacity="0.6"/>
    </g>
  )
}
function IcoPeak({ c }: { c: string }) {
  return (
    <g>
      <path d="M-24,15 L0,-20 L24,15 Z"
        fill={c} fillOpacity="0.2" stroke={c} strokeWidth="3" strokeLinejoin="round"/>
      <path d="M-10,-4 L0,-20 L10,-4 L7,-1 L-7,-1 Z"
        fill="white" fillOpacity="0.9"/>
    </g>
  )
}
function IcoSnow({ c }: { c: string }) {
  return (
    <g stroke={c} strokeWidth="3.5" strokeLinecap="round">
      <line x1="0"     y1="-18" x2="0"    y2="18"/>
      <line x1="-15.6" y1="-9"  x2="15.6" y2="9"/>
      <line x1="-15.6" y1="9"   x2="15.6" y2="-9"/>
      <line x1="-7"    y1="-18" x2="0"    y2="-13"/>
      <line x1="7"     y1="-18" x2="0"    y2="-13"/>
    </g>
  )
}
function IcoGem({ c }: { c: string }) {
  return (
    <g>
      <path d="M0,-18 L15,-5 L9,16 L-9,16 L-15,-5 Z"
        fill={c} fillOpacity="0.22" stroke={c} strokeWidth="2.5" strokeLinejoin="round"/>
      <line x1="-15" y1="-5" x2="15" y2="-5" stroke={c} strokeWidth="2.2"/>
      <line x1="-15" y1="-5" x2="0"  y2="16" stroke={c} strokeWidth="1.4" opacity="0.4"/>
      <line x1="15"  y1="-5" x2="0"  y2="16" stroke={c} strokeWidth="1.4" opacity="0.4"/>
    </g>
  )
}
function IcoBook({ c }: { c: string }) {
  return (
    <g stroke={c} strokeWidth="2.5" fill="none" strokeLinecap="round">
      <path d="M-15,-14 L-15,14 Q0,11 0,14 Q0,11 15,14 L15,-14 Q0,-11 0,-14 Q0,-11 -15,-14 Z"
        fill={c} fillOpacity="0.18"/>
      <line x1="0" y1="-14" x2="0" y2="14"/>
      <line x1="-10" y1="-5" x2="-3" y2="-5" opacity="0.55"/>
      <line x1="-10" y1="1"  x2="-3" y2="1"  opacity="0.55"/>
      <line x1="-10" y1="7"  x2="-3" y2="7"  opacity="0.55"/>
    </g>
  )
}
function IcoStar({ c }: { c: string }) {
  return (
    <path d="M0,-20 L4.5,-7 L18,-7 L8,2 L13,16 L0,7 L-13,16 L-8,2 L-18,-7 L-4.5,-7 Z"
      fill={c} fillOpacity="0.28" stroke={c} strokeWidth="2.5" strokeLinejoin="round"/>
  )
}
function IcoLock() {
  return (
    <g stroke="rgba(255,255,255,0.4)" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <rect x={-10} y={-2} width={20} height={16} rx={3.5}
        fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.3)"/>
      <path d="M-7,-2 L-7,-9 Q-7,-18 0,-18 Q7,-18 7,-9 L7,-2"/>
      <circle cx={0} cy={7} r={2.8} fill="rgba(255,255,255,0.5)" stroke="none"/>
    </g>
  )
}

const MISSION_ICONS: Record<number, ({ c }: { c: string }) => React.ReactElement> = {
  1: IcoWave, 2: IcoAnchor, 3: IcoBoat, 4: IcoHill, 5: IcoTree, 6: IcoFire,
  7: IcoPeak, 8: IcoSnow,  9: IcoGem, 10: IcoBook, 11: IcoStar,
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

      {/* Header */}
      <div className={styles.machineHeader}>
        <span className={styles.machineDot}/>
        <span className={styles.machineTitle}>Missions</span>
        <span className={styles.machineDot}/>
      </div>

      {/* Slot grid */}
      <div className={styles.grid}>
        {GRID.map((cell, i) => {

          if (cell.kind === 'symbol') {
            const color = SYM_COLORS[(cell.idx - 1) % SYM_COLORS.length]
            const SymFn = SYM_FNS[(cell.idx - 1) % SYM_FNS.length]
            return (
              <div key={i} className={styles.symCell}>
                <svg width="62%" height="62%" viewBox="-28 -28 56 56">
                  <SymFn c={color}/>
                </svg>
              </div>
            )
          }

          // Mission cell
          const { mission } = cell
          const world      = MISSION_WORLD[mission]
          const wc         = WORLD_COLORS[world]
          const isCurrent  = mission === currentMission
          const isDone     = mission <  currentMission
          const isLocked   = mission >  currentMission
          const done       = completedInLevel(mission).length
          const pct        = Math.round((done / WORDS_PER_MISSION) * 100)
          const IcoFn      = MISSION_ICONS[mission]

          const cellClass = [
            styles.missionCell,
            isCurrent ? styles.missionCurrent : '',
            isLocked  ? styles.missionLocked  : '',
          ].filter(Boolean).join(' ')

          const bgStyle = isLocked
            ? {}
            : { background: `${wc}cc` }

          return (
            <div key={i}
              className={cellClass}
              style={bgStyle}
              onClick={isLocked ? undefined : () => { window.location.href = `/play/${mission}` }}
            >
              {/* Mission number */}
              <span className={[styles.missionNum, isCurrent ? styles.missionNumCurrent : ''].filter(Boolean).join(' ')}>
                M{mission}
              </span>

              {/* Icon */}
              <svg className={styles.missionIcon} viewBox="-28 -28 56 56">
                {isLocked
                  ? <IcoLock/>
                  : <IcoFn c={isDone ? 'rgba(255,255,255,0.7)' : 'white'}/>
                }
              </svg>

              {/* Done checkmark overlay */}
              {isDone && (
                <svg className={styles.doneCheck} viewBox="-12 -12 24 24">
                  <path d="M-8,0 L-2.5,6 L8,-6"
                    stroke="white" strokeWidth="2.8" fill="none"
                    strokeLinecap="round" strokeLinejoin="round" opacity="0.85"/>
                </svg>
              )}

              {/* Name + diff */}
              <span className={styles.missionName}>
                {MISSION_NAMES[mission]}
              </span>
              <span className={styles.missionDiff}>
                {isCurrent && pct > 0 ? `${pct}%` : DIFF[mission]}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
