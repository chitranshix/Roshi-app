# Roshi's Word Game

A social vocabulary game. Dare your friends with words you know — they have to pick the right sentence and define the word. Points for getting it right.

---

## What it is

You pick a word and dare a friend. They see 4 sentences — only one uses the word correctly. Get the sentence right and you get to define the word in your own words. Claude grades the definition.

Miss the sentence and you see the meaning, no points. Miss the definition and you get partial credit.

There's also a daily word everyone plays, a leaderboard, and a trap mechanic — set a word for someone without them knowing, triggered when they play a level.

---

## Screens

> Add screenshots here — home feed, daily challenge, dare flow, result screen, profile.

| Home | Daily Challenge | Dare Flow |
|------|----------------|-----------|
| _screenshot_ | _screenshot_ | _screenshot_ |

| Result | Profile |
|--------|---------|
| _screenshot_ | _screenshot_ |

---

## Tech stack

| Layer | What |
|-------|------|
| Framework | Next.js 16, App Router, TypeScript |
| Styling | CSS Modules, CSS custom properties — no Tailwind |
| Database | Supabase (Postgres + Row Level Security) |
| Auth | Supabase Auth — email + password |
| AI | Anthropic API — Haiku grades definitions, Sonnet writes word commentary |
| Push | Web Push API + service worker — no third-party service |
| Hosting | Vercel — auto-deploys from `main` |

---

## Running locally

```bash
npm install
npm run dev
```

`.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
ANTHROPIC_API_KEY=...
```

---

## Scoring

| Outcome | Points |
|---------|--------|
| Wrong sentence | 0 |
| Right sentence + good definition | 5 |
| Right sentence + partial definition | 3 |
| Right sentence + wrong definition | 0 |
| Trap: escape with perfect score | +10 bonus |
| Trap: triggered | −10 |

---

## Design

Two themes — **Play on land** (parchment, light) and **Play in water** (midnight blue, dark). Toggle always visible in the header.

Mascot is Roshi — an aquatic turtle who chews a leaf and rolls his eyes at you.
