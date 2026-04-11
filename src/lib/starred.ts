const KEY = 'roshi_starred'

export interface StarredWord {
  word:       string
  definition: string
  starredAt:  string  // ISO date
}

export function getStarred(): StarredWord[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function isStarred(word: string): boolean {
  return getStarred().some(w => w.word === word)
}

export function toggleStar(word: string, definition: string): boolean {
  const current = getStarred()
  const idx     = current.findIndex(w => w.word === word)
  if (idx >= 0) {
    localStorage.setItem(KEY, JSON.stringify(current.filter((_, i) => i !== idx)))
    return false
  } else {
    localStorage.setItem(KEY, JSON.stringify([
      { word, definition, starredAt: new Date().toISOString() },
      ...current,
    ]))
    return true
  }
}
