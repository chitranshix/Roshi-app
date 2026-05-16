# Roshi — Zero to One Strategy
_Last updated: May 2026 | Status: Active pivot_

---

## The Pivot

Roshi started as a social word-dare game. That was fun to build but the ICP was fuzzy — "people who want to learn words with friends" is too wide and too passive. We're pivoting to GRE/GMAT exam prep.

**Why this ICP works:**
- Hard deadline (test date) = built-in urgency
- Real anxiety = high willingness to pay
- Measurable outcome (score) = clear success signal
- Underserved by engaging UX — most GRE tools are boring by design

---

## Problem

GRE/GMAT vocabulary prep is broken. Existing tools (Magoosh, Quizlet, Anki, Manhattan Prep flashcards) give you lists to memorise. Passive exposure doesn't build retention. You need to *use* a word to own it. And when you get a word wrong, no tool tells you *why* — which distractor tripped you up, which logic was flawed.

---

## Mission

Help high-stakes students not just learn GRE words but truly own them — so they never blank on test day.

---

## Who It's For

GRE/GMAT students in India (initial market), 22–30, 3–18 months from their test date. College seniors applying abroad, working professionals eyeing an MBA, self-studiers who've tried Quizlet and bounced. They're anxious, motivated, and willing to pay for something that actually works.

---

## Positioning

**What we are:** The most effective GRE vocabulary tool — built for retention, not recognition.

**What we are not:** A flashcard app. A word list. A dictionary. A social game.

**Differentiators:**
1. **Mistake Audit** — show the exact wrong distractor the user chose, explain why it was wrong. Nobody else does this.
2. **Exam-Date Integration** — daily mastery targets auto-calibrated to how far the test is. Creates urgency and structure.
3. **Card physics UI** — swipe/flick mechanics with tactile feedback. Feels like productive ASMR, not studying.

---

## The Product

### Core interaction loop (v2)
A 3-face card mechanic:
1. **Front face** — word (e.g. "MELLIFLUOUS")
2. **Back face** — 4-option MCQ: pick the sentence that uses it correctly
3. **Bottom face** — type your definition in your own words; AI grades it

Swipe right = Mastered pile. Swipe left = Retry pile.

Retry pile resurfaces after N new cards (spaced repetition). Mastered pile stays mastered unless re-tested on a future session.

### Feature priority order
1. Card physics UI (swipe/flick with spring physics)
2. Mistake Audit (show wrong distractor + correct answer side-by-side after MCQ)
3. Exam-Date Integration (test date input → daily word targets → Confidence Tracker)
4. Retry pile spaced repetition loop
5. Progress dashboard (mastered count, weak areas, streak)

### What stays from v1
- 1,398 curated GRE/GMAT words, 9 missions sorted by difficulty
- Supabase-backed progress (word-level, cross-device)
- Daily word challenge
- Claude Haiku definition grader

### What gets retired
- Dare mechanic (send word to friend)
- Roshi mascot (see below)
- Social feed on home page

---

## Design Direction

| Token | Value |
|-------|-------|
| Background | `#0f1c14` (dark green) |
| Surface | `#1a2e1f` |
| Accent | warm gold `#c9a84c` |
| Heading font | Fraunces (serif, editorial) |
| UI font | DM Sans (stays) |
| Radius | tight — 8px max |
| Shadows | none on fills |

Aesthetic: editorial, premium, tool-like. Think NYT Spelling Bee meets Anki done right. Not a game, not a toy — a serious instrument that happens to feel good to use.

---

## Mascot Decision

**Roshi is retired from the GRE app.**

GRE/GMAT students need to feel like they're using a precision tool, not a toy. The cartoon turtle mascot undercuts the credibility that the editorial aesthetic is building. Duolingo earns its owl because they invented that positioning — we're entering a crowded, high-trust space where first impressions matter.

Roshi will live on in a separate future project (vocabulary tool for writers) where his playful personality is an asset, not a liability.

---

## Monetization

**Model:** Freemium + annual subscription

| Tier | Access | Price |
|------|--------|-------|
| Free | First 3 missions (~465 words) | ₹0 |
| Pro | All 9 missions + Mistake Audit + Exam-Date | ₹1,500–3,000/year |

**Why 3 missions free (not 500 words):** Mission framing creates progress momentum and makes the paywall feel natural ("you've completed the foundation, unlock the rest"). Word count is arbitrary and doesn't motivate.

**Target:** 70 paying users/month → ~₹1L/month revenue.

---

## Build Plan

### Phase 0 — Architecture decision (done)
- Branch off main (not a new project — infrastructure is already running)
- Branch name: `feat/card-ui` or `redesign`

### Phase 1 — Card UI skeleton
- New `/learn` route (or replace `/play`) with 3-face card
- Swipe gesture detection + spring physics (react-spring or framer-motion)
- Retry / Mastered piles as visual stacks at bottom

### Phase 2 — Mistake Audit
- After MCQ, reveal which option user picked + correct answer
- Brief explanation of why each distractor is wrong (one line, generated or hardcoded)

### Phase 3 — Exam-Date Integration
- Onboarding step: "When is your test?" (date picker)
- Daily targets: (total words remaining) ÷ (days to test) = words/day
- Confidence Tracker: streak + daily completion vs target

### Phase 4 — Monetization gate
- Gate missions 4–9 behind Pro
- Paywall card UI with upgrade prompt
- Razorpay or Stripe (India-first)

---

## Open Questions

- [ ] Does card UI live at `/learn` (new route) or replace `/play`?
- [ ] Spaced repetition interval for Retry pile — fixed (every 5 cards) or adaptive?
- [ ] Does Mistake Audit require pre-generated wrong-answer explanations or can Claude generate them on the fly?
- [ ] Onboarding flow — does the test-date screen replace the current Roshi onboarding entirely?

---

## What We're Not Solving (Yet)

- GMAT Verbal / RC sections (focus is vocabulary first)
- Language learning (non-English)
- Classroom / institutional use
- Social / multiplayer mechanics (may revisit post-PMF)
