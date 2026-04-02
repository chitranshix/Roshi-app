'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import styles from './AppShell.module.css'

interface AppShellProps {
  children: React.ReactNode
  playerName?: string
}

export default function AppShell({ children, playerName }: AppShellProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const toggleTheme = () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  const initials = playerName ? playerName.slice(0, 2) : '?'

  return (
    <div className={styles.shell}>
      <header className={[styles.header, scrolled ? styles.scrolled : ''].join(' ')}>
        <span className={styles.logo}>Roshi</span>
        <div className={styles.headerRight}>
          {mounted && (
            <button className={styles.themeToggle} onClick={toggleTheme} aria-label="Toggle theme">
              {resolvedTheme === 'dark' ? '☀️' : '🌙'}
            </button>
          )}
          <div className={styles.avatar}>{initials}</div>
        </div>
      </header>
      <main className={styles.content}>
        {children}
      </main>
    </div>
  )
}
