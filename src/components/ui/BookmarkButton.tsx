'use client'

import { useState, useEffect } from 'react'
import { isStarred, toggleStar } from '@/lib/starred'
import styles from './BookmarkButton.module.css'

interface Props {
  word: string
  definition: string
  size?: number
}

export default function BookmarkButton({ word, definition, size = 20 }: Props) {
  const [saved, setSaved] = useState(false)

  useEffect(() => { setSaved(isStarred(word)) }, [word])

  const handle = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const now = await toggleStar(word, definition)
    setSaved(now)
    if (navigator.vibrate) navigator.vibrate(30)
  }

  return (
    <button
      className={`${styles.btn} ${saved ? styles.active : ''}`}
      onClick={handle}
      aria-label={saved ? 'Remove bookmark' : 'Bookmark word'}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
      </svg>
    </button>
  )
}
