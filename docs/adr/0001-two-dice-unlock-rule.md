# ADR-0001 — Two-Dice Count-On unlock requires consecutive mastery

**Status:** accepted · 2026-07-20

## Context

"Two-Dice Count-On" assumes the child subitizes single-die faces effortlessly.
The UI promises: *"Reach Level 3 on Dice Flash + 2× 'Too Easy'"*. The previous
implementation unlocked after **one** "too easy" at level 3 — behavior,
documentation and tests disagreed.

## Decision

Unlock **iff Dice Flash reaches mastery**: level 3 plus **two consecutive
valid** "too easy" ratings (a "just right", "too hard" or refused session in
between resets the count — the same streak the mastery rule already uses).

Consecutiveness was ambiguous in the requirement. We chose consecutive because:
1. it reuses the existing `easyStreak` mechanism — one concept, no new state;
2. two easies with a struggle in between is weak evidence of effortlessness;
3. it is the simpler implementation (`diceMastered = masteredActs.dice_flash`).

## Consequences

- Unlock and mastery are now the same event — simpler to explain to the parent.
- Slightly stricter than the old behavior; no migration needed (the flag is
  recomputed on replay).
- Covered by four Given/When/Then tests in `tests/engine.test.mjs`.
