# Case study: evaluating two AI implementations of the same redesign

*July 2026. This repo's v2 redesign was built with AI as a pair-engineer. This is the story of how the two candidate implementations were evaluated — and why one of them never shipped.*

## Setup

The v1 app (a single HTML file) needed a design overhaul. Two AI assistants produced complete redesigns of the same app:

- **Candidate A** rebuilt the visual layer *on top of the existing engine*: same activity catalog, same adaptive rules, same localStorage keys.
- **Candidate B** delivered a visually attractive rewrite — with confident release notes: *"the same storage key was kept, existing sessions will load."*

## Verification instead of trust

Rather than comparing screenshots, both candidates were tested against the same bar: **does real v1 data survive?** A fixture with five genuine v1-format sessions was seeded into localStorage, and each build was loaded against it.

Candidate A: 5/5 sessions intact.

Candidate B: **0/5 sessions migrated.** Reading its code explained why:

1. It wrote to a **new** storage key while claiming otherwise, and persisted an empty state on first load — blocking any future migration.
2. Its migration loop wrapped the whole key scan in one `try` block; the first non-JSON value in storage (a plain language string) threw and **silently aborted the entire migration**.
3. Even if the loop had survived, its field mapping defaulted every unknown activity to a hard-coded id, re-stamped every historical date to "today", and mapped old completion/mood/ease values to defaults — **fabricating a plausible-looking but false history**.
4. Separately: the release notes claimed custom fonts and a Portuguese default that the delivered file did not contain.

None of this was visible in screenshots. All of it was visible in twenty minutes of adversarial testing.

## What shipped because of it

- The good *ideas* from Candidate B were absorbed on top of Candidate A's data-safe base: a pre-planned daily routine per window, a session timer, connection-as-reward, warmer microcopy.
- The failure became a permanent regression test: [`tests/engine.test.mjs`](../tests/engine.test.mjs) loads [a real v1 backup fixture](../tests/fixtures/v1-backup.json) and asserts **zero field loss** and correct engine replay.
- Migration policy became a written rule ([decisions.md §5](decisions.md)): verbatim copy or nothing — no field mapping on the way in.

## The transferable lesson

AI pair-engineering is a force multiplier, but **claims in release notes are hypotheses, not facts**. The useful skill is not writing the code — it is designing the cheap experiment that would falsify the claim: seed real data, load the build, count what survives. Twenty minutes of verification was the difference between a redesign and a family's practice history silently erased.
