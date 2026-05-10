/**
 * Generates sentence sets + definitions for GRE words missing from our data.
 * Run: node scripts/generate-missing-words.mjs
 * Requires: ANTHROPIC_API_KEY in .env.local
 */

import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')

// Load env
const envFile = fs.readFileSync(path.join(ROOT, '.env.local'), 'utf-8')
for (const line of envFile.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && v.length) process.env[k.trim()] = v.join('=').trim()
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const MISSING = ["abandon","abide","abound","abreast","absolute","absurd","abyss","academic","accentuate","accessory","accomplice","acerbic","acknowledge","acolyte","acquisitive","activism","acute","adapt","addiction","address","adore","adulate","advocate","aerie","aesthete","affectation","affected","affluent","agenda","alias","allegation","allegiance","allusive","ambiguity","ambivalent","ambush","amnesia","amuse","anomaly","antagonistic","antagonize","antecedent","antedate","antidote","aphoristic","apprehension","appropriate","arresting","artifact","assertive","asteroid","astonish","astound","attainment","august","austerity","avenge","banish","banter","bearing","befriend","behoove","bemuse","betray","bias","bifurcate","bizarre","blasphemous","blithe","blunt","bogus","brash","buoyancy","calamitous","canonize","cant","cardinal","castigate","catastrophe","celestial","check","cherish","circumstantial","clearheaded","clerical","cloak","clumsy","coerce","coherent","compel","complacent","conditional","conflate","conspicuous","contemporary","contemptuous","contentment","cope","counterfeit","counterintuitive","counterproductive","covet","cow","crafty","credulous","cunning","cynical","deceit","deceptive","defamatory","default","deferential","defy","diffident","disaffection","discern","discount","disentangle","disintegrate","dislocation","disquiet","dissimilar","divergent","doleful","dynamism","eclipse","ecstatic","efficacious","egalitarian","egotist","elate","elevate","eloquent","enchant","encomium","endanger","enfeeble","engage","enigmatic","entreaty","entrench","erstwhile","estrange","euphoric","exigent","exotic","exploit","exposition","extravagance","exuberant","factual","fallacy","fanatical","fawn","feckless","fecund","feeble","fetid","fixate","flag","fledgling","fleeting","foreground","forgo","frenetic","frenzy","gawky","gestation","global","gloom","gracious","harbor","harmonious","heed","heretical","hidebound","homogeneity","husband","hypocrite","iconoclast","illiberal","imitate","imminent","immunity","improvisation","impulsive","incensed","incongruous","inconsiderable","indebted","indecorous","indignant","indiscernible","informed","ingenious","iniquity","injudicious","insular","intelligible","interchangeable","interweave","intransigent","inure","invaluable","invigorate","involved","ironic","jingoism","juxtaposition","keen","lapidary","laudable","lethargy","lissome","lure","machination","malinger","manifest","manipulate","marginalize","martial","mask","menace","mimic","multifaceted","naive","narcissism","nonchalant","normative","objurgate","obligate","ominous","opportunism","optimistic","opulent","ostentation","overshadow","overstate","panoply","partial","pate","patent","pathology","peculiarity","permeate","perseverance","perspicacity","pervade","philanthropy","posit","pragmatism","precedence","predominant","prescient","profound","prolix","provoke","prudence","pugnacious","qualified","quirky","rarefy","redemption","resolute","resolution","resolve","resurgent","reverence","ridicule","ruinous","sage","scintillating","scornful","sinister","slighted","sobriquet","spectrum","stasis","stigmatize","striate","subpoena","subtle","sully","tactless","tranquil","transcend","trivial","unprecedented","unpretentious","unsound","vestigial","vigilance","virulence","vituperate","wan"]

const OUTPUT_FILE = path.join(ROOT, 'scripts/generated-words.json')

// Load already generated (resume support)
let generated = {}
if (fs.existsSync(OUTPUT_FILE)) {
  generated = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'))
  console.log(`Resuming — ${Object.keys(generated).length} already done`)
}

const remaining = MISSING.filter(w => !generated[w])
console.log(`Generating ${remaining.length} words...`)

// Process in batches of 5 words per API call
const BATCH = 5

async function generateBatch(words) {
  const prompt = `You are generating GRE vocabulary data. For each word below, provide:
1. A concise definition (1 sentence, dictionary style)
2. One sentence that uses the word CORRECTLY in context
3. Three sentences that use the word INCORRECTLY (wrong meaning, misused)

Respond with valid JSON only — an array of objects:
[
  {
    "word": "...",
    "definition": "...",
    "correct": "...",
    "wrong1": "...",
    "wrong2": "...",
    "wrong3": "..."
  }
]

Words: ${words.join(', ')}`

  const msg = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = msg.content.find(b => b.type === 'text')?.text ?? ''
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  if (!jsonMatch) throw new Error(`No JSON in response for: ${words.join(', ')}`)
  return JSON.parse(jsonMatch[0])
}

let done = 0
for (let i = 0; i < remaining.length; i += BATCH) {
  const batch = remaining.slice(i, i + BATCH)
  try {
    const results = await generateBatch(batch)
    for (const r of results) {
      generated[r.word] = {
        word: r.word,
        definition: r.definition,
        sentences: [
          { sentence: r.correct, correct: true },
          { sentence: r.wrong1,  correct: false },
          { sentence: r.wrong2,  correct: false },
          { sentence: r.wrong3,  correct: false },
        ]
      }
    }
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(generated, null, 2))
    done += batch.length
    process.stdout.write(`\r${done}/${remaining.length} done (${batch.join(', ')})       `)
  } catch (err) {
    console.error(`\nFailed batch ${batch.join(', ')}: ${err.message}`)
    // retry individually
    for (const word of batch) {
      try {
        const results = await generateBatch([word])
        const r = results[0]
        generated[word] = {
          word: r.word,
          definition: r.definition,
          sentences: [
            { sentence: r.correct, correct: true },
            { sentence: r.wrong1,  correct: false },
            { sentence: r.wrong2,  correct: false },
            { sentence: r.wrong3,  correct: false },
          ]
        }
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(generated, null, 2))
        done++
      } catch (e2) {
        console.error(`\nSkipping ${word}: ${e2.message}`)
      }
    }
  }
  // Small delay to avoid rate limits
  await new Promise(r => setTimeout(r, 300))
}

console.log(`\nDone! ${Object.keys(generated).length} words saved to scripts/generated-words.json`)
