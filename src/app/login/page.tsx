'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { createClient } from '@/lib/supabase'
import styles from './login.module.css'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [sending, setSending]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const canSubmit = email.includes('@') && password.length >= 6 && !sending

  const handleLogin = async () => {
    if (!canSubmit) return
    setSending(true)
    setError(null)
    const supabase = createClient()
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    if (signInError) {
      setError('Wrong email or password.')
      setSending(false)
      return
    }
    // Sync name to localStorage
    if (data.user) {
      const { data: profile } = await supabase
        .from('users')
        .select('name')
        .eq('id', data.user.id)
        .single()
      if (profile) localStorage.setItem('roshi_name', profile.name)
    }
    router.replace('/')
  }

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <img src="/logo-light.png" alt="Roshi's Word Game" className={`${styles.logo} ${styles.logoLight}`} />
        <img src="/logo-dark.png"  alt="Roshi's Word Game" className={`${styles.logo} ${styles.logoDark}`} />
        <ThemeToggle />
      </div>

      <div className={styles.body}>
        <h1 className={styles.heading}>Welcome back.</h1>

        <input
          className={[styles.input, email.length > 0 && !email.includes('@') ? styles.inputError : ''].join(' ')}
          placeholder="Your email..."
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoFocus
        />
        <input
          className={styles.input}
          placeholder="Password..."
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
        />
        {error && <p className={styles.errorMsg}>{error}</p>}
        <Button onClick={handleLogin} disabled={!canSubmit}>
          {sending ? '…' : 'Log in'}
        </Button>
        <p className={styles.signupHint}>New here? <a href="/onboarding" className={styles.signupLink}>Sign up</a></p>
      </div>
    </div>
  )
}
