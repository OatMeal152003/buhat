# BUHAT — TRAIN HARD. MOVE FORWARD.

A premium interactive fitness platform: a cinematic marketing landing page connected to a
complete workout application — searchable workout and exercise libraries, an active-workout
mode with real timestamp-based timers, a weekly planner, and progress analytics derived only
from data you actually record.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build -> dist/
npm run preview  # serve the production build
npm run typecheck
```

## What's inside

- **Landing** (`/`) — hero, feature area with athlete photography, workout showcase,
  four-step "how it works", motivation wall, final CTA. All motion built with anime.js v4.
- **Dashboard** (`/app`) — this week at a glance, today's planned session, resume an active
  session, recent history, achievements.
- **Workouts** (`/app/workouts`) — 10-session library with live search, category and duration
  filters; detail page with per-exercise instructions, setup, and common mistakes.
- **Exercises** (`/app/exercises`) — 16-exercise directory with muscle, equipment, and type
  filters plus a text search across names and cues; detail page with coaching notes.
- **Active workout** (`/app/session`) — the previous session persists across refresh (the
  start timestamp is stored, so elapsed time stays accurate even with the tab in the
  background). Complete sets and notes, run the rest timer (with skip/pause), finish with a
  completion summary. Completed sessions become recorded history.
- **Planner** (`/app/planner`) — assign library workouts or custom entries to any day,
  duplicate a template, edit days inline, reset the week. Seeded with a starter template
  (clearly labeled) — nothing else is fabricated.
- **Progress** (`/app/progress`) — weekly volume chart, top-set strength trend for chosen
  lifts, personal records, streaks. All computed from recorded sessions; estimates are
  labeled EST.
- **Achievements** (`/app/achievements`) — unlocked only through verified session events.
- **Settings** (`/app/settings`) — profile (units kg/lb, body weight used for calorie
  estimates), training preferences (rest durations, weekly goal), motion (reduced-motion
  preference), and data (export / clear, with confirmation).

## Architecture notes

- **Stack**: Vite 6 + React 19 + TypeScript + Tailwind CSS v4 (`@theme` design tokens in
  `src/styles/index.css`) + anime.js v4 + react-router-dom 7. No UI kit, no chart library.
- **Animation** (`src/lib/motion.ts`, `src/hooks/useReveal.ts`): every helper no-ops when
  motion is disabled (user preference, OS reduced-motion, or a failed gate). Timeline-driven
  elements are pre-hidden by CSS under `[data-motion='on']` only, so there is no flash and
  no invisible content when JS motion is off. All cleanups revert their anime instances
  (Strict-Mode safe). Charts are plain SVG animated with anime.js.
- **State** (`src/store/AppStore.tsx`): one reducer-driven context for sessions, plans,
  history, achievements, and settings.
- **Persistence** (`src/lib/storage.ts`): a single localStorage key (`buhat:data:v1`)
  with sanitized, version-tolerant reads. The active session stores timestamps, not
  tick-counts, so timers survive tab throttling and refresh.
- **Sound** (`src/lib/sound.ts`): Web Audio cues for rest-finished and workout-complete —
  no audio assets, no errors if the AudioContext is unavailable.

## Data honesty

- Completed sets, reps, and weights are recorded verbatim; progress charts never invent
  numbers. The first-run state contains a starter plan and nothing else.
- Calorie figures are labeled **EST** (a simple MET-style estimate scaled by body weight).
- The planner ships one template labeled "Starter"; templates you save yourself are yours.

## Environment quirks

- On this machine npm must be invoked as `npm.cmd` (PowerShell execution policy blocks
  `npm.ps1`). If `esbuild`'s postinstall was skipped by an allow-scripts policy, run
  `npm approve-scripts esbuild` once; the binary is verified working regardless.
- Photography loads from Unsplash; offline or blocked requests degrade to the generated
  lime-duotone fallback frame (no broken images).
