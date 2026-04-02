import Link from 'next/link'
import AppShell from '@/components/layout/AppShell'
import Button from '@/components/ui/Button'
import { MOCK_DAILY, MOCK_DARES, MOCK_PLAYER } from '@/lib/mock'
import styles from './page.module.css'

export default function Home() {
  const pendingYou  = MOCK_DARES.filter(d => d.status === 'pending_you')
  const pendingThem = MOCK_DARES.filter(d => d.status === 'pending_them')

  return (
    <AppShell playerName={MOCK_PLAYER}>

      {/* Daily Word */}
      <div className={styles.dailyCard}>
        <div className={styles.dailyLabel}>Today's Word</div>
        <div className={styles.dailyWord}>{MOCK_DAILY.word}</div>
        <div className={styles.friendDots}>
          {MOCK_DAILY.allPlayers.map(name => {
            const done = MOCK_DAILY.completedBy.includes(name)
            const label = name === MOCK_PLAYER ? 'You' : name
            return (
              <div key={name} className={styles.friendDot}>
                <div className={[styles.dot, done ? styles.done : ''].join(' ')}>
                  {label.slice(0, 2)}
                </div>
                <div className={styles.dotName}>{label}</div>
              </div>
            )
          })}
        </div>
        <Link href="/daily">
          <Button>Play →</Button>
        </Link>
      </div>

      {/* Your move */}
      {pendingYou.length > 0 && (
        <>
          <div className={styles.sectionLabel}>Your move</div>
          {pendingYou.map(dare => (
            <Link key={dare.id} href={`/dare/${dare.id}`} style={{ display: 'block' }}>
              <div className={styles.dareCard}>
                <div>
                  <div className={styles.dareMeta}>{dare.from} · {dare.sentAt}</div>
                  <div className={styles.dareTitle}>???</div>
                </div>
                <div className={styles.goCircle}>→</div>
              </div>
            </Link>
          ))}
        </>
      )}

      {/* Their move */}
      {pendingThem.length > 0 && (
        <>
          <div className={styles.sectionLabel}>Their move</div>
          {pendingThem.map(dare => (
            <div key={dare.id} className={styles.dareCard} style={{ cursor: 'default' }}>
              <div>
                <div className={styles.dareMeta}>{dare.to} · {dare.sentAt}</div>
                <div className={[styles.dareTitle, styles.waiting].join(' ')}>⏳ thinking...</div>
              </div>
            </div>
          ))}
        </>
      )}

      {/* Dare someone */}
      <Link href="/dare/new" style={{ display: 'block', marginTop: 4 }}>
        <Button variant="ghost">+ Dare someone</Button>
      </Link>

    </AppShell>
  )
}
