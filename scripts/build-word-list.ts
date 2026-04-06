/**
 * build-word-list.ts
 *
 * Step 1 of the GRE data pipeline.
 * Reads the raw TSV, cleans it, sorts by frequency (most common first),
 * assigns levels, and writes:
 *   public/data/gre-words-raw.json  — word + definition + level (no sentences yet)
 *
 * Run: npx tsx scripts/build-word-list.ts
 */

import fs from 'fs'
import path from 'path'

const TSV_PATH  = '/tmp/gre-raw.tsv'
const FREQ_PATH = '/Users/aashu/Documents/workspace/huckleberry/huckleberry/public/data/freq.json'
const OUT_PATH  = path.join(process.cwd(), 'public/data/gre-words-raw.json')

// Level sizes (number of new words per level)
// L1:100  L2:150  L3:200  L4:300  L5:400  L6:500  L7:600  L8:700  L9:800  L10:900  L11:rest
const LEVEL_SIZES = [100, 150, 200, 300, 400, 500, 600, 700, 800, 900, Infinity]

function assignLevel(index: number): number {
  let cumulative = 0
  for (let i = 0; i < LEVEL_SIZES.length; i++) {
    cumulative += LEVEL_SIZES[i]
    if (index < cumulative) return i + 1
  }
  return 11
}

function isCleanWord(word: string): boolean {
  return /^[a-z]{3,20}$/.test(word)
}

function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim()
}

function cleanDefinition(def: string): string {
  const stripped = stripHtml(def)
  // Take only the first sentence/clause if very long
  const trimmed = stripped.length > 120 ? stripped.slice(0, 120).replace(/[;,]?\s*\w*$/, '') + '.' : stripped
  return trimmed.trim()
}

// Load freq data
const freqData: Record<string, number> = JSON.parse(fs.readFileSync(FREQ_PATH, 'utf-8'))

// Parse TSV
const raw = fs.readFileSync(TSV_PATH, 'utf-8')
const lines = raw.split('\n').filter(l => l.trim())

const seen = new Set<string>()
const words: { word: string; definition: string; level: number; _freq: number }[] = []

for (const line of lines) {
  const parts = line.split('\t')
  if (parts.length < 2) continue

  const word = parts[0].trim().toLowerCase()
  const def  = cleanDefinition(parts[1] || '')

  if (!isCleanWord(word)) continue
  if (seen.has(word)) continue
  if (!def || def.length < 3) continue

  const freq = freqData[word] ?? 0
  // Skip words that are too common to be interesting in a dare game
  if (freq > 2.0) continue

  seen.add(word)
  words.push({ word, definition: def, level: 0, _freq: freq })
}

// Ordering strategy:
//   1. Words with freq 1.0–3.2 first, sorted descending (recognisable but not trivial)
//   2. Words with no freq data next (very rare/obscure — harder levels)
//   3. Words with freq > 3.2 last (too common to be interesting)
function sortKey(freq: number): number {
  if (freq === 0) return 1          // no data → middle bucket (unknown difficulty)
  if (freq > 3.2) return 2          // too common → last
  return 0                          // sweet spot → first, sorted by freq desc within
}

words.sort((a, b) => {
  const bucketDiff = sortKey(a._freq) - sortKey(b._freq)
  if (bucketDiff !== 0) return bucketDiff
  return b._freq - a._freq          // within bucket 0: higher freq = earlier level
})

// Assign levels by sorted index
words.forEach((w, i) => { w.level = assignLevel(i) })

// Strip internal freq field before writing
const output = words.map(({ word, definition, level }) => ({ word, definition, level }))

fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true })
fs.writeFileSync(OUT_PATH, JSON.stringify(output, null, 2))

// Summary
const levelCounts = Array.from({ length: 11 }, (_, i) =>
  output.filter(w => w.level === i + 1).length
)
console.log(`✓ ${output.length} words written to ${OUT_PATH}`)
console.log('Level distribution:')
levelCounts.forEach((count, i) => {
  const sample = output.filter(w => w.level === i + 1).slice(0, 5).map(w => w.word).join(', ')
  console.log(`  Level ${i + 1}: ${count} words  (e.g. ${sample})`)
})
