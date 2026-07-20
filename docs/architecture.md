# Architecture

## Shape

A static, local-first web app. No server, no build-time framework; ES modules
in the browser, plain `node:test` in CI.

```text
index.html          markup + inline handlers (thin; calls window-exposed API)
styles.css          design system ("paper & snap cubes")
js/
  activities.mjs    DATA   activity catalog, milestones, windows (no logic)
  engine.mjs        DOMAIN pure rules: replay, levels, modes, scoring, stats
  time.mjs          DOMAIN local-calendar time (localDateKey et al.)
  storage.mjs       PERSISTENCE contracts, validation, migration, import/export
  demo.mjs          DATA   seeded synthetic-data generator
  app.mjs           UI     i18n, rendering, wiring; the only file touching DOM
sw.js               offline shell cache (versioned)
build.mjs           allowlist copy → dist/ + single-file bundle → dist/standalone/
scripts/            lint (zero-dep), demo artifact generator
tests/              node:test suites incl. privacy guard and build checks
```

## Dependency rules (enforced by lint + privacy tests)

- `engine.mjs` imports only `activities.mjs`. No DOM, no storage, **no wall
  clock, no ambient randomness** — clock and RNG are injected.
- `storage.mjs` knows nothing about the engine; the replay function is injected
  into `importBackup`.
- `app.mjs` is the only module allowed to say `document`, `localStorage`
  (via the injected repo) or `new Date()`.
- Domain modules must never import `app.mjs`.

## State model

```text
logs (source of truth, append/edit/delete)
  └─ replayState(logs)            → historical state   (clock-free, deterministic)
       └─ evaluateTemporalRules(state, now) → effective state (cooldown expiry)
```

Editing or deleting any past session triggers a full replay, so derived state
can never drift from the log. "Today", streaks and the daily-plan seed use
**local calendar dates** from `time.mjs` (see [ADR-0002](adr/0002-clock-injection.md)).

## Persistence

`localStorage` behind `makeRepo(store)` — the store is injected, so every
persistence path runs in tests against an in-memory map. Backups carry a
`schemaVersion`; imports validate first, snapshot the current data, and roll
back on failure. Migration policy: **verbatim copy or nothing** (docs/decisions.md §5).

## Deployment

`build.mjs` copies an explicit allowlist into `dist/` (modular site) and emits
`dist/standalone/index.html` (single file, for one-file hosts). CI runs lint →
tests → build → artifact checks and uploads `dist/`; the Pages workflow deploys
only that artifact and only when CI succeeded.
