# Contributing

Thanks for the interest! Ground rules — the first two are non-negotiable.

## 1. Child privacy is the product

- Never commit real data: no real names, birth dates, session logs, notes or
  backups. Committed data files must be synthetic and carry `"_synthetic": true`.
- `npm test` runs a privacy guard that fails on personal patterns — do not
  weaken it to make a PR pass; fix the data instead.
- Any change that adds a network call, analytics, or a third-party service
  requires a privacy review and an update to `docs/privacy.md` — the default
  answer is no.

## 2. The child never uses the app

Features must serve the **parent** planning off-screen play. No screens for
the child, no gamification aimed at the child, no streak pressure, no red
"failure" states. Read `docs/model-card.md` before touching engine rules.

## Architecture rules (enforced by lint/tests)

- `js/engine.mjs` stays pure: no DOM, no storage, no wall clock, no ambient
  randomness. Inject `now` and RNGs.
- "Today" always comes from `js/time.mjs` (`localDateKey`) — never UTC slices.
- Persistence goes through `js/storage.mjs` with an injected store.
- Zero new dependencies without an ADR (see `docs/adr/0003`).

## Workflow

```bash
npm run lint   # zero-dep lint + format gate
npm test       # full suite (engine, timezone, storage, privacy, demo, build)
npm run build  # deployable artifact in dist/
```

Small, thematic commits (`privacy:`, `refactor:`, `fix:`, `test:`, `ci:`,
`docs:`). New rules need tests; behavior changes need an ADR when they alter
a documented contract.
