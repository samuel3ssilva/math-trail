# Design & engineering decisions

Short record of the trade-offs behind Math Trail. Format: decision → why → what it costs.

## 1. Vanilla JS, no framework, no dependencies

**Why:** the app is one screen with four tabs, maintained by one person in spare time. A framework buys componentization and pays with build tooling, upgrade churn and a heavier mental stack. `npm install` producing an empty `node_modules` is a feature.
**Cost:** manual DOM updates; discipline required to keep rendering functions small.

## 2. localStorage as the only database

**Why:** the data is one family's practice log — a few KB per year. It belongs to the device, works offline, needs no accounts, no backend, no privacy surface. JSON export/import covers backup and device moves.
**Cost:** no multi-device sync. Accepted: the parent who logs is the parent who plans.

## 3. Pure adaptive engine, separated from the UI

**Why:** every rule that changes state (levels, story mode, cooldowns, unlocks) is a pure function of `(state, log, history)`. That makes the engine testable in plain `node --test` with zero mocks, and makes **deterministic replay** possible: edit or delete any past session and the app recomputes state from scratch, so state can never drift from the log.
**Cost:** the UI layer passes context explicitly (state, logs, profile) instead of reaching for globals.

## 4. Date-seeded suggestions

**Why:** suggestion engines that reshuffle on every reload feel arbitrary and train the user to reroll until they like the answer. Seeding the daily pick with `hash(date + window)` makes the plan stable all day — deliberate, like a lesson plan — while "Swap" still offers controlled variety.
**Cost:** none meaningful; swaps re-randomize by design.

## 5. Storage-key migration is verbatim or nothing

**Why:** v1 used different localStorage keys. Migration copies the old values byte-for-byte to the new keys and never deletes the originals. No field mapping, no format "upgrades" on the way in — every transformation is a chance to silently corrupt a family's history (see [case-study.md](case-study.md) for the incident that proved it).
**Cost:** legacy keys linger in storage. Cheap insurance.

## 6. Single-file build target

**Why:** some static hosts (and email attachments, and USB sticks) want exactly one file. `build.mjs` inlines CSS and the three modules into `dist/index.html` with a parse check. The modular tree stays the source of truth for development and tests.
**Cost:** the inliner relies on a fixed import discipline between the three modules — acceptable at this scale, revisit if the module graph grows.

## 7. The child never uses the app

**Why:** a pedagogy decision that became a product decision. Screen-time for a two-year-old is the thing this replaces. Everything in the UI addresses the adult: parent scripts, "no bad results" logging language, mood tracked as observation, treats tracked so the app can nudge toward connection-as-reward.
**Cost:** none. This is the point.
