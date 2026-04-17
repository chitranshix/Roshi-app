'use client'

import { useState } from 'react'
import { completedInLevel, isLevelUnlocked } from '@/lib/progress'
import styles from './LevelHero.module.css'

// ── Data ─────────────────────────────────────────────────────────

const WORDS_PER_MISSION = 100

export const MISSION_NAMES: Record<number, string> = {
  1: 'Foundations',  2: 'Essentials',   3: 'Building Blocks',
  4: 'Expanding',    5: 'Intermediate', 6: 'Advanced',
  7: 'Proficient',   8: 'Expert',       9: 'Master',
  10: 'Scholar',     11: 'Virtuoso',
}

const DIFF: Record<number, string> = {
  1: 'EASY', 2: 'EASY', 3: 'EASY',
  4: 'MID',  5: 'MID',  6: 'MID',
  7: 'HARD', 8: 'HARD', 9: 'HARD', 10: 'HARD', 11: 'HARD',
}

type WorldKey = 'coast' | 'wild' | 'summit'

const WORLD_COLORS: Record<WorldKey, string> = {
  coast:  '#00cbb8',
  wild:   '#2ecc71',
  summit: '#4a9ef5',
}

const MISSION_WORLD: Record<number, WorldKey> = {
  1: 'coast', 2: 'coast', 3: 'coast',
  4: 'wild',  5: 'wild',  6: 'wild',
  7: 'summit', 8: 'summit', 9: 'summit', 10: 'summit', 11: 'summit',
}

// ── Grid — 4 cols × 5 rows = 20 cells ────────────────────────────
// Missions fill L→R, T→B so they stay findable.

type GridCell = { kind: 'mission'; mission: number } | { kind: 'symbol'; idx: number }

const GRID: GridCell[] = (() => {
  // M = mission slot, S = symbol slot
  const pattern: Array<'M' | 'S'> = [
    'M','S','M','S',
    'S','M','S','M',
    'M','S','M','S',
    'S','M','S','M',
    'M','M','S','M',
  ]
  let m = 0, s = 0
  return pattern.map(p =>
    p === 'M'
      ? { kind: 'mission', mission: ++m }
      : { kind: 'symbol',  idx: ++s }
  )
})()

// ── Symbol colours ────────────────────────────────────────────────
const SYM_COLORS = [
  '#3ecb48', '#ff4060', '#f0c000', '#4a90f5',
  '#ff6b35', '#c840e8', '#00cbb8', '#e8304a', '#2ecc71',
]

// ── Slot-machine-style symbols ────────────────────────────────────
// Each: solid fill + thick black stroke + white gloss ellipse.
// viewBox "-30 -30 60 60"

function Gloss() {
  return (
    <ellipse cx={-9} cy={-14} rx={8} ry={5}
      fill="white" opacity="0.38"
      transform="rotate(-25,-9,-14)"
    />
  )
}

// Lily pad — top-down view with notch, veins, small flower
function SymLilypad({ c }: { c: string }) {
  return (
    <g>
      {/* Pad body: circle with V-notch at bottom */}
      <path d="M0,0 L-8,22 A24,24 0 1,1 8,22 Z"
        fill={c} stroke="#111" strokeWidth="4" strokeLinejoin="round"/>
      {/* Radiating veins */}
      <line x1="0" y1="0" x2="0"   y2="-24" stroke="#111" strokeWidth="2"   opacity="0.45"/>
      <line x1="0" y1="0" x2="-22" y2="-8"  stroke="#111" strokeWidth="1.8" opacity="0.35"/>
      <line x1="0" y1="0" x2="22"  y2="-8"  stroke="#111" strokeWidth="1.8" opacity="0.35"/>
      <line x1="0" y1="0" x2="-20" y2="14"  stroke="#111" strokeWidth="1.5" opacity="0.3"/>
      <line x1="0" y1="0" x2="20"  y2="14"  stroke="#111" strokeWidth="1.5" opacity="0.3"/>
      {/* Small flower */}
      <circle cx={0} cy={-10} r={7}   fill="#ff80c0" stroke="#111" strokeWidth="3"/>
      <circle cx={0} cy={-10} r={3}   fill="#FFD700" stroke="#111" strokeWidth="1.5"/>
      <ellipse cx={-5} cy={-16} rx={4} ry={2.5} fill="white" opacity="0.4" transform="rotate(-25,-5,-16)"/>
    </g>
  )
}

// Cherries → twin turtle heads peeking (pair like cherries)
function SymHeads({ c }: { c: string }) {
  return (
    <g>
      {/* Stems */}
      <path d="M-8,-4 Q-4,-20 4,-24 Q10,-20 12,-6"
        stroke="#3a8a20" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
      {/* Left head */}
      <circle cx={-14} cy={6} r={13} fill={c} stroke="#111" strokeWidth="4"/>
      <circle cx={-18} cy={2} r={3.5} fill="white" stroke="none"/>
      <circle cx={-10} cy={2} r={3.5} fill="white" stroke="none"/>
      <circle cx={-17.5} cy={2} r={1.8} fill="#111"/>
      <circle cx={-9.5}  cy={2} r={1.8} fill="#111"/>
      {/* Right head */}
      <circle cx={14} cy={10} r={13} fill={c} stroke="#111" strokeWidth="4"/>
      <circle cx={10} cy={6}  r={3.5} fill="white" stroke="none"/>
      <circle cx={18} cy={6}  r={3.5} fill="white" stroke="none"/>
      <circle cx={10.5} cy={6} r={1.8} fill="#111"/>
      <circle cx={18.5} cy={6} r={1.8} fill="#111"/>
    </g>
  )
}

// Waves — layered ocean waves
function SymWaves({ c }: { c: string }) {
  return (
    <g>
      {/* Back wave */}
      <path d="M-28,-8 C-20,-22 -10,-22 0,-8 C10,6 20,6 28,-8 L28,10 L-28,10 Z"
        fill={c} stroke="#111" strokeWidth="4" strokeLinejoin="round" opacity="0.6"/>
      {/* Front wave */}
      <path d="M-28,6 C-20,-8 -10,-8 0,6 C10,20 20,20 28,6 L28,26 L-28,26 Z"
        fill={c} stroke="#111" strokeWidth="4.5" strokeLinejoin="round"/>
      {/* White foam crests */}
      <path d="M-28,-8 C-23,-16 -17,-16 -12,-8"
        stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.75"/>
      <path d="M-2,-8 C3,-16 9,-16 14,-8"
        stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.75"/>
      <ellipse cx={-10} cy={-10} rx={8} ry={4} fill="white" opacity="0.2" transform="rotate(-15,-10,-10)"/>
    </g>
  )
}

// Starfish — rounded arms, more organic
function SymStarfish({ c }: { c: string }) {
  return (
    <g>
      <path d="M0,-24 C5,-16 10,-12 7,-6 C12,-4 18,-2 22,2 C16,6 12,10 8,8 C8,14 6,20 0,24 C-6,20 -8,14 -8,8 C-12,10 -16,6 -22,2 C-18,-2 -12,-4 -7,-6 C-10,-12 -5,-16 0,-24 Z"
        fill={c} stroke="#111" strokeWidth="4" strokeLinejoin="round"/>
      {/* Centre disk */}
      <circle r={7} fill={c} stroke="#111" strokeWidth="3"/>
      <circle r={3.5} fill="white" opacity="0.35"/>
      <Gloss/>
    </g>
  )
}

// Fish — simple iconic fish
function SymFish({ c }: { c: string }) {
  return (
    <g>
      {/* Tail */}
      <path d="M-12,-14 L-28,0 L-12,14 Z"
        fill={c} stroke="#111" strokeWidth="3.5" strokeLinejoin="round"/>
      {/* Body */}
      <ellipse cx={5} cy={0} rx={19} ry={13}
        fill={c} stroke="#111" strokeWidth="4"/>
      {/* Eye */}
      <circle cx={16} cy={-5} r={4.5} fill="white" stroke="#111" strokeWidth="2"/>
      <circle cx={17} cy={-5} r={2.2} fill="#111"/>
      <circle cx={16} cy={-6} r={1}   fill="white"/>
      <Gloss/>
    </g>
  )
}

// Anchor
function SymAnchor({ c }: { c: string }) {
  return (
    <g strokeLinecap="round" strokeLinejoin="round">
      {/* Black outline layer */}
      <circle cx={0} cy={-21} r={7.5} fill="#111"/>
      <line x1="0" y1="-13.5" x2="0" y2="16" stroke="#111" strokeWidth="10"/>
      <path d="M-14,7 Q-14,25 0,25 Q14,25 14,7" stroke="#111" strokeWidth="10" fill="none"/>
      <line x1="-12" y1="-21" x2="12" y2="-21" stroke="#111" strokeWidth="10"/>
      {/* Colour layer */}
      <circle cx={0} cy={-21} r={7.5} fill={c}/>
      <line x1="0" y1="-13.5" x2="0" y2="16" stroke={c} strokeWidth="6"/>
      <path d="M-14,7 Q-14,25 0,25 Q14,25 14,7" stroke={c} strokeWidth="6" fill="none"/>
      <line x1="-12" y1="-21" x2="12" y2="-21" stroke={c} strokeWidth="6"/>
      <Gloss/>
    </g>
  )
}

// Bird — seagull silhouette in flight
function SymBird({ c }: { c: string }) {
  return (
    <g>
      {/* Left wing */}
      <path d="M-2,-6 C-8,-20 -20,-22 -26,-13 C-22,-9 -12,-10 -2,-6 Z"
        fill={c} stroke="#111" strokeWidth="3.5" strokeLinejoin="round"/>
      {/* Right wing */}
      <path d="M2,-6 C8,-20 20,-22 26,-13 C22,-9 12,-10 2,-6 Z"
        fill={c} stroke="#111" strokeWidth="3.5" strokeLinejoin="round"/>
      {/* Body */}
      <ellipse cx={0} cy={-1} rx={5} ry={9} fill={c} stroke="#111" strokeWidth="3.5"/>
      {/* Head */}
      <circle cx={0} cy={-12} r={7} fill={c} stroke="#111" strokeWidth="3.5"/>
      {/* Beak */}
      <path d="M5,-11 L13,-9 L5,-7 Z" fill="#f0a800" stroke="#111" strokeWidth="2" strokeLinejoin="round"/>
      {/* Eye */}
      <circle cx={2} cy={-13} r={2.2} fill="#111"/>
      <circle cx={1.5} cy={-13.5} r={0.9} fill="white"/>
      {/* Small background bird */}
      <path d="M-20,10 C-16,4 -10,4 -6,10" fill="none" stroke={c} strokeWidth="3.5" strokeLinecap="round"/>
      <ellipse cx={-5} cy={-14} rx={3.5} ry={2} fill="white" opacity="0.4" transform="rotate(-25,-5,-14)"/>
    </g>
  )
}

// Leaves — broad turtle-food leaves
function SymLeaves({ c }: { c: string }) {
  return (
    <g stroke="#111" strokeLinejoin="round">
      {/* Left leaf */}
      <path d="M0,20 C-22,12 -24,-8 -8,-20 C-2,-8 -2,8 0,20 Z"
        fill={c} fillOpacity="0.7" strokeWidth="3.5"/>
      {/* Right leaf */}
      <path d="M0,20 C22,12 24,-8 8,-20 C2,-8 2,8 0,20 Z"
        fill={c} fillOpacity="0.85" strokeWidth="3.5"/>
      {/* Centre leaf */}
      <path d="M0,22 C-10,8 -8,-16 0,-26 C8,-16 10,8 0,22 Z"
        fill={c} strokeWidth="3.5"/>
      {/* Veins */}
      <line x1="0" y1="22"  x2="0"  y2="-22" stroke="#111" strokeWidth="1.8" opacity="0.4"/>
      <line x1="-8" y1="20" x2="-5" y2="-18" stroke="#111" strokeWidth="1.5" opacity="0.3"/>
      <line x1="8"  y1="20" x2="5"  y2="-18" stroke="#111" strokeWidth="1.5" opacity="0.3"/>
      <ellipse cx={-4} cy={-14} rx={5} ry={3} fill="white" opacity="0.35" transform="rotate(-20,-4,-14)"/>
    </g>
  )
}

// Pearl — oyster shell with pearl
function SymPearl({ c }: { c: string }) {
  return (
    <g>
      {/* Shell */}
      <path d="M-24,2 Q-22,-16 0,-20 Q22,-16 24,2 Q14,10 0,8 Q-14,10 -24,2 Z"
        fill={c} stroke="#111" strokeWidth="4" strokeLinejoin="round"/>
      <path d="M-24,2 Q-12,-6 0,-4 Q12,-6 24,2"
        stroke="#111" strokeWidth="3" fill="none"/>
      {/* Pearl */}
      <circle cx={0} cy={18} r={11} fill="white" stroke="#111" strokeWidth="3.5"/>
      <ellipse cx={-4} cy={13} rx={4} ry={2.5} fill="white" opacity="0.7"/>
      <Gloss/>
    </g>
  )
}

const SYM_FNS = [
  SymLilypad, SymHeads, SymWaves, SymStarfish, SymFish,
  SymAnchor, SymBird, SymLeaves, SymPearl,
]

// ── Mission cell number + labels ──────────────────────────────────

function MissionFace({
  mission, numColor, diffColor, diff,
}: {
  mission: number
  numColor: string
  diffColor: string
  diff: string
}) {
  const isDouble = mission >= 10
  const fs = isDouble ? 50 : 64
  const ny = isDouble ? 64  : 68
  return (
    <>
      {/* "MISSION" label above number */}
      <text x="50" y="18" textAnchor="middle"
        fontFamily="Nunito, system-ui, sans-serif"
        fontSize="9" fontWeight="800"
        letterSpacing="0.14em"
        fill={diffColor}
      >MISSION</text>
      {/* Number — outline pass */}
      <text x="50" y={ny} textAnchor="middle"
        fontFamily="Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif"
        fontSize={fs} fontWeight="900"
        stroke="#000" strokeWidth="10" strokeLinejoin="round"
        fill="none"
      >{mission}</text>
      {/* Number — fill pass */}
      <text x="50" y={ny} textAnchor="middle"
        fontFamily="Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif"
        fontSize={fs} fontWeight="900"
        fill={numColor}
      >{mission}</text>
      {/* Difficulty label */}
      <text x="50" y="91" textAnchor="middle"
        fontFamily="Nunito, system-ui, sans-serif"
        fontSize="11" fontWeight="800"
        letterSpacing="0.08em"
        fill={diffColor}
      >{diff}</text>
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

      {/* Header */}
      <div className={styles.machineHeader}>
        <span className={styles.machineDiamond}/>
        <span className={styles.machineTitle}>Missions</span>
        <span className={styles.machineDiamond}/>
      </div>

      {/* Grid */}
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
              </div>
            )
          }

          // ── Mission cell ──
          const { mission } = cell
          const world      = MISSION_WORLD[mission]
          const wc         = WORLD_COLORS[world]
          const isCurrent  = mission === currentMission
          const isDone     = mission <  currentMission
          const isLocked   = mission >  currentMission
          const numColor = isCurrent
            ? '#FFD700'
            : isDone
              ? wc
              : '#666'

          const diffLabel = DIFF[mission]

          const diffColor = isCurrent
            ? '#e8a800'
            : isDone
              ? wc
              : 'var(--muted)'

          return (
            <div key={i}
              className={[
                styles.cell,
                styles.missionCell,
                isCurrent ? styles.current : '',
              ].filter(Boolean).join(' ')}
              style={{ opacity: isLocked ? 0.55 : 1 }}
              onClick={isLocked ? undefined : () => { window.location.href = `/play/${mission}` }}
            >
              <svg viewBox="0 0 100 100" className={styles.numSvg}>
                <MissionFace
                  mission={mission}
                  numColor={numColor}
                  diffColor={diffColor}
                  diff={diffLabel}
                />
              </svg>
            </div>
          )
        })}
      </div>

    </div>
  )
}
