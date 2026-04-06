/**
 * GRE word list utility.
 * Loads public/data/gre-words.json — 4,804 words across 11 levels,
 * each with a definition and 4 sentences (1 correct, 3 distractors).
 */

export interface Sentence {
  sentence: string
  correct: boolean
}

export interface GREWord {
  word: string
  definition: string
  level: number
  sentences: Sentence[]
}

let _cache: GREWord[] | null = null

export async function getGREWords(): Promise<GREWord[]> {
  if (_cache) return _cache
  const res = await fetch('/data/gre-words.json')
  _cache = await res.json() as GREWord[]
  return _cache
}

export function getWordsByLevel(words: GREWord[], level: number): GREWord[] {
  return words.filter(w => w.level === level)
}

export function getWordByName(words: GREWord[], word: string): GREWord | undefined {
  return words.find(w => w.word === word)
}

/** Pick a random word from a level (for daily word / dare creation) */
export function randomWordFromLevel(words: GREWord[], level: number): GREWord | undefined {
  const pool = getWordsByLevel(words, level)
  if (pool.length === 0) return undefined
  return pool[Math.floor(Math.random() * pool.length)]
}
