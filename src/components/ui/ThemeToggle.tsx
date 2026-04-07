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
      {/* back peak — solid, drawn first so front overlaps it naturally */}
      <path d="M2 17 L8 7 L14 17Z" fill="currentColor" />
      {/* front peak — solid, taller, overlaps back */}
      <path d="M8 17 L14 3 L20 17Z" fill="currentColor" />
    </svg>
  )
}

function OceanIcon() {
  return (
    <svg width="22" height="18" viewBox="0 0 22 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 6 Q4.5 2 8 6 Q11.5 10 15 6 Q18.5 2 21 6"
        stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path d="M1 11 Q4.5 7 8 11 Q11.5 15 15 11 Q18.5 7 21 11"
        stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none" />
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
