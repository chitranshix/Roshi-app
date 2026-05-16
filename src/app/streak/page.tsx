'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getStreak, getRecentActivity, getTodayPoints } from '@/lib/daily'
import { completedInLevel, isLevelUnlocked } from '@/lib/progress'
import styles from './streak.module.css'

const DAYS = 70 // 10 weeks
const LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const WORDS_PER_LEVEL = 100

function getCurrentLevel(): number {
  for (const lv of LEVELS) {
    if (isLevelUnlocked(lv) && completedInLevel(lv).length < WORDS_PER_LEVEL) return lv
  }
  return 9
}

export default function StreakPage() {
  const router = useRouter()
  const [streak, setStreak]         = useState(0)
  const [activity, setActivity]     = useState<boolean[]>([])
  const [playedToday, setPlayedToday] = useState(false)
  const [todayPts, setTodayPts]     = useState(0)
  const [currentLevel, setCurrentLevel] = useState(1)

  useEffect(() => {
    const s = getStreak()
    const a = getRecentActivity(DAYS)
    const played = a[a.length - 1]
    setStreak(played ? Math.max(s.count, 1) : s.count)
    setActivity(a)
    setPlayedToday(played)
    setTodayPts(getTodayPoints())
    setCurrentLevel(getCurrentLevel())
  }, [])

  // Group into weeks (columns of 7)
  const weeks: boolean[][] = []
  for (let i = 0; i < activity.length; i += 7) {
    weeks.push(activity.slice(i, i + 7))
  }

  return (
    <div className={styles.page}>

      <button className={styles.back} onClick={() => router.back()} aria-label="Back">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M15.5 5L8.5 12L15.5 19" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <div className={styles.hero}>
        <div className={styles.streakNum}>{streak}</div>
        <div className={styles.streakLabel}>day streak</div>
        {playedToday ? (
          <div className={styles.todayDone}>
            {todayPts > 0 ? `+${todayPts} pts scored today ✓` : 'You played today ✓'}
          </div>
        ) : (
          <div className={styles.todayPending}>Play today to keep your streak</div>
        )}
      </div>

      <Link href={`/play/${currentLevel}`} className={styles.resumeBtn}>
        {playedToday ? 'Keep going →' : 'Play today →'}
      </Link>

      <div className={styles.grid}>
        {weeks.map((week, wi) => (
          <div key={wi} className={styles.week}>
            {week.map((active, di) => {
              const isToday = wi === weeks.length - 1 && di === week.length - 1
              return (
                <div
                  key={di}
                  className={[
                    styles.cell,
                    active  ? styles.cellActive  : '',
                    isToday ? styles.cellToday   : '',
                  ].filter(Boolean).join(' ')}
                />
              )
            })}
          </div>
        ))}
      </div>

      <div className={styles.legend}>
        <div className={`${styles.cell} ${styles.cellLegend}`} />
        <span>no activity</span>
        <div className={`${styles.cell} ${styles.cellActive} ${styles.cellLegend}`} />
        <span>played</span>
      </div>

    </div>
  )
}
