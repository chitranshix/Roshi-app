interface IconProps {
  size?: number
  className?: string
}

/* ── Dare — pointing finger ── */
export function IconDare({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* index finger pointing right */}
      <path d="M3 10.5 C3 10.5 6 10 8 8.5 L8 5 C8 4 9 3.5 9.5 4 C10 4.5 10 5.5 10 6.5" />
      <path d="M10 6.5 C10 5.5 11 5 11.5 5.5 C12 6 12 7 12 7.5" />
      <path d="M12 7.5 C12 6.8 13 6.5 13.5 7 C14 7.5 14 8.5 14 9" />
      <path d="M14 9 C14 8.5 15 8.5 15.5 9.5 L16 11.5 C16.5 13.5 15 15.5 13 16 L9 16.5 C7 16.5 5.5 15 5 13.5 L3 10.5" />
    </svg>
  )
}

/* ── Trap — spider web ── */
export function IconTrap({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className={className}>
      {/* 4 radial spokes from centre */}
      <line x1="10" y1="10" x2="10" y2="2" />
      <line x1="10" y1="10" x2="10" y2="18" />
      <line x1="10" y1="10" x2="2"  y2="10" />
      <line x1="10" y1="10" x2="18" y2="10" />
      <line x1="10" y1="10" x2="4.3"  y2="4.3" />
      <line x1="10" y1="10" x2="15.7" y2="15.7" />
      <line x1="10" y1="10" x2="15.7" y2="4.3" />
      <line x1="10" y1="10" x2="4.3"  y2="15.7" />
      {/* 3 concentric web rings */}
      <path d="M10 4.5 L12.5 7 L15.5 10 L12.5 13 L10 15.5 L7.5 13 L4.5 10 L7.5 7 Z" strokeLinejoin="round" />
      <path d="M10 7 L12 9 L13 10 L12 11 L10 13 L8 11 L7 10 L8 9 Z" strokeLinejoin="round" />
      <circle cx="10" cy="10" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  )
}

/* ── Leaderboard — three ascending bars ── */
export function IconLeaderboard({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2"  y="11" width="4" height="7" rx="1" />
      <rect x="8"  y="7"  width="4" height="11" rx="1" />
      <rect x="14" y="3"  width="4" height="15" rx="1" />
    </svg>
  )
}

/* ── Star — smiley face inside a star, for starred words ── */
export function IconStar({ size = 18, filled = false, className }: IconProps & { filled?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* star outline */}
      <polygon points="10 1.5 12.2 7 18.2 7.6 13.8 11.6 15.2 17.5 10 14.3 4.8 17.5 6.2 11.6 1.8 7.6 7.8 7 10 1.5" fill={filled ? 'currentColor' : 'none'} />
      {/* tiny smiley inside */}
      <circle cx="8.2" cy="10" r="0.7" fill="currentColor" stroke="none" />
      <circle cx="11.8" cy="10" r="0.7" fill="currentColor" stroke="none" />
      <path d="M8 12 Q10 13.5 12 12" strokeWidth="1.2" />
    </svg>
  )
}

/* ── Daily — sun with rays (daily challenge) ── */
export function IconDaily({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" className={className}>
      <circle cx="10" cy="10" r="3.5" />
      <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.2 4.2l1.4 1.4M14.4 14.4l1.4 1.4M4.2 15.8l1.4-1.4M14.4 5.6l1.4-1.4" />
    </svg>
  )
}

/* ── Profile / person ── */
export function IconProfile({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="10" cy="7" r="3.5" />
      <path d="M3 18c0-3.9 3.1-7 7-7s7 3.1 7 7" />
    </svg>
  )
}
