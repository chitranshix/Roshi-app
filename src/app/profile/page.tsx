'use client'

import { useState, useEffect } from 'react'
import AppShell from '@/components/layout/AppShell'
import Button from '@/components/ui/Button'
import Avatar from '@/components/ui/Avatar'
import { createClient } from '@/lib/supabase'
import { getStreak } from '@/lib/daily'
import styles from './profile.module.css'

interface DareRow {
  id: string
  word: string
  from_user: string
  to_user: string
  from_points: number | null
  to_points: number | null
  created_at: string
  from_profile: { name: string } | null
  to_profile: { name: string } | null
}

function relativeTime(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function ProfilePage() {
  const [name, setName]         = useState('')
  const [saved, setSaved]       = useState(false)
  const [streak, setStreak]     = useState(0)
  const [points, setPoints]     = useState<number | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [pwSaved, setPwSaved]   = useState(false)
  const [pwError, setPwError]   = useState<string | null>(null)
  const [pastDares, setPastDares] = useState<DareRow[]>([])
  const [userId, setUserId]     = useState<string | null>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading localStorage must happen in useEffect
    setName(localStorage.getItem('roshi_name') ?? '')
    setStreak(getStreak().count)

    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      setUserId(user.id)
      const [{ data: dares }, { data: events }, { data: pastDaresData }] = await Promise.all([
        supabase
          .from('dares')
          .select('from_user, to_user, from_points, to_points, has_trap, trap_winner')
          .eq('status', 'complete')
          .or(`from_user.eq.${user.id},to_user.eq.${user.id}`),
        supabase
          .from('point_events')
          .select('points')
          .eq('user_id', user.id),
        supabase
          .from('dares')
          .select('id, word, from_user, to_user, from_points, to_points, created_at, from_profile:from_user(name), to_profile:to_user(name)')
          .eq('status', 'complete')
          .or(`from_user.eq.${user.id},to_user.eq.${user.id}`)
          .order('created_at', { ascending: false })
          .limit(30),
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
      setPastDares((pastDaresData as unknown as DareRow[]) ?? [])
    })
  }, [])

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

  const handleSave = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    localStorage.setItem('roshi_name', trimmed)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <AppShell>
      <div className={styles.page}>

        <div className={styles.avatarRow}>
          <Avatar name={name} size={72} />
          <div className={styles.statRow}>
            {streak > 0 && <div className={styles.streakBadge}>{streak} day streak 🔥</div>}
            {points !== null && <div className={styles.pointsBadge}>{points} pts</div>}
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
          <Button onClick={handleSave} disabled={!name.trim()}>
            {saved ? 'Saved ✓' : 'Save name'}
          </Button>
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
          {pwError && <div style={{ fontSize: 13, color: 'var(--wrong)' }}>{pwError}</div>}
          <Button onClick={handlePasswordSave} disabled={newPassword.length < 6}>
            {pwSaved ? 'Saved ✓' : 'Update password'}
          </Button>
        </div>

        {pastDares.length > 0 && (
          <div className={styles.section}>
            <div className={styles.label}>Past dares</div>
            <div className={styles.dareList}>
              {pastDares.map(dare => {
                const isSender  = dare.from_user === userId
                const otherName = isSender ? dare.to_profile?.name : dare.from_profile?.name
                const myPts     = isSender ? dare.from_points : dare.to_points
                return (
                  <div key={dare.id} className={styles.dareRow}>
                    <Avatar name={otherName ?? '?'} size={32} />
                    <div className={styles.dareInfo}>
                      <span className={styles.dareWord}>{dare.word}</span>
                      <span className={styles.dareMeta}>
                        {isSender ? `Dared ${otherName}` : `From ${otherName}`} · {relativeTime(dare.created_at)}
                      </span>
                    </div>
                    {myPts != null && (
                      <span className={styles.darePts}>+{myPts}</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <button className={styles.menuRow} style={{ width: '100%', cursor: 'pointer' }} onClick={async () => {
          const supabase = createClient()
          await supabase.auth.signOut()
          localStorage.removeItem('roshi_name')
          window.location.href = '/login'
        }}>
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="var(--wrong)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="M7 3H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h3"/>
            <path d="M13 14l3-4-3-4"/>
            <line x1="16" y1="10" x2="7" y2="10"/>
          </svg>
          <span className={styles.menuLabel} style={{ color: 'var(--wrong)' }}>Log out</span>
        </button>

      </div>
    </AppShell>
  )
}
