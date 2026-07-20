# Math Trail 🦕

**A calm, adaptive early-math practice planner for parents of toddlers.**
Vanilla JS, zero dependencies, offline-first — one small app that plans, guides and tracks five-minute math moments at home.

[![CI](https://github.com/samuel3ssilva/math-trail/actions/workflows/ci.yml/badge.svg)](https://github.com/samuel3ssilva/math-trail/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**[▶ Live demo](https://samuel3ssilva.github.io/math-trail/?demo=1)** (with three weeks of sample data) · **[Empty app](https://samuel3ssilva.github.io/math-trail/)** · [Leia em português](README.pt-BR.md)

---

## Why this exists

Most "educational apps" put a screen in front of the child. Math Trail does the opposite: **the child never touches it**. It is a tool for the parent, built around the pedagogy of Kate Snow's *Preschool Math at Home* and a box of real materials — snap cubes, toy dinosaurs, dice, paper and pen.

The app answers three questions a busy parent has:

1. **What should we play right now?** Three daily windows (morning / afternoon / bedtime) each come with a pre-selected activity chosen by an adaptive engine — with a parent script, a "chalkboard" table-setup diagram, and a why-this-pick explanation.
2. **How is it going?** One-tap logging: completion, mood, cognitive ease, what sustained the activity, optional note. A built-in timer captures duration.
3. **Is it working?** A skill trail (counting 1–5 → subitizing → one more/one less → … → number stories), progress shown as snap-cube cells, mood over time, and adaptive-state cards in plain language.

## The adaptive engine

The interesting part lives in [`js/engine.mjs`](js/engine.mjs) — pure functions, fully tested:

| Rule | Behavior |
|---|---|
| **Level auto-adjust** | Two consecutive "too easy" sessions → level up (1→3). One "too hard" → level down. |
| **Mastery** | "Too easy" twice at level 3 → activity marked mastered, weight reduced in suggestions. |
| **Story mode** | 2 resisted sessions within the last 3 → scripts switch to adventure framing ("the dino crew is hiding!") for 3 sessions. |
| **Cooldown** | "Too hard" at the floor level on composition activities → the whole skill rests for 48h. |
| **Unlock gate** | Two-Dice Count-On only enters the pool after Dice Flash is mastered. |
| **Treat alert** | If treats correlate with ≥30% more resistance than intrinsic play, the app suggests connection-as-reward instead. |
| **Deterministic replay** | Editing or deleting a past session replays the whole history — state is always a pure function of the log. |
| **Stable daily plan** | Suggestions are seeded by date, so the plan doesn't reshuffle on every reload. |

## Engineering notes

- **Child privacy first.** No accounts, no server, no analytics, no third-party calls; all data stays in the device's localStorage. The public repo contains only synthetic data, and an automated privacy guard fails CI if personal identifiers ever appear in tracked files or the deploy artifact. See [docs/privacy.md](docs/privacy.md), [docs/threat-model.md](docs/threat-model.md) and [docs/data-inventory.md](docs/data-inventory.md).
- **Zero dependencies, no framework.** A deliberate choice: the app must outlive framework churn, deploy as static files anywhere, and stay maintainable by one person. Even lint is dependency-free ([ADR-0003](docs/adr/0003-no-tooling-deps.md)).
- **Deterministic, explainable engine.** Pure rules with injected clock and RNG: `replay(logs)` is clock-free and temporal rules are evaluated at read time ([ADR-0002](docs/adr/0002-clock-injection.md)). Honestly documented as a rule-based system — not ML — in [docs/model-card.md](docs/model-card.md).
- **Local-calendar correctness.** "Today", streaks and the daily plan follow the device timezone, with America/Sao_Paulo boundary tests (a 21:00 UTC-flip bug class caught for good).
- **Data safety as a feature.** Schema-versioned backups, validated imports with automatic snapshot + rollback, verbatim-or-nothing migration, and a regression suite that runs the real migration functions — a guard born from a real incident, told in [docs/case-study.md](docs/case-study.md).
- **Offline-first PWA.** Versioned service-worker shell; installs to the home screen.
- **i18n** — full PT-BR / EN interface.
- **Gated deploys.** CI runs lint → 60+ tests → build → artifact checks; GitHub Pages publishes only the built `dist/` artifact, never the repo root.

## Run it

```bash
npm run serve   # http://localhost:8123  (or just open index.html)
npm test        # full suite: engine, timezone, storage/migration, privacy guard, demo, build
npm run lint    # zero-dependency lint + format gate
npm run build   # deployable dist/ + single-file bundle in dist/standalone/
```

No install step — there is nothing to install.

## Screens

The demo link above is the best screenshot: open it on a phone. Highlights: time-of-day tinted routine cards, chalkboard setup diagrams, snap-cube progress cells, and a dino walking the skill trail.

## License

[MIT](LICENSE) — built by [Samuel dos Santos Silva](https://github.com/samuel3ssilva) with AI as a pair-engineer, human judgment as the safety net.
