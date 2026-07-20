# ADR-0003 — Zero-dependency lint/format instead of ESLint + Prettier

**Status:** accepted · 2026-07-20

## Context

The pipeline must lint and check formatting. The conventional answer
(ESLint + Prettier) would introduce the project's first `node_modules` — for an
app whose supply-chain surface is deliberately zero (threat model T9).

## Decision

A custom 60-line gate (`scripts/lint.mjs`, `npm run lint`) checks: syntax of
every JS file (`node --check`), no tabs / trailing whitespace / missing EOF
newline, and architectural layering (domain modules cannot import the UI).
High-value semantic rules (engine purity, banned UTC date keys, personal-data
patterns) live in the test suite where they fail with real messages.

## Consequences

- ✅ Supply chain stays: Node + two pinned GitHub Actions. `npm install` is a no-op.
- ❌ No auto-formatting and far fewer style rules than ESLint. Accepted: one
  small codebase, one maintainer, and the rules that matter are the semantic
  ones we wrote ourselves.
- Revisit if the project gains contributors or a second app.
