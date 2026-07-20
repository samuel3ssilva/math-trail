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

- **Zero dependencies, no framework.** A deliberate choice: the app must outlive framework churn, deploy as static files anywhere, and stay maintainable by one person. See [docs/decisions.md](docs/decisions.md).
- **Pure engine, testable by design.** State transitions never touch the DOM or storage — 18 tests run in plain `node --test` ([tests/engine.test.mjs](tests/engine.test.mjs)).
- **Data safety as a feature.** All data lives in localStorage with JSON export/import. A regression test loads a real v1 backup and asserts zero field loss — a guard born from a real incident, told in [docs/case-study.md](docs/case-study.md).
- **Offline-first PWA.** Service worker caches the shell; installs to the home screen.
- **i18n** — full PT-BR / EN interface.
- **Single-file build.** `npm run build` inlines everything into `dist/index.html` for one-file static hosts.

## Run it

```bash
npm run serve   # http://localhost:8123  (or just open index.html)
npm test        # engine test suite
npm run build   # single-file bundle in dist/
```

No install step — there is nothing to install.

## Screens

The demo link above is the best screenshot: open it on a phone. Highlights: time-of-day tinted routine cards, chalkboard setup diagrams, snap-cube progress cells, and a dino walking the skill trail.

## License

[MIT](LICENSE) — built by [Samuel dos Santos Silva](https://github.com/samuel3ssilva) with AI as a pair-engineer, human judgment as the safety net.
