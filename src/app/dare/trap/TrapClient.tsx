'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AppShell from '@/components/layout/AppShell'
import Button from '@/components/ui/Button'
import Avatar from '@/components/ui/Avatar'
import { createClient } from '@/lib/supabase'
import { IconTrap } from '@/components/ui/icons'
import styles from './trap.module.css'

interface UserRow { id: string; name: string }

interface Props {
  word:    string | null
  friends: UserRow[]
  myId:    string | null
}

export default function TrapClient({ word, friends, myId }: Props) {
  const router = useRouter()
  const [selected, setSelected] = useState<string[]>([])
  const [sending, setSending]   = useState(false)

  const toggle = (id: string) =>
    setSelected(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id])

  const canSend = word && selected.length > 0 && !sending

  const handleSet = async () => {
    if (!canSend || !myId || !word) return
    setSending(true)
    const supabase = createClient()
    const rows = selected.map(friendId => ({
      from_user: myId,
      to_user:   friendId,
      word,
    }))
    await supabase.from('traps').insert(rows)
    router.push('/')
  }

  return (
    <AppShell>
      <div className={styles.screen}>
        <div className={styles.heading}><IconTrap size={22} /> Set a trap</div>
        <div className={styles.hint}>
          Pick a word and a target. When they reach that word in their levels, they won&apos;t know a trap is waiting. Perfect solve — they escape and pocket +10. Anything less — they lose 10 pts and you get +10.
        </div>

        {word && (
          <div className={styles.wordBox}>
            <span className={styles.wordLabel}>Word</span>
            <span className={styles.wordValue}>{word}</span>
          </div>
        )}

        <div className={styles.sectionLabel}>Trap who?</div>
        <div className={styles.friendList}>
          {friends.length === 0 && (
            <div className={styles.empty}>No other players yet.</div>
          )}
          {friends.map(({ id, name }) => (
            <div
              key={id}
              className={styles.friendChip}
              onClick={() => toggle(id)}
            >
              <Avatar name={name} size={48} className={selected.includes(id) ? styles.avatarSelected : undefined} />
              <div className={styles.friendName}>{name}</div>
            </div>
          ))}
        </div>

        <div className={styles.spacer} />

        <Button onClick={handleSet} disabled={!canSend}>
          {sending ? 'Setting trap…' : 'Set trap'}
        </Button>
      </div>
    </AppShell>
  )
}
