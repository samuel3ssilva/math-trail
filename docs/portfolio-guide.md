# Portfolio guide

A short index for reviewers. Math Trail is an offline-first web app that helps a
**parent** plan and record short off-screen math moments with a toddler — the
child never uses the screen.

## Look at these first, in order

1. **Live demo (synthetic data):**
   <https://samuel3ssilva.github.io/math-trail/?demo=1> — open it on a phone.
2. **[README](../README.md)** — what it is and how to run it (no install step).
3. **[Case study](case-study.md)** — context, architecture, the nine real
   incidents and their fixes, limitations.
4. **[AI-assisted engineering](ai-assisted-engineering.md)** — how AI was used in
   separate roles under human governance.
5. **[Model card](model-card.md)** — the adaptive engine, documented honestly as
   **rule-based, not machine learning**.
6. **[Threat model](threat-model.md)** — the privacy and data-safety risks and
   their mitigations.

## Technical highlights

- **Deterministic, explainable engine** — pure rules with injected clock and RNG;
  `replayState(logs)` is clock-free ([`js/engine.mjs`](../js/engine.mjs),
  [ADR-0002](adr/0002-clock-injection.md)).
- **Data-safety regression suite** — verbatim-or-nothing migration and
  validated import with snapshot/rollback, guarded by tests
  ([`js/storage.mjs`](../js/storage.mjs),
  [`tests/storage.test.mjs`](../tests/storage.test.mjs)).
- **Automated child-privacy guard** — fails CI if personal identifiers reach
  tracked files or the deploy artifact
  ([`tests/privacy.test.mjs`](../tests/privacy.test.mjs),
  [privacy.md](privacy.md)).
- **Zero dependencies** — no runtime and no build dependencies; even lint is
  dependency-free ([ADR-0003](adr/0003-no-tooling-deps.md)).

## What this project demonstrates

- **Child-privacy engineering** — local-only data, no analytics, no third-party
  requests, synthetic-only repository, cleaned Git history.
- **Data integrity** — migration and import designed so a family's history can
  never be silently lost or falsified, proven by regression tests.
- **Dependency-free engineering** — a maintainable static PWA built to outlive
  framework churn.
- **Human governance of AI** — AI used in bounded roles; CI, branch protection
  and tests as the real gates; no autonomous merge.

Verified state (2026-07): 153 automated tests, 0 skipped; zero external requests
at runtime; deploys only the built `dist/` artifact from a protected `main`.
