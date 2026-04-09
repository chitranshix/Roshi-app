'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import ThemeToggle from '@/components/ui/ThemeToggle'
import Avatar from '@/components/ui/Avatar'
import styles from './AppShell.module.css'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const [scrolled, setScrolled] = useState(false)
  const [playerName, setPlayerName] = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const name = localStorage.getItem('roshi_name')
    if (!name) {
      router.replace('/onboarding')
      return
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading localStorage must happen in useEffect
    setPlayerName(name)
    setReady(true)
  }, [router])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!ready) return null

  return (
    <div className={styles.shell}>
      <header className={[styles.header, scrolled ? styles.scrolled : ''].join(' ')}>
        <div className={styles.headerInner}>
          <img
            src={resolvedTheme === 'dark' ? '/logo-dark.png' : '/logo-light.png'}
            alt="Roshi's Word Game"
            className={styles.logo}
          />
          <div className={styles.headerRight}>
            <ThemeToggle />
            <Avatar name={playerName} size={36} />
          </div>
        </div>
      </header>
      <main className={styles.content}>
        {children}
      </main>
    </div>
  )
}
