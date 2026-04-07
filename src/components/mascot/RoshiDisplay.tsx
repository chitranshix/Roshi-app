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

        {/* ── REAR-RIGHT FLIPPER — behind plastron, pointing right ── */}
        <path d="M112 82 Q124 80 136 96 Q138 102 134 108 Q126 112 116 96 Q112 90 112 82Z"
          fill="#2DAF7A" stroke="#1A1A08" strokeWidth="1.8" />

        {/* ── REAR-LEFT FLIPPER — behind plastron, pointing back-down ── */}
        <path d="M84 88 Q78 100 76 114 Q76 120 82 120 Q88 118 92 106 Q92 94 84 88Z"
          fill="#2DAF7A" stroke="#1A1A08" strokeWidth="1.8" />

        {/* ── PLASTRON — snug oval under shell, rear flippers behind it ── */}
        <ellipse cx="80" cy="96" rx="38" ry="9"
          fill="#D4C878" stroke="#1A1A08" strokeWidth="1.4" />

        {/* ── SHELL — wide oval side profile, warm brown ── */}
        <path d="M38 90 Q34 62 58 44 Q82 28 114 50 Q130 66 122 90Z"
          fill="#8B6420" stroke="#1A1A08" strokeWidth="2.2" />
        {/* shell highlight */}
        <path d="M50 82 Q46 62 66 50 Q86 38 110 56 Q120 68 114 82Z"
          fill="#A87830" opacity="0.45" />
        {/* scute lines */}
        <path d="M80 38 Q82 66 80 90"    stroke="#6B4C18" strokeWidth="1.6" fill="none" />
        <path d="M80 52 Q62 60 42 76"    stroke="#6B4C18" strokeWidth="1.3" fill="none" />
        <path d="M80 68 Q62 74 40 84"    stroke="#6B4C18" strokeWidth="1.2" fill="none" />
        <path d="M80 52 Q100 60 120 70"  stroke="#6B4C18" strokeWidth="1.3" fill="none" />
        <path d="M80 68 Q100 74 120 80"  stroke="#6B4C18" strokeWidth="1.2" fill="none" />
        <path d="M42 82 Q80 76 122 82"   stroke="#6B4C18" strokeWidth="1.1" fill="none" />

        {/* ── FRONT-RIGHT FLIPPER — pointing forward-down ── */}
        <path d="M60 88 Q54 100 52 112 Q52 118 58 118 Q64 116 68 104 Q68 92 60 88Z"
          fill="#3DBF90" stroke="#1A1A08" strokeWidth="1.8" />

        {/* ── FRONT-LEFT FLIPPER — most visible, pointing left ── */}
        <path d="M44 82 Q26 78 8 96 Q6 102 8 108 Q18 116 40 96 Q44 88 44 82Z"
          fill="#3DBF90" stroke="#1A1A08" strokeWidth="2" />

        {/* ── NECK — green connector from shell to head ── */}
        <path d="M42 68 Q34 60 28 56 Q26 50 30 46 Q38 42 46 50 Q50 58 46 68Z"
          fill="#3DBF90" stroke="#1A1A08" strokeWidth="2" />

        {/* ── HEAD GROUP — front-facing, bobs independently ── */}
        {/* head center: (28, 36) radius 22 */}
        <g className={expression === 'idle' ? styles.headBob : ''}>

          {/* ── HEAD ── */}
          <circle cx="28" cy="36" r="22" fill="#3DBF90" stroke="#1A1A08" strokeWidth="2.2" />

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
