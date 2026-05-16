/**
 * Player progress — stored in localStorage under 'roshi_progress'.
 * Tracks which words have been completed per level.
 */

const KEY = 'roshi_progress'

export interface Progress {
  level: number                          // current active level (1–11)
  completed: Record<number, string[]>   // level → completed word list
  retry?: Record<number, string[]>      // level → words still in retry pile
}

const DEFAULT: Progress = { level: 1, completed: {} }

export function getProgress(): Progress {
  if (typeof window === 'undefined') return DEFAULT
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Progress) : DEFAULT
  } catch {
    return DEFAULT
  }
}

export function saveProgress(p: Progress): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY, JSON.stringify(p))
}

export function markWordComplete(word: string, level: number): Progress {
  const p = getProgress()
  const existing = p.completed[level] ?? []
  if (existing.includes(word)) return p
  const updated: Progress = {
    ...p,
    completed: { ...p.completed, [level]: [...existing, word] },
  }
  saveProgress(updated)
  return updated
}

export function completedInLevel(level: number): string[] {
  return getProgress().completed[level] ?? []
}

export function nextWordInLevel(allWords: string[], level: number): string | null {
  const done = completedInLevel(level)
  return allWords.find(w => !done.includes(w)) ?? null
}

const WORDS_PER_LEVEL = 100

export function getRetryWords(level: number): string[] {
  return getProgress().retry?.[level] ?? []
}

export function addRetryWord(word: string, level: number): void {
  const p = getProgress()
  const existing = p.retry?.[level] ?? []
  if (existing.includes(word)) return
  saveProgress({ ...p, retry: { ...(p.retry ?? {}), [level]: [...existing, word] } })
}

export function removeRetryWord(word: string, level: number): void {
  const p = getProgress()
  const existing = p.retry?.[level] ?? []
  saveProgress({ ...p, retry: { ...(p.retry ?? {}), [level]: existing.filter(w => w !== word) } })
}

export function isLevelUnlocked(_level: number): boolean {
  return true
}
