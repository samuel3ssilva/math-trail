# Threat model

Scope: a local-first static web app holding a family's practice log in
`localStorage`, developed in a public repository, deployed to GitHub Pages.
Ratings: probability × impact, qualitative (L/M/H).

| # | Threat | P | I | Mitigation |
|---|---|---|---|---|
| T1 | **Accidental exposure of child data in Git** (fixture, comment, calibration note, key name) | M | H | Automated privacy guard fails CI on banned patterns (`tests/privacy.test.mjs`); synthetic-only fixtures with `_synthetic` marker; `.gitignore` blocks private dirs; history-rewrite runbook in [adr/0004](adr/0004-git-history-cleanup.md) |
| T2 | **Real backup committed to the repo** (`math-trail-backup-*.json` in a `git add .`) | M | H | Export filename pattern is gitignored; privacy test asserts no tracked file matches backup globs |
| T3 | **XSS via imported JSON** (malicious backup with HTML in `notes`/`activity`) | L | M | **Mitigated (2026-07-20).** Two tested layers: the import contract rejects unsafe ids, unknown activities, oversized/non-string notes and object-valued profile fields, and normalizes to an allowlist (no extra fields survive); the history renderer builds DOM nodes with `textContent` and real listeners — no user data ever reaches `innerHTML` or attributes (enforced by source-assertion tests in `tests/xss.test.mjs`) |
| T4 | **Malicious/corrupted JSON import breaking the app** | M | M | `validateBackup` rejects non-objects, missing versions, future versions and invalid logs; failures change nothing (tested) |
| T5 | **Data loss during migration/import** | M | H | Automatic pre-import snapshot + rollback on failure (tested); verbatim-copy migration policy; regression test with a v1 fixture |
| T6 | **Physical/local access to the device** | M | M | Out of scope for a localStorage app — documented honestly in privacy.md; recommend OS-level device lock; no secrets are stored |
| T7 | **Service worker serving a stale version** (bugfixes never reach the user) | H | M | Versioned cache name bumped per release; `activate` deletes old caches; build test asserts the shell list matches shipped files. Incident actually observed during development and fixed |
| T8 | **Leakage via logs/console** | L | L | No analytics; no console logging of user data in production code |
| T9 | **Compromised dependencies** | L | H | Zero runtime dependencies and zero build dependencies — the supply chain is Node itself and two GitHub Actions, pinned by major version |
| T10 | **Deploying the wrong directory** (repo root with docs/tests/fixtures instead of `dist/`) | M | M | Build copies from an explicit allowlist; Pages deploys only the CI-built `dist/` artifact; CI step greps the artifact for private paths and personal patterns |
| T11 | **Prompt-adjacent risk: adding trackers/AI later without review** | L | H | privacy.md states the "never collected" list; CONTRIBUTING requires a privacy review for any network call |

## Non-threats (out of scope by design)

- Server-side breaches — there is no server.
- Account takeover — there are no accounts.
- Cross-device sync conflicts — sync deliberately does not exist.
