# Case study — Math Trail

Math Trail is a small, offline-first web app that helps a **parent** plan, run
and record short off-screen math moments with a toddler (~2.5 years old). The
child never touches the screen; the tool is entirely for the adult. This case
study records the problem, the design and engineering decisions, the real
incidents that shaped the code, and the limits of what the project claims.

Everything below is drawn from the repository itself: source, tests, ADRs and
the other documents in [`docs/`](.). Where something is a limitation, it is
stated as one.

---

## 1. Context

The starting problem is ordinary: a parent wants to do a few minutes of hands-on
math with a very young child, using real materials — snap cubes, dice, toy
dinosaurs, paper — and wants a little help deciding *what* to do and keeping a
light record of how it went. Most "educational apps" answer this by putting a
screen in front of the child. This project takes the opposite constraint.

Design constraints that follow from a ~2.5-year-old and an off-screen practice:

- **The child never uses the app.** Every screen addresses the adult. This is a
  product decision recorded in [decisions.md §7](decisions.md).
- **Sessions are short** (roughly 2–8 minutes) and happen in ordinary daily
  windows (morning / afternoon / bedtime).
- **The record must be low-effort** — a busy parent will not maintain a
  demanding log.
- **The language must not judge the child.** There is no "bad result"; mood and
  difficulty are recorded as observations, not scores.

The scope is deliberately narrow: one family, one device, no accounts, no
network. That narrowness is what makes the privacy and data-safety properties
below achievable.

## 2. Discovery & MVP

The working hypothesis was that the useful unit is not a lesson but a **decision
plus a record**: help the parent pick the next activity, give them a short
script and a table-setup diagram, and let them log the outcome in a few taps.

The MVP settled on:

- A catalog of **28 activities**, each localized in PT-BR and EN, organized by
  skill and by daily window.
- A per-window suggestion with a plain-language reason for the pick.
- A short logging form: completion, mood, how hard it felt, what was used as a
  reward, optional duration and an optional note.
- A progress view over time (skill milestones, mood, current focus).

Scope was cut hard: no publishing, no sharing, no cloud, no multi-device sync,
no child-facing content. Those cuts are the reason the rest of the system stays
small enough for one person to maintain (see [decisions.md](decisions.md)).

## 3. Architecture

The app is static, local-first, and dependency-free. Details are in
[architecture.md](architecture.md); the shape that matters here:

- **Vanilla JavaScript, zero runtime dependencies and zero build
  dependencies.** No framework, no bundler in the critical path. Even the linter
  is written without dependencies ([ADR-0003](adr/0003-no-tooling-deps.md)). The
  goal is an app that outlives framework churn and can be maintained by one
  person; `npm install` produces an empty `node_modules`.
- **PWA, offline-first.** A versioned service-worker shell caches the app so it
  installs to the home screen and runs without a network.
- **Local-first storage.** All data lives in the device's `localStorage`, behind
  an injected `store` so every persistence path is testable against an in-memory
  map ([`js/storage.mjs`](../js/storage.mjs)).
- **A deterministic, explainable, rule-based engine.** The suggestion logic in
  [`js/engine.mjs`](../js/engine.mjs) is a set of pure rules. It is **not machine
  learning** — there is no trained model, no weights, no inference service. This
  is stated plainly in the [model card](model-card.md), which uses model-card
  structure only because the rules make automated suggestions that affect a
  family's routine.
- **Injected clock and RNG.** The engine takes no wall clock and no ambient
  randomness. `replayState(logs)` is a pure, clock-free fold over the log;
  time-dependent rules (such as cooldown expiry) are applied separately at read
  time via `evaluateTemporalRules(state, now)`
  ([ADR-0002](adr/0002-clock-injection.md)).
- **Deterministic replay.** Because state is a pure function of the log, editing
  or deleting any past session recomputes the whole history from scratch — state
  can never drift from the log.
- **Centralized local calendar.** "Today" and day-grouping use device-local
  calendar dates (America/Sao_Paulo during development) from a single
  `js/time.mjs` module, rather than UTC.

## 4. Incidents & lessons

These are real problems found during development. Each is now covered by a
regression test so it cannot return silently. Format: problem → impact →
diagnosis → fix → preventive test.

**1. Data-loss risk in a storage redesign.**
A candidate implementation of the storage redesign wrote to a new key while
claiming to reuse the old one, and persisted empty state on the first load. The
migration loop ran inside a single `try`, so the first non-JSON value aborted it
silently. Its field-mapping step re-stamped dates to "today" and filled defaults
— fabricating a false history.
*Impact:* a real family log could have been silently emptied or falsified on
upgrade. *Diagnosis:* an adversarial test seeded a real v1 fixture and counted
survivors — 0 of 5 fields survived the candidate, versus 5 of 5 for the accepted
approach. *Fix:* a "verbatim copy or nothing" migration policy —
[decisions.md §5](decisions.md). *Preventive test:*
[`tests/storage.test.mjs`](../tests/storage.test.mjs) imports
[`tests/fixtures/synthetic/v1-backup.synthetic.json`](../tests/fixtures/synthetic/v1-backup.synthetic.json)
and asserts zero field loss.

**2. Timezone (UTC) day-boundary bug.**
"Today" and per-day grouping were computed in UTC. In America/Sao_Paulo (UTC−3),
the day flipped at 21:00 local, so evening sessions landed on the next day.
*Impact:* sessions grouped under the wrong day; every calendar rule in the
engine read a day that never had a session. *Diagnosis:* reproduced at the
boundary. *Fix:* a centralized local calendar in
[`js/time.mjs`](../js/time.mjs) (`localDateKey`). *Preventive test:*
[`tests/time.test.mjs`](../tests/time.test.mjs) runs TZ-pinned subprocesses at
20:59, 21:00, 23:59 and 00:00.

**3. A finished session could be lost on reload.**
A session that had ended but was not yet saved could be lost if the PWA reloaded
or restarted.
*Impact:* a captured session silently disappears. *Diagnosis:* the ended session
lived only in volatile UI state. *Fix:* the capture is written to
`mathtrail_pending_session` before the active session is cleared, and consumed
only after a successful save or a confirmed discard
([`js/session.mjs`](../js/session.mjs)). *Preventive test:*
[`tests/pending-session.test.mjs`](../tests/pending-session.test.mjs).

**4. A saved log used the wrong timestamp.**
The log took its timestamp from the moment of saving. A session that ended at
23:50 and was saved at 00:10 was filed on the following day.
*Impact:* sessions recorded against a day they did not happen on. *Diagnosis:*
the timestamp source was "now" instead of "when it ended". *Fix:* the log uses
`pendingSession.endedAt` ([decisions.md §9](decisions.md)). *Preventive test:*
[`tests/session.test.mjs`](../tests/session.test.mjs).

**5. Incomplete rollback left state referencing a missing log.**
`appendLog` originally restored only the logs on failure. If removing the
pending session failed after the state write, the new state referenced a log
that was no longer present — silent drift.
*Impact:* an internally inconsistent store after a partial write. *Diagnosis:*
`localStorage` is not transactional, so a multi-key write can fail midway. *Fix:*
snapshot and restore logs, state and pending together, and report honestly when
the best-effort rollback itself fails
([`js/storage.mjs`](../js/storage.mjs) `appendLog`). *Preventive test:*
[`tests/pending-session.test.mjs`](../tests/pending-session.test.mjs).

**6. Persistent XSS via stored history.**
The history view interpolated untrusted log fields into HTML.
*Impact:* a crafted note or imported backup could inject markup/script.
*Diagnosis:* user-controlled strings reached `innerHTML`. *Fix:* the renderer
builds DOM with `createElement`/`textContent` and real event listeners, and the
import contract validates and normalizes to an allowlist (extra fields and
`__proto__` are dropped) — [`js/storage.mjs`](../js/storage.mjs),
[`js/session.mjs`](../js/session.mjs). *Preventive test:*
[`tests/xss.test.mjs`](../tests/xss.test.mjs); threat [T3](threat-model.md)
mitigated, and the rendered DOM was verified by hand in
[manual-verification.md](manual-verification.md).

**7. Personal data in Git history.**
Personal data had been present in the repository's history.
*Impact:* private information recoverable from old commits. *Diagnosis:* history
audit. *Fix:* history rewritten with `git-filter-repo` and the repo republished
([ADR-0004](adr/0004-git-history-cleanup.md)). *Preventive test:* an automated
privacy guard in CI ([`tests/privacy.test.mjs`](../tests/privacy.test.mjs))
fails on banned patterns in tracked files and in the deploy artifact.

**8. Race between the build and the privacy scan.**
A test ran the build (which deletes `dist/`) while the privacy scan walked
`dist/` in a parallel process. The suite could go green without ever having
scanned the artifact.
*Impact:* the privacy guard could pass without checking the thing it exists to
check. *Diagnosis:* an ordering race on a shared directory. *Fix:* `dist/` is
built once by `npm test` before the runner starts; the scan fails loudly if it
is absent, and a source-assertion test blocks reintroduction of the race.

**9. Stale service-worker cache.**
The cache-first service worker kept serving the previous version to returning
visitors because the cache name had not been bumped; separately, the demo's
`localStorage` held an old synthetic profile.
*Impact:* bug fixes never reached returning users, and the demo showed stale
synthetic data. *Diagnosis:* an unversioned cache name plus un-migrated demo
state. *Fix:* bump the cache version (`activate` deletes old caches, with
`skipWaiting` + `clients.claim`) and a scoped migration of the demo's synthetic
state (`demoDataVersion`) that never touches real data. *Preventive test:*
[`tests/demo-migration.test.mjs`](../tests/demo-migration.test.mjs).

## 5. Child privacy

The governing principle: **data about a child never leaves the device, and no
data about any real child exists in this repository.** See
[privacy.md](privacy.md) and [threat-model.md](threat-model.md).

- **Data minimization.** Only what the parent types (session logs and a small
  profile) plus state derivable from it. No camera, microphone, or location.
- **Local only.** No accounts, no server, no database — everything is in the
  device's `localStorage`.
- **No analytics and no third-party requests at runtime.** Typography uses
  system font stacks; every request is same-origin.
- **No AI/LLM calls.** The adaptive engine is local, rule-based code.
- **Synthetic-only repository.** The public repo contains only synthetic data;
  an automated privacy guard fails CI if personal identifiers appear in tracked
  files or in the built `dist/` artifact.
- **History cleaned.** Sensitive data was removed from Git history with
  `git-filter-repo` ([ADR-0004](adr/0004-git-history-cleanup.md)).
- **Honest residual risk.** Anyone with the unlocked device can read the data,
  and free-text notes are under the parent's control — the UI encourages neutral
  phrasing but cannot prevent sensitive text from being typed.

## 6. Product & UX

- **The child stays off-screen.** All content is for the adult: parent scripts,
  a table-setup diagram, a reason for each suggestion.
- **Suggestions are opportunities, not obligations.** All three daily windows
  stay available; promotion is about emphasis, not locking choices
  ([`js/session.mjs`](../js/session.mjs) `promotedWindow`). Difficulty back-offs
  and rests are framed as the system working as intended, not as failure.
- **Non-judgmental language.** There is no "bad result". Mood and difficulty are
  recorded as observations; the reward observation is descriptive, with sample
  sizes, and explicitly not a diagnosis
  ([model-card.md](model-card.md)).
- **A short form.** Logging is a few fields with a built-in timer for duration.
- **Visual language chosen by the owner.** The final "cool-paper" look (cool
  grey background, indigo accent, a segmented top control, a small summary row)
  was set by the owner from a reference screenshot; the reference font was
  deliberately not adopted so that no external font request is made
  ([manual-verification.md](manual-verification.md)).
- **Accessibility.** A native `<dialog>` for settings with `showModal()`, focus
  management and tab containment; icon hit areas of at least 44px; full PT/EN
  interface. The dialog focus and containment behavior was verified by hand,
  including an honest note on what the automation harness could not exercise
  (native key default actions) — see
  [manual-verification.md](manual-verification.md).

## 7. AI-assisted engineering

Math Trail was built with AI models used in **separate roles** — implementation,
product review and independent audit — while requirements, acceptance criteria,
product decisions and merge authorization stayed under human governance. The full
account, with concrete examples, is in
[ai-assisted-engineering.md](ai-assisted-engineering.md). In short:

- One instance implemented; another audited. Divergences were resolved **in the
  code**, not by whichever report sounded more confident.
- Audit findings were not accepted on assertion. Some were confirmed and fixed;
  some were **false positives** that were withdrawn once checked against the
  source. Every accepted fix landed with a test.
- CI and branch protection were the real gates. **No AI had authority to merge.**
  Evidence — a failing or passing test — decided disputes, not authority.
- The clearest example is incident #1: a plausible-looking migration
  implementation was rejected because an adversarial test showed it destroyed 5
  of 5 fields. The narrative lost to the fixture.

## 8. Results

Only verifiable facts, as of 2026-07:

- **153 automated tests, 0 skipped**, across 16 test files.
- **9 real incidents** (Section 4) each covered by a regression test.
- **28 activities**, localized PT-BR and EN.
- **Zero external requests at runtime** — system fonts, no third-party fetches.
- **Zero runtime and zero build dependencies.**
- Build output: `dist/` ≈ 440 KB; single-file bundle
  `dist/standalone/index.html` = 204,125 bytes.
- **CI pipeline:** lint → tests → build → artifact checks → deploy of `dist/`
  only, to GitHub Pages. The `main` branch is protected (PR required, strict
  `quality` status check).
- **Offline-capable** PWA; installs to the home screen.
- Live app: <https://samuel3ssilva.github.io/math-trail/> (synthetic demo at
  `?demo=1`).

These are engineering and privacy properties. This project makes **no** claims
about adoption, child learning outcomes, or educational impact.

## 9. Limitations

- **Not a diagnosis or assessment.** The tool does not screen, score or compare
  children, and it is not medical or psychological advice
  ([model-card.md](model-card.md)).
- **Small personal data.** Rules act on 2–3 events by design, which keeps them
  gentle but means they can over- or under-react on tiny samples.
- **The engine is rule-based, not ML.** No trained model, no learned weights.
- **No causal claims.** The reward observation is a descriptive comparison of
  proportions in one family's log, not a correlation or causal claim.
- **Catalog and recommendations are bounded** by a hand-built 28-activity
  catalog and a fixed rule set.
- **No professional pedagogical validation yet.** Educational validation by a
  qualified professional is future work, not a current claim.
- **Single device.** No multi-device sync by design; export/import covers device
  moves.

## 10. Next steps

If a learned component is ever added, it will follow this staged path, with the
current rules kept as the permanent baseline until something demonstrably beats
it on owner-chosen criteria:

1. `baseline_rule_v1` — freeze the current rule engine as the baseline.
2. Synthetic dataset — build an evaluation dataset of synthetic sessions.
3. Lightweight challenger — a small candidate model computed locally.
4. Champion/challenger evaluation — compare policies on-device, parent-visible,
   with the rules as champion.
5. Model card — document the challenger honestly, as the current card documents
   the rules.
6. Integrate-or-reject decision — adopt only if it wins on the chosen criteria;
   otherwise reject and keep the baseline.

No experimentation of this kind exists today.
