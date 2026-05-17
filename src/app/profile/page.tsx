'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Avatar from '@/components/ui/Avatar'
import { createClient } from '@/lib/supabase'
import { getStreak } from '@/lib/daily'
import { getProgress } from '@/lib/progress'
import styles from './profile.module.css'

const LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9]

export default function ProfilePage() {
  const router = useRouter()
  const [name, setName]               = useState('')
  const [saved, setSaved]             = useState(false)
  const [streak, setStreak]           = useState(0)
  const [wordsTotal, setWordsTotal]   = useState(0)
  const [points, setPoints]           = useState<number | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [pwSaved, setPwSaved]         = useState(false)
  const [pwError, setPwError]         = useState<string | null>(null)

  useEffect(() => {
    setName(localStorage.getItem('roshi_name') ?? '')
    setStreak(getStreak().count)
    const p = getProgress()
    setWordsTotal(LEVELS.reduce((sum, lv) => sum + (p.completed[lv]?.length ?? 0), 0))

    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const [{ data: dares }, { data: events }] = await Promise.all([
        supabase.from('dares').select('from_user, to_user, from_points, to_points, has_trap, trap_winner').eq('status', 'complete').or(`from_user.eq.${user.id},to_user.eq.${user.id}`),
        supabase.from('point_events').select('points').eq('user_id', user.id),
      ])
      let pts = 0
      for (const d of dares ?? []) {
        if (d.from_user === user.id && d.from_points != null) pts += d.from_points
        if (d.to_user   === user.id && d.to_points   != null) pts += d.to_points
        if (d.has_trap && d.trap_winner === 'trapper' && d.from_user === user.id) pts += 10
        if (d.has_trap && d.trap_winner === 'target'  && d.to_user   === user.id) pts += 10
      }
      for (const e of events ?? []) pts += e.points
      setPoints(pts)
    })
  }, [])

  const handleSave = async () => {
    const trimmed = name.trim()
    if (!trimmed) return
    localStorage.setItem('roshi_name', trimmed)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) await supabase.from('users').update({ name: trimmed }).eq('id', user.id)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  const handlePasswordSave = async () => {
    if (newPassword.length < 6) return
    setPwError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) { setPwError(error.message); return }
    setNewPassword('')
    setPwSaved(true)
    setTimeout(() => setPwSaved(false), 2000)
  }

  return (
    <div className={styles.page}>

      <button className={styles.back} onClick={() => router.back()} aria-label="Back">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M15.5 5L8.5 12L15.5 19" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <div className={styles.avatarRow}>
        <Avatar name={name} size={80} />
        <div className={styles.displayName}>{name || '—'}</div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statNum}>{wordsTotal}</div>
          <div className={styles.statLabel}>Mastered</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNum}>{streak}</div>
          <div className={styles.statLabel}>Day streak</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNum}>{points ?? '—'}</div>
          <div className={styles.statLabel}>Points</div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.label}>Your name</div>
        <input
          className={styles.input}
          value={name}
          onChange={e => { setName(e.target.value); setSaved(false) }}
          maxLength={20}
          placeholder="Enter your name"
          enterKeyHint="done"
          onKeyDown={e => { if (e.key === 'Enter') handleSave() }}
        />
        <button className={styles.btn} onClick={handleSave} disabled={!name.trim()}>
          {saved ? 'Saved ✓' : 'Save name'}
        </button>
      </div>

      <div className={styles.section}>
        <div className={styles.label}>Change password</div>
        <input
          className={styles.input}
          type="password"
          value={newPassword}
          onChange={e => { setNewPassword(e.target.value); setPwSaved(false); setPwError(null) }}
          placeholder="New password (min 6 chars)"
          onKeyDown={e => { if (e.key === 'Enter') handlePasswordSave() }}
        />
        {pwError && <div className={styles.error}>{pwError}</div>}
        <button className={styles.btn} onClick={handlePasswordSave} disabled={newPassword.length < 6}>
          {pwSaved ? 'Saved ✓' : 'Update password'}
        </button>
      </div>

      <button className={styles.logoutBtn} onClick={async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        localStorage.removeItem('roshi_name')
        window.location.href = '/login'
      }}>
        Log out
      </button>

    </div>
  )
}
