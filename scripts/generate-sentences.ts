/**
 * generate-sentences.ts
 *
 * Step 2 of the GRE data pipeline.
 * Uses Claude Batches API to generate 4 sentences per word (1 correct + 3 plausible-but-wrong).
 * Writes: public/data/gre-words.json — complete data with sentences included.
 *
 * Supports resume: saves batch ID to /tmp/gre-batch-state.json so you can Ctrl-C and restart.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=... npx tsx scripts/generate-sentences.ts [--level 1] [--limit 100]
 *
 * Options:
 *   --level N     Only process words at level N (default: all levels)
 *   --limit N     Max words to process in this run (default: all)
 *   --poll-only   Don't create a new batch — just poll + merge an existing one
 */

import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'
import path from 'path'

const IN_PATH    = path.join(process.cwd(), 'public/data/gre-words-raw.json')
const OUT_PATH   = path.join(process.cwd(), 'public/data/gre-words.json')
const STATE_PATH = '/tmp/gre-batch-state.json'

interface RawWord {
  word: string
  definition: string
  level: number
}

interface Sentence {
  sentence: string
  correct: boolean
}

interface FullWord extends RawWord {
  sentences: Sentence[]
}

interface BatchState {
  batchId: string
  wordKeys: string[]   // words submitted in this batch, in order
  createdAt: string
}

// Parse CLI args
const args = process.argv.slice(2)
const levelArg = args.includes('--level') ? parseInt(args[args.indexOf('--level') + 1]) : null
const limitArg = args.includes('--limit') ? parseInt(args[args.indexOf('--limit') + 1]) : null
const pollOnly = args.includes('--poll-only')

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function makePrompt(word: string, definition: string): string {
  return `Generate exactly 4 sentences for the word "${word}" (definition: ${definition}).

Rules:
- Sentence 1: Uses the word CORRECTLY in a vivid, natural context.
- Sentences 2–4: Use the word INCORRECTLY — plausible-sounding but the context contradicts or misapplies the meaning. Each should feel like a believable trap for someone who half-knows the word.
- All sentences should be 12–25 words.
- The word "${word}" must appear in every sentence.
- Do not explain or label anything.

Respond with ONLY a JSON array of 4 objects, no markdown fences:
[
  {"sentence": "...", "correct": true},
  {"sentence": "...", "correct": false},
  {"sentence": "...", "correct": false},
  {"sentence": "...", "correct": false}
]`
}

function parseResponse(text: string): Sentence[] | null {
  try {
    // Strip any markdown fences, including ones with curly-quotes or smart dashes
    let cleaned = text.trim()
    cleaned = cleaned.replace(/^```[a-z]*\s*/i, '').replace(/```\s*$/i, '').trim()
    // Extract JSON array if there's surrounding text
    const arrMatch = cleaned.match(/\[[\s\S]*\]/)
    if (arrMatch) cleaned = arrMatch[0]
    const parsed = JSON.parse(cleaned)
    if (!Array.isArray(parsed) || parsed.length !== 4) return null
    const correctCount = parsed.filter((s: Sentence) => s.correct === true).length
    if (correctCount !== 1) return null
    for (const item of parsed) {
      if (typeof item.sentence !== 'string' || typeof item.correct !== 'boolean') return null
      if (item.sentence.length < 20) return null
    }
    return parsed as Sentence[]
  } catch {
    return null
  }
}

// Load existing output (for resume/merge)
function loadExisting(): Map<string, FullWord> {
  const map = new Map<string, FullWord>()
  if (fs.existsSync(OUT_PATH)) {
    const data: FullWord[] = JSON.parse(fs.readFileSync(OUT_PATH, 'utf-8'))
    for (const w of data) {
      if (w.sentences && w.sentences.length === 4) map.set(w.word, w)
    }
  }
  return map
}

async function submitBatch(words: RawWord[]): Promise<BatchState> {
  console.log(`Submitting batch of ${words.length} words…`)

  const requests = words.map(w => ({
    custom_id: w.word,
    params: {
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [{ role: 'user' as const, content: makePrompt(w.word, w.definition) }],
    },
  }))

  const batch = await client.messages.batches.create({ requests })
  const state: BatchState = {
    batchId: batch.id,
    wordKeys: words.map(w => w.word),
    createdAt: new Date().toISOString(),
  }
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2))
  console.log(`Batch created: ${batch.id}`)
  console.log(`State saved to ${STATE_PATH}`)
  return state
}

async function pollBatch(batchId: string): Promise<boolean> {
  const batch = await client.messages.batches.retrieve(batchId)
  const { processing_status, request_counts } = batch
  console.log(`Status: ${processing_status} | ${JSON.stringify(request_counts)}`)
  return processing_status === 'ended'
}

async function mergeBatch(state: BatchState, allRaw: Map<string, RawWord>, existing: Map<string, FullWord>): Promise<void> {
  console.log(`Merging results for batch ${state.batchId}…`)

  let success = 0
  let failed = 0

  for await (const result of await client.messages.batches.results(state.batchId)) {
    const word = result.custom_id
    const raw = allRaw.get(word)
    if (!raw) continue

    if (result.result.type !== 'succeeded') {
      console.warn(`  ✗ ${word}: ${result.result.type}`)
      failed++
      continue
    }

    const content = result.result.message.content[0]
    if (content.type !== 'text') { failed++; continue }

    const sentences = parseResponse(content.text)
    if (!sentences) {
      console.warn(`  ✗ ${word}: parse failed — ${content.text.slice(0, 80)}`)
      failed++
      continue
    }

    existing.set(word, { ...raw, sentences })
    success++
  }

  console.log(`Merged: ${success} ok, ${failed} failed`)

  // Write output — all raw words, with sentences where available
  const rawArr: RawWord[] = JSON.parse(fs.readFileSync(IN_PATH, 'utf-8'))
  const output: (FullWord | RawWord)[] = rawArr.map(w => existing.get(w.word) ?? w)
  fs.writeFileSync(OUT_PATH, JSON.stringify(output, null, 2))

  const withSentences = output.filter(w => 'sentences' in w).length
  console.log(`✓ ${OUT_PATH} written — ${withSentences}/${output.length} words have sentences`)
}

async function main() {
  const rawArr: RawWord[] = JSON.parse(fs.readFileSync(IN_PATH, 'utf-8'))
  const allRaw = new Map(rawArr.map(w => [w.word, w]))
  const existing = loadExisting()

  // Poll-only mode: check + merge an existing batch
  if (pollOnly) {
    if (!fs.existsSync(STATE_PATH)) {
      console.error('No state file found at', STATE_PATH)
      process.exit(1)
    }
    const state: BatchState = JSON.parse(fs.readFileSync(STATE_PATH, 'utf-8'))
    const done = await pollBatch(state.batchId)
    if (!done) {
      console.log('Batch not finished yet. Run again with --poll-only to check again.')
      return
    }
    await mergeBatch(state, allRaw, existing)
    fs.unlinkSync(STATE_PATH)
    return
  }

  // Check if there's a pending batch we should finish first
  if (fs.existsSync(STATE_PATH)) {
    const state: BatchState = JSON.parse(fs.readFileSync(STATE_PATH, 'utf-8'))
    console.log(`Found existing batch ${state.batchId} (created ${state.createdAt})`)
    const done = await pollBatch(state.batchId)
    if (done) {
      await mergeBatch(state, allRaw, existing)
      fs.unlinkSync(STATE_PATH)
    } else {
      console.log('Batch still processing. Run with --poll-only to check again.')
      return
    }
  }

  // Select words to process
  let toProcess = rawArr.filter(w => !existing.has(w.word))
  if (levelArg !== null) toProcess = toProcess.filter(w => w.level === levelArg)
  if (limitArg !== null) toProcess = toProcess.slice(0, limitArg)

  if (toProcess.length === 0) {
    console.log('Nothing to process — all words already have sentences.')
    return
  }

  console.log(`Will generate sentences for ${toProcess.length} words`)
  if (levelArg) console.log(`  Level filter: ${levelArg}`)

  const state = await submitBatch(toProcess)

  // Immediately start polling
  console.log('Waiting for batch to complete…')
  let done = false
  while (!done) {
    await new Promise(r => setTimeout(r, 10_000))  // poll every 10s
    done = await pollBatch(state.batchId)
  }

  await mergeBatch(state, allRaw, existing)
  fs.unlinkSync(STATE_PATH)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
