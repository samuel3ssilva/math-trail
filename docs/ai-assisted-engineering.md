# AI-assisted engineering

Math Trail was built through AI-assisted engineering, with models used in
**separate roles** — implementation, product review and independent audit. The
requirements, acceptance criteria, product decisions and merge authorization
stayed under **human governance** throughout. This document explains that
workflow honestly, including where the AI was wrong.

The point of writing it down is not to advertise the tooling. It is to be
precise about who decided what, and why the safeguards were in the process
rather than in any model's good judgment.

## What "AI-assisted" means here — and what it does not

It does **not** mean a model was handed a prompt and produced the app. Claiming
that would be inaccurate. It means AI was used as a set of tools inside a
disciplined loop, each instance with a narrow job, with a human owner setting the
goals and holding the only merge authority.

Concretely:

- **Separation of roles.** One instance worked as the implementer. A different
  instance, given only the diff and the requirements, worked as an independent
  auditor. Product review — "is this the right thing to build?" — was a distinct
  step from implementation.
- **Human governance.** The product owner defined what to build, wrote or
  approved the acceptance criteria, made the product and design calls (for
  example, the visual language in
  [manual-verification.md](manual-verification.md), and "the child never uses the
  app" in [decisions.md §7](decisions.md)), and authorized every merge. No AI
  instance had autonomous authority to merge.
- **Evidence over authority.** When the implementer and the auditor disagreed,
  the disagreement was settled by looking at the code and, wherever possible, by
  writing a test that made the answer objective. A confident-sounding report was
  never accepted on its own.

## The gates were real, not advisory

Two mechanical gates enforced the governance so it did not depend on anyone
remembering to be careful:

- **CI.** Every change had to pass lint → tests → build → artifact checks. A
  failing test blocked the change regardless of how any report described it.
- **Branch protection.** `main` requires a pull request and a strict `quality`
  status check. This is what makes "no AI could merge on its own" a property of
  the repository, not a promise.

The automated privacy guard ([`tests/privacy.test.mjs`](../tests/privacy.test.mjs))
is part of this: it fails CI if personal identifiers appear in tracked files or
in the built `dist/` artifact, so a well-meaning AI edit cannot quietly
reintroduce private data.

## How audit findings were handled

The auditor produced findings; the findings were not truth. Each one was checked
against the source and then either confirmed with a test or withdrawn.

- **Confirmed and fixed, with a test.** The persistent-XSS finding (untrusted log
  fields reaching HTML) was real. It was fixed by rendering with
  `textContent`/`createElement` and by an allowlist import contract, and locked
  in by [`tests/xss.test.mjs`](../tests/xss.test.mjs) plus a hand-verified DOM
  check in [manual-verification.md](manual-verification.md). Threat
  [T3](threat-model.md) records it as mitigated.
- **False positives, withdrawn.** Some audit findings did not survive contact
  with the code and were dropped rather than "fixed" for appearances. Examples of
  the kind of claim that was checked and rejected: that the engine read the wall
  clock directly (it does not — the clock is injected and `replayState` is
  clock-free, [`js/engine.mjs`](../js/engine.mjs),
  [ADR-0002](adr/0002-clock-injection.md)); and that imported data could reach
  the DOM as markup after the renderer fix (it cannot — verified in the rendered
  DOM, [manual-verification.md](manual-verification.md)). A finding that cannot
  be reproduced in the code is not a finding.

## The clearest example: a plausible implementation rejected by a test

Incident #1 in the [case study](case-study.md) is the sharpest illustration of
"evidence over authority". A candidate storage-migration implementation looked
correct and was described as reusing the old data. In fact it wrote to a new key
while persisting empty state on first load, aborted its migration loop silently
on the first non-JSON value, and re-stamped dates to "today" with defaults —
fabricating a false history.

No amount of narrative settled this. An adversarial test did: seed a real v1
fixture, run the migration, count surviving fields. The candidate preserved 0 of
5; the accepted "verbatim copy or nothing" approach preserved 5 of 5. The test
decided, the policy was written down ([decisions.md §5](decisions.md)), and a
regression test now guards it ([`tests/storage.test.mjs`](../tests/storage.test.mjs)
against
[`tests/fixtures/synthetic/v1-backup.synthetic.json`](../tests/fixtures/synthetic/v1-backup.synthetic.json)).

## Where the AI was wrong

Being honest about this is the point of the document:

- It produced a **data-destroying migration** that looked safe (incident #1).
- It **missed the timezone day-boundary bug** initially; the local-calendar fix
  came after the failure was reproduced (incident #2,
  [`tests/time.test.mjs`](../tests/time.test.mjs)).
- It shipped an **incomplete rollback** that could leave state referencing a
  missing log, because `localStorage` is not transactional (incident #5).
- The auditor raised **false positives** that had to be refuted in the code
  before being dropped.

None of these reached `main` as silent regressions, because a test — not a model
— had the last word, and a human authorized the merge.

## Boundaries kept

- No private prompts or personal data are reproduced here.
- The claim is not that a model "wrote the app". The claim is that AI was used in
  bounded roles inside a human-governed process with mechanical gates.
- The safeguards live in CI, branch protection and the test suite — places that
  do not depend on any model, or any person, choosing to be careful on a given
  day.
