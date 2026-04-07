'use client'

import { useTheme } from 'next-themes'
import { useSyncExternalStore } from 'react'
import styles from './ThemeToggle.module.css'

function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
}

function MountainIcon() {
  return (
    <svg width="22" height="18" viewBox="0 0 22 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* back peak */}
      <path d="M2 17 L8 6 L14 17Z" fill="currentColor" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      {/* front peak */}
      <path d="M9 17 L15 4 L21 17Z" fill="currentColor" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      {/* snow cap */}
      <path d="M13 8 L15 4 L17 8Z" fill="var(--bg)" stroke="currentColor" strokeWidth="0.8" strokeLinejoin="round" />
    </svg>
  )
}

function OceanIcon() {
  return (
    <svg width="22" height="18" viewBox="0 0 22 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* filled wave shape */}
      <path d="M1 7 Q4 3 7 7 Q10 11 13 7 Q16 3 19 7 L21 7 L21 18 L1 18Z"
        fill="currentColor" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const mounted = useIsMounted()

  if (!mounted) return <div className={styles.placeholder} />

  const isDark = resolvedTheme === 'dark'

  return (
    <button
      className={styles.toggle}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to land (light)' : 'Switch to water (dark)'}
      title={isDark ? 'Play on land' : 'Play in water'}
    >
      <span className={[styles.option, !isDark ? styles.active : ''].join(' ')}>
        <MountainIcon />
      </span>
      <span className={[styles.option, isDark ? styles.active : ''].join(' ')}>
        <OceanIcon />
      </span>
    </button>
  )
}
