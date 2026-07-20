# ADR-0002 — Clock injection: replay is clock-free, temporal rules read-time

**Status:** accepted · 2026-07-20

## Context

`applyLog` consulted `new Date()` to expire cooldowns while folding history.
Replaying the same logs on different days produced different states — the
"deterministic replay" guarantee was false, and untestable without freezing
the world clock.

## Decision

Split the state pipeline:

```text
historicalState = replayState(logs)                 # pure fold, no clock
effectiveState  = evaluateTemporalRules(state, now) # expiry etc., `now` injected
```

- Cooldowns are **anchored to the triggering log's own timestamp** and stored
  as `cooldownUntil`; expiry is evaluated only at read time.
- A log without a timestamp cannot start a cooldown (skip, don't guess).
- The engine bans `new Date()`, `Date.now()`, `Math.random`, `localStorage`
  and DOM access — enforced by an automated purity test.
- Local-calendar concepts ("today", streaks, daily seed) come exclusively from
  `time.mjs` (`localDateKey`), never `toISOString().slice(0,10)` — which is UTC
  and flips the date at 21:00 in America/Sao_Paulo.

## Consequences

- Same logs + same `now` ⇒ identical result, on any day, in any timezone —
  tested with fixed clocks before/after expiry and with TZ-pinned subprocesses.
- UI reads go through `getState()` = raw + `evaluateTemporalRules(…, new Date())`;
  the stored historical state is never silently rewritten by the clock.
