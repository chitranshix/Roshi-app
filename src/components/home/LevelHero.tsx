'use client'

import { useState } from 'react'
import { completedInLevel, isLevelUnlocked } from '@/lib/progress'
import styles from './LevelHero.module.css'

// ── Data ─────────────────────────────────────────────────────────

const WORDS_PER_LEVEL = 100

export const LEVEL_NAMES: Record<number, string> = {
  1: 'Foundations',    2: 'Essentials',    3: 'Building Blocks',
  4: 'Expanding',      5: 'Intermediate',  6: 'Advanced',
  7: 'Proficient',     8: 'Expert',        9: 'Master',
  10: 'Scholar',       11: 'Virtuoso',
}

const DIFF: Record<number, string> = {
  1: 'Easy', 2: 'Easy', 3: 'Easy',
  4: 'Medium', 5: 'Medium', 6: 'Medium',
  7: 'Hard', 8: 'Hard', 9: 'Hard', 10: 'Hard', 11: 'Hard',
}

type WorldKey = 'coast' | 'wild' | 'summit'

const WORLDS: Record<WorldKey, { color: string; label: string; from: number; to: number }> = {
  coast:  { color: '#2a9d8f', label: 'The Coast',  from: 0, to: 2  },
  wild:   { color: '#5a8a3a', label: 'The Wild',   from: 3, to: 5  },
  summit: { color: '#5272a0', label: 'The Summit', from: 6, to: 10 },
}

interface NodeDef { level: number; col: 0|1|2|3; world: WorldKey }

const NODE_DEFS: NodeDef[] = [
  { level: 1,  col: 1, world: 'coast'  },
  { level: 2,  col: 3, world: 'coast'  },
  { level: 3,  col: 2, world: 'coast'  },
  { level: 4,  col: 0, world: 'wild'   },
  { level: 5,  col: 2, world: 'wild'   },
  { level: 6,  col: 3, world: 'wild'   },
  { level: 7,  col: 1, world: 'summit' },
  { level: 8,  col: 3, world: 'summit' },
  { level: 9,  col: 0, world: 'summit' },
  { level: 10, col: 2, world: 'summit' },
  { level: 11, col: 1, world: 'summit' },
]

// ── SVG map geometry ─────────────────────────────────────────────

const MAP_W   = 390
const MAP_R   = 30
const MAP_ROW = 130
const MAP_TOP = 90
const COLS    = [58, 148, 242, 332]
const MAP_H   = MAP_TOP + (NODE_DEFS.length - 1) * MAP_ROW + 120

function nodeXY(i: number) {
  return { x: COLS[NODE_DEFS[i].col], y: MAP_TOP + i * MAP_ROW }
}

function buildFullPath() {
  return NODE_DEFS.map((_, i) => {
    const { x, y } = nodeXY(i)
    if (i === 0) return `M${x},${y}`
    const p = nodeXY(i - 1)
    const h = MAP_ROW * 0.46
    return `C${p.x},${p.y + h} ${x},${y - h} ${x},${y}`
  }).join(' ')
}

// ── Snowglobe scenes ─────────────────────────────────────────────
// Each centred at (0,0), sized to fit within radius MAP_R.

function CoastScene() {
  const r = MAP_R
  return (
    <g>
      {/* Sky */}
      <rect x={-r} y={-r} width={r * 2} height={r * 1.5} fill="#a8dff0"/>
      {/* Sun */}
      <circle cx={14} cy={-18} r={7} fill="#f9d94e" opacity="0.9"/>
      {/* Sea base */}
      <rect x={-r} y={r * 0.1} width={r * 2} height={r * 0.9} fill="#1e8c80"/>
      {/* Wave crest */}
      <path
        d={`M${-r},${r * 0.1} Q${-r * 0.75},${-r * 0.1} ${-r * 0.5},${r * 0.1} Q${-r * 0.25},${r * 0.3} 0,${r * 0.1} Q${r * 0.25},${-r * 0.1} ${r * 0.5},${r * 0.1} Q${r * 0.75},${r * 0.3} ${r},${r * 0.1} L${r},${r} L${-r},${r} Z`}
        fill="#2abfad" opacity="0.85"
      />
      {/* Foam lines */}
      <path
        d={`M${-r},${r * 0.1} Q${-r * 0.75},${-r * 0.1} ${-r * 0.5},${r * 0.1}`}
        stroke="white" strokeWidth="1.3" fill="none" opacity="0.55"
      />
      <path
        d={`M0,${r * 0.1} Q${r * 0.25},${-r * 0.1} ${r * 0.5},${r * 0.1}`}
        stroke="white" strokeWidth="1.3" fill="none" opacity="0.55"
      />
    </g>
  )
}

function WildScene() {
  const r = MAP_R
  return (
    <g>
      {/* Sky */}
      <rect x={-r} y={-r} width={r * 2} height={r * 2} fill="#c3e6b8"/>
      {/* Back hills */}
      <path
        d={`M${-r},${r * 0.4} Q${-r * 0.5},${-r * 0.15} 0,${r * 0.15} Q${r * 0.5},${r * 0.45} ${r},${r * 0.15} L${r},${r} L${-r},${r} Z`}
        fill="#5a8a3a" opacity="0.28"
      />
      {/* Front ground */}
      <path
        d={`M${-r},${r * 0.65} Q${-r * 0.4},${r * 0.28} 0,${r * 0.5} Q${r * 0.4},${r * 0.72} ${r},${r * 0.5} L${r},${r} L${-r},${r} Z`}
        fill="#4a7a2e" opacity="0.7"
      />
      {/* Pine tree */}
      <polygon points={`-4,${r * 0.18} 4,${r * 0.18} 0,${-r * 0.05}`} fill="#2d5a1a" opacity="0.85"/>
      <polygon points={`-6,${r * 0.35} 6,${r * 0.35} 0,${r * 0.12}`}  fill="#3a7022" opacity="0.85"/>
      <rect x={-1.5} y={r * 0.35} width={3} height={r * 0.18} fill="#7a5230" opacity="0.75"/>
    </g>
  )
}

function SummitScene() {
  const r = MAP_R
  return (
    <g>
      {/* Night-ish sky */}
      <rect x={-r} y={-r} width={r * 2} height={r * 2} fill="#ccddf0"/>
      {/* Far mountain */}
      <path
        d={`M${-r},${r * 0.55} L${-r * 0.25},${-r * 0.3} L${r * 0.38},${r * 0.35} L${r},${r * 0.55} L${r},${r} L${-r},${r} Z`}
        fill="#7090b8" opacity="0.3"
      />
      {/* Main mountain */}
      <path
        d={`M${-r * 0.5},${r * 0.75} L0,${-r * 0.45} L${r * 0.5},${r * 0.75} Z`}
        fill="#4a6890" opacity="0.7"
      />
      {/* Snow cap */}
      <path
        d={`M${-r * 0.2},${-r * 0.08} L0,${-r * 0.45} L${r * 0.2},${-r * 0.08} L${r * 0.12},${-r * 0.02} L${-r * 0.12},${-r * 0.02} Z`}
        fill="white" opacity="0.93"
      />
      {/* Stars */}
      <circle cx={-19} cy={-20} r={1.6} fill="white" opacity="0.85"/>
      <circle cx={16}  cy={-22} r={1.1} fill="white" opacity="0.7"/>
      <circle cx={-6}  cy={-25} r={1.3} fill="white" opacity="0.65"/>
      <circle cx={22}  cy={-14} r={0.9} fill="white" opacity="0.6"/>
    </g>
  )
}

type SceneFn = () => React.ReactElement
const SCENES: Record<WorldKey, SceneFn> = {
  coast:  CoastScene,
  wild:   WildScene,
  summit: SummitScene,
}

// ── Main component ────────────────────────────────────────────────

export default function LevelHero() {
  const [currentLevel] = useState(() => {
    for (let lvl = 1; lvl <= 11; lvl++) {
      if (isLevelUnlocked(lvl) && completedInLevel(lvl).length < WORDS_PER_LEVEL) return lvl
    }
    return 11
  })

  return (
    <div className={styles.wrap}>

      <p className={styles.mapLabel}>Missions</p>

      {/* ── Mission path map ── */}
      <div className={styles.mapWrap}>
        <svg
          width="100%"
          viewBox={`0 0 ${MAP_W} ${MAP_H}`}
          style={{ display: 'block' }}
        >
          {/* Globe clip paths */}
          <defs>
            {NODE_DEFS.map((nd, i) => {
              const { x, y } = nodeXY(i)
              return (
                <clipPath key={nd.level} id={`gc-${nd.level}`}>
                  <circle cx={x} cy={y} r={MAP_R}/>
                </clipPath>
              )
            })}
          </defs>

          {/* Trail — full dashed grey */}
          <path
            d={buildFullPath()}
            fill="none"
            stroke="var(--border)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="11 9"
          />

          {/* Trail — completed portion */}
          {NODE_DEFS.slice(0, currentLevel - 1).map((_, i) => {
            const from = nodeXY(i)
            const to   = nodeXY(i + 1)
            const h    = MAP_ROW * 0.46
            const wc   = WORLDS[NODE_DEFS[i].world].color
            return (
              <path key={i}
                d={`M${from.x},${from.y} C${from.x},${from.y + h} ${to.x},${to.y - h} ${to.x},${to.y}`}
                fill="none" stroke={wc} strokeWidth="4"
                strokeLinecap="round" opacity="0.55"
              />
            )
          })}

          {/* Nodes */}
          {NODE_DEFS.map((nd, i) => {
            const { x, y }  = nodeXY(i)
            const wc         = WORLDS[nd.world].color
            const isCurrent  = nd.level === currentLevel
            const isDone     = nd.level <  currentLevel
            const isLocked   = nd.level >  currentLevel
            const done       = completedInLevel(nd.level).length
            const nodePct    = Math.round((done / WORDS_PER_LEVEL) * 100)
            const SceneComp  = SCENES[nd.world]

            return (
              <g key={nd.level}
                style={{ cursor: isLocked ? 'default' : 'pointer' }}
                onClick={isLocked ? undefined : () => { window.location.href = `/play/${nd.level}` }}
              >
                {/* Label above — LVL # */}
                <text
                  x={x} y={y - MAP_R - 22}
                  textAnchor="middle"
                  fontFamily="var(--font-ui), system-ui, sans-serif"
                  fontSize="8" fontWeight="700"
                  letterSpacing="0.07em"
                  fill={wc}
                  opacity={isLocked ? 0.4 : 0.7}
                >
                  {`LVL ${nd.level}`}
                </text>

                {/* Label above — mission name */}
                <text
                  x={x} y={y - MAP_R - 9}
                  textAnchor="middle"
                  fontFamily="var(--font-ui), system-ui, sans-serif"
                  fontSize="11"
                  fontWeight={isCurrent ? '800' : '600'}
                  fill={isCurrent ? 'var(--accent)' : isLocked ? 'var(--muted)' : 'var(--text)'}
                  opacity={isLocked ? 0.55 : 1}
                >
                  {LEVEL_NAMES[nd.level]}
                </text>

                {/* Pulse rings on current node */}
                {isCurrent && (
                  <>
                    <circle cx={x} cy={y} r={MAP_R + 11} fill="none"
                      stroke="var(--accent)" strokeWidth="1.5" opacity="0.14"/>
                    <circle cx={x} cy={y} r={MAP_R + 5} fill="none"
                      stroke="var(--accent)" strokeWidth="2" opacity="0.22"/>
                  </>
                )}

                {/* Globe scene (clipped inside globe circle) */}
                <g clipPath={`url(#gc-${nd.level})`} opacity={isLocked ? 0.4 : 1}>
                  <g transform={`translate(${x},${y})`}>
                    <SceneComp/>
                  </g>
                </g>

                {/* Done overlay: soft tint + checkmark */}
                {isDone && (
                  <g transform={`translate(${x},${y})`}>
                    <circle r={MAP_R} fill={wc} opacity="0.1"/>
                    <path d="M-10,0 L-3,8 L10,-8"
                      stroke="white" strokeWidth="2.8" fill="none"
                      strokeLinecap="round" strokeLinejoin="round"
                      opacity="0.85"
                    />
                  </g>
                )}

                {/* Current: warm glow tint */}
                {isCurrent && (
                  <g transform={`translate(${x},${y})`}>
                    <circle r={MAP_R} fill="var(--accent)" opacity="0.08"/>
                  </g>
                )}

                {/* Glass rim + glare + pedestal */}
                <g transform={`translate(${x},${y})`}>
                  {/* Rim */}
                  <circle r={MAP_R}
                    fill="none"
                    stroke={isCurrent ? 'var(--accent)' : isDone ? wc : 'var(--border)'}
                    strokeWidth={isCurrent ? 2.5 : 1.8}
                    opacity={isCurrent ? 0.85 : isDone ? 0.55 : 0.45}
                  />
                  {/* Glass glare highlight */}
                  <ellipse cx={-10} cy={-13} rx={9} ry={6}
                    fill="white" opacity="0.2"
                    transform="rotate(-25,-10,-13)"
                  />
                  {/* Pedestal */}
                  <rect x={-13} y={MAP_R - 1} width={26} height={5} rx={2.5}
                    fill={isLocked ? 'var(--border)' : wc}
                    opacity={isLocked ? 0.25 : 0.4}
                  />
                  <rect x={-9} y={MAP_R - 1} width={18} height={2} rx={1}
                    fill="white" opacity="0.18"
                  />
                </g>

                {/* Label below — difficulty or progress */}
                <text
                  x={x} y={y + MAP_R + 20}
                  textAnchor="middle"
                  fontFamily="var(--font-ui), system-ui, sans-serif"
                  fontSize="9" fontWeight="700"
                  letterSpacing="0.07em"
                  fill={isCurrent ? 'var(--accent)' : isLocked ? 'var(--border)' : 'var(--muted)'}
                  opacity={isLocked ? 0.6 : 0.85}
                >
                  {isCurrent && nodePct > 0
                    ? `${nodePct}% DONE`
                    : DIFF[nd.level].toUpperCase()}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
