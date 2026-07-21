# Model card — the Math Trail adaptive engine

## What this is

A **local, explainable, rule-based personalization system**. There is no
machine learning: no trained model, no weights, no inference service. Calling
it "AI" would be inaccurate; this card uses model-card structure because the
system makes automated suggestions that affect a family's routine, and such
systems deserve the same documentation discipline.

## Intended use

- Help a parent choose the next 2–8 minute off-screen math activity for a
  toddler (~2–4 years), based on what the parent has logged.
- Adjust difficulty gently (levels 1–3 per activity) and back off when the
  child shows resistance or frustration.
- Surface low-confidence observations for the parent to consider.

## Out-of-scope / not recommended uses

- Any assessment, screening or diagnosis of a child's development.
- Comparing children to each other or to norms — there are no norms here.
- Use by schools/daycares to evaluate children.
- Any decision that would not be reviewed by the caregiver.

## Inputs

Session logs typed by the parent: window, activity, completion, mood
(parent-observed), challenge ease (parent-judged: "how the challenge felt"), reward used, optional
duration and note. Plus the profile's book-chapter focus.

## Outputs

- One suggested activity per daily window (with human-readable reasons).
- A difficulty level per activity.
- Mode flags: story mode, part-part-whole cooldown, activity unlocks.
- A descriptive reward observation with sample sizes.

## Rules (complete list)

| Rule | Trigger | Effect |
|---|---|---|
| Level up | 2 consecutive valid "too easy" | level +1 (max 3) |
| Level down | 1 "too hard" | level −1 (min 1) |
| Mastery | 2 consecutive valid "too easy" at level 3 | activity marked mastered, down-weighted |
| Story mode | ≥2 "resisted" in last 3 sessions | scripts switch to adventure framing for 3 sessions |
| Cooldown | "too hard" at level 1 on composition | category rests 48h (anchored to the log's timestamp) |
| Unlock | Dice Flash mastered | Two-Dice Count-On enters the pool ([ADR-0001](adr/0001-two-dice-unlock-rule.md)) |
| Reward observation | ≥5 sessions per reward group AND ≥30 p.p. resistance gap | descriptive notice with sample sizes |
| Scoring | always | weight × chapter ×2 × current-gap ×1.6 × recency penalties × mastery ×0.4 |

## Determinism and explainability

`state = replay(logs)` is a pure fold; time-dependent rules are applied at read
time with an injected clock (`evaluateTemporalRules(state, now)`). The same
logs + the same instant always produce the same result, on any day, in any
timezone. Every suggestion carries its reasons in plain language.

## Fallbacks

- Log without timestamp → cannot start a cooldown (skipped, not guessed).
- Empty pools after filtering → day-repeat filter relaxes rather than failing.
- Corrupted storage → defensive reads return safe defaults.
- Insufficient reward data → the observation suppresses itself.

## Risks and possible biases

- **Observer bias:** all inputs are parent judgments ("too easy", "resisted");
  the system inherits the parent's frame. Mitigation: language avoids scores
  and verdicts; "there is no bad result".
- **Small-sample noise:** rules act on 2–3 events by design (to stay gentle);
  they may over- or under-react. Mitigation: every action is reversible and
  visible; level-downs are framed as the system working as intended.
- **Confounders:** tiredness, illness, time of day are not modeled and can
  masquerade as difficulty or reward effects. Documented in the UI copy.
- **Not medical/psychological advice** — stated in the interface and here.

## Privacy

All inputs and outputs stay on-device. See [privacy.md](privacy.md).

## Future work (explicitly not in this version)

A champion–challenger setup could A/B compare suggestion policies **locally**
(both policies computed on-device, parent-visible), with the current rule set
as the permanent champion until a challenger wins on parent-chosen criteria.
No such experimentation exists today.
