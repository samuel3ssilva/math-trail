# Changelog

## v1.0.0 — 2026-07-21

Public portfolio release. The product is complete and fully localized; the
engine stays a documented rule-based system (no ML).

### Product
- Full **PT-BR / EN localization of the entire 28-activity catalog** — names,
  materials, level descriptions, layouts, parent scripts, story scripts and
  skill labels — with completeness tests. The English catalog stays complete.
- Parent-facing UX (calm cool-paper visual language, summary cards, segmented
  tabs, three equal daily windows); the child never uses the screen.

### Returning-visitor correctness
- Service-worker cache bumped (`math-trail-v5`) so returning users get the new
  shell without any manual cache clearing.
- Scoped, versioned migration of stale synthetic demo state (`demoDataVersion`):
  a returning `?demo=1` visitor now sees the product name, and **no real data is
  touched**.

### Privacy & docs
- Neutralized a personal-name echo in a catalog diagram.
- Rewritten portfolio README (EN + PT), a final [case study](docs/case-study.md),
  an [AI-assisted-engineering](docs/ai-assisted-engineering.md) doc, a
  [portfolio guide](docs/portfolio-guide.md), an architecture diagram, and a
  [demo script](docs/demo-script.md).
- **153 tests, 0 skipped**; zero external requests; deploy gated on `main`.

## [2.1.0] — 2026-07-20

Senior review pass: privacy, determinism, data integrity, honest statistics.

### Privacy (P0)
- Removed every personal identifier from tracked files: legacy storage-key
  names, a real birth-month fallback, household-materials/calibration comments,
  a design-system header. Migration now happens via export/import only.
- Synthetic-data boundary: fixtures under `tests/fixtures/synthetic/` and a
  seeded, reproducible `demo/generated/` artifact (`npm run demo`), all marked
  `_synthetic`. Private folders blocked by `.gitignore`.
- New automated privacy guard fails CI on personal patterns, tracked private
  paths, unmarked data files, engine impurity and UTC date keys.
- Git-history cleanup runbook: `docs/adr/0004-git-history-cleanup.md`.

### Engine determinism (P0)
- Clock injection: `replayState` is now clock-free; temporal rules moved to
  `evaluateTemporalRules(state, now)`. Cooldowns anchor to the log's own
  timestamp. Purity enforced by tests. (`docs/adr/0002`)

### Local-calendar dates (P0)
- New `js/time.mjs` (`localDateKey`) replaces every UTC `toISOString().slice(0,10)`.
  "Today", streaks, history grouping and the daily-plan seed now follow the
  device's local calendar — verified for America/Sao_Paulo boundaries
  (20:59/21:00/23:59/00:00) with TZ-pinned subprocess tests.

### Data integrity (P0)
- New `js/storage.mjs`: schema version, log/backup validation, versioned
  migration (verbatim-or-nothing), automatic pre-import snapshot with rollback,
  rejection of corrupted JSON and unknown future versions. The regression suite
  runs the real import/migration functions against an in-memory store.

### CI/CD (P0)
- CI: lint → tests → build → artifact smoke tests → PWA checks → personal-data
  scan of the artifact. Pages deploys **only `dist/`** and only after CI passes.
- Build now copies an explicit allowlist; single-file bundle moved to
  `dist/standalone/`. Service-worker cache versioned per release.

### Rules (P1)
- Two-Dice Count-On unlock now matches its documentation: level 3 + two
  consecutive valid "too easy" (= Dice Flash mastery). (`docs/adr/0001`)
- Reward alert rewritten as a humble "reward observation": minimum 5 sessions
  per group, sample sizes always displayed, uncertainty language, explicit
  non-diagnosis disclaimer, self-suppression on insufficient data.

### UX
- Plan copy: the three windows are explicit opportunities, not obligations.
- New penalty-free "Not a good moment today" entry; rest days preserve streak
  continuity and are shown gently in the week strip.

### Docs
- Added `docs/architecture.md`, `docs/privacy.md`, `docs/threat-model.md`,
  `docs/data-inventory.md`, `docs/model-card.md`, four ADRs, `SECURITY.md`,
  `CONTRIBUTING.md`, this changelog.

## [2.0.0] — 2026-07-19

Initial public release: v2 redesign, modular codebase, adaptive engine with
automated test suite, PWA, GitHub Pages + CI workflows, bilingual PT-BR/EN interface.
