// Static front-facing Roshi for screen moments (result, onboarding)
import type { RoshiExpression } from './Roshi'
import styles from './RoshiDisplay.module.css'

export default function RoshiDisplay({ expression = 'idle', size = 120 }: {
  expression?: RoshiExpression
  size?: number
}) {
  return (
    <div className={[styles.wrapper, styles[expression]].join(' ')} style={{ width: size, height: size * 0.86 }}>
      <svg viewBox="0 0 140 120" xmlns="http://www.w3.org/2000/svg">

        {/* ── REAR FLIPPER — behind shell, angling back-down ── */}
        <path d="M104 72 Q122 68 130 82 Q126 96 110 90 Q102 84 104 74Z"
          fill="#4AA820" stroke="#1A1A08" strokeWidth="2" />

        {/* ── BOTTOM REAR FLIPPER — peeking below shell ── */}
        <path d="M80 96 Q88 106 80 114 Q68 116 66 106 Q68 98 76 96Z"
          fill="#4AA820" stroke="#1A1A08" strokeWidth="1.8" />

        {/* ── SHELL — side dome profile, warm brown ── */}
        <path d="M42 94 Q36 58 62 38 Q88 22 112 48 Q126 68 118 94Z"
          fill="#8B6420" stroke="#1A1A08" strokeWidth="2.2" />
        {/* shell highlight */}
        <path d="M52 86 Q48 60 68 46 Q88 34 106 54 Q114 68 108 86Z"
          fill="#A87830" opacity="0.5" />
        {/* scute lines */}
        <path d="M80 38 Q82 64 80 94"   stroke="#6B4C18" strokeWidth="1.6" fill="none" />
        <path d="M80 50 Q62 60 44 78"   stroke="#6B4C18" strokeWidth="1.3" fill="none" />
        <path d="M80 66 Q62 72 44 86"   stroke="#6B4C18" strokeWidth="1.2" fill="none" />
        <path d="M80 50 Q98 60 116 72"  stroke="#6B4C18" strokeWidth="1.3" fill="none" />
        <path d="M80 66 Q98 72 116 82"  stroke="#6B4C18" strokeWidth="1.2" fill="none" />
        <path d="M44 82 Q80 76 118 82"  stroke="#6B4C18" strokeWidth="1.1" fill="none" />

        {/* ── PLASTRON — cream belly peeking at front-bottom ── */}
        <path d="M42 94 Q50 102 68 100 Q72 96 68 94Z"
          fill="#D4C878" stroke="#1A1A08" strokeWidth="1.4" />

        {/* ── FRONT FLIPPER — large paddle, extends forward-down ── */}
        <path d="M46 72 Q26 70 14 84 Q18 98 34 92 Q44 86 48 76Z"
          fill="#5CB828" stroke="#1A1A08" strokeWidth="2" />

        {/* ── NECK — green connector from shell to head ── */}
        <path d="M42 68 Q34 60 28 56 Q26 50 30 46 Q38 42 46 50 Q50 58 46 68Z"
          fill="#5CB828" stroke="#1A1A08" strokeWidth="2" />

        {/* ── HEAD GROUP — front-facing, bobs independently ── */}
        {/* head center: (28, 36) radius 22 */}
        <g className={expression === 'idle' ? styles.headBob : ''}>

          {/* ── HEAD ── */}
          <circle cx="28" cy="36" r="22" fill="#5CB828" stroke="#1A1A08" strokeWidth="2.2" />

          {/* ── EYES ── */}
          {expression === 'happy' ? <>
            <path d="M14 30 Q20 22 26 30" stroke="#1A1A08" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <path d="M30 30 Q36 22 42 30" stroke="#1A1A08" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          </> : expression === 'disappointed' ? <>
            <path d="M10 26 Q18 32 26 28" stroke="#1A1A08" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <path d="M30 28 Q36 32 44 26" stroke="#1A1A08" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <circle cx="18" cy="36" r="9"  fill="white" stroke="#1A1A08" strokeWidth="1.8" />
            <circle cx="38" cy="36" r="9"  fill="white" stroke="#1A1A08" strokeWidth="1.8" />
            <circle cx="18" cy="38" r="5"  fill="#1A1A08" />
            <circle cx="38" cy="38" r="5"  fill="#1A1A08" />
          </> : <>
            <circle cx="18" cy="34" r="10" fill="white" stroke="#1A1A08" strokeWidth="1.8" />
            <circle cx="38" cy="34" r="10" fill="white" stroke="#1A1A08" strokeWidth="1.8" />
            <circle cx="19" cy="35" r="5.5" fill="#1A1A08" className={styles.pupilL} />
            <circle cx="39" cy="35" r="5.5" fill="#1A1A08" className={styles.pupilR} />
            <circle cx="21" cy="32" r="2.2" fill="white" className={styles.pupilL} />
            <circle cx="41" cy="32" r="2.2" fill="white" className={styles.pupilR} />
          </>}

          {/* ── MOUTH ── */}
          {expression === 'happy' ? <>
            <path d="M14 48 Q28 58 42 48" stroke="#1A1A08" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </> : expression === 'disappointed' ? <>
            <path d="M16 50 Q22 44 28 48 Q34 52 40 44" stroke="#1A1A08" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </> : <>
            {/* smirk — flat left, right corner up */}
            <path d="M18 50 Q28 51 38 45" stroke="#1A1A08" strokeWidth="2.2" fill="none" strokeLinecap="round" />
            {/* leaf anchored at right mouth corner */}
            <g className={styles.leafChew}>
              <path d="M38 45 Q52 30 62 36 Q58 50 38 45Z" fill="#4DB330" stroke="#2D8018" strokeWidth="1.4" />
              <path d="M38 45 Q52 32 60 37" stroke="#2D8018" strokeWidth="1" fill="none" opacity="0.7" />
            </g>
          </>}

        </g>

      </svg>
    </div>
  )
}
