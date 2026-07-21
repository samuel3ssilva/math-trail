# UX & product audit — redesign baseline

Audited at tag `v0.1.0-security-baseline` (`cb830b7`), against the live flows
exercised at 320/375/390/768/1280 px with synthetic demo data. Every finding
below names the problem and the change that answers it; findings with no
planned change are listed under "accepted for now".

## 1. Findings

### Product clarity

| # | Finding | Severity | Decision |
|---|---|---|---|
| C1 | The first screen a parent sees is the **week summary + "Construindo agora"** — history and progress compete with the actual question ("what do we do now?"). Today's plan renders below the fold on phones. | High | Today's plan becomes the first content block; the week summary moves *below* the plan, inside the Plan tab, in a compact form. |
| C2 | "Construindo agora: *Counting 6–10 one-to-one*" — the headline goal is the **path to ten**, in **English inside the PT interface**. It reads as a grade the child must reach. | High | Milestone labels localized; the focus block reframed as "Explorando agora" with an explicit "development varies / this is not an assessment" note; progress framed as breadth of experiences, not a ladder to 10. |
| C3 | The **reason for a suggestion** only appears after opening the activity details. The plan card says *what* but not *why*. | Medium | The daily-pick card shows the top reason inline ("varia depois de ontem", "continua o capítulo…"). |
| C4 | "Kate Snow cap. 4" in the header is **technical context** competing with the product identity on every screen. | Low | Chapter stays in Settings; the header shows only name + age (or the tagline). |
| C5 | Routine-block states are binary (nothing / "feita hoje"). "Started" is only visible via the session bar. | Medium | Explicit chip states: *sugerida* (default, chipless), *em andamento*, *feita hoje*; skipped/unused stays neutral — never alarmed. |
| C6 | With an empty pool the pick card shows the raw "— escolher atividade —" placeholder. | Low | Proper "no recommendation" state with a next step. |

### Information architecture

| # | Finding | Severity | Decision |
|---|---|---|---|
| A1 | The parent's real workflow is *see → decide → start → play off-screen → finish → record*. The current order (summary → plan → form in another tab) forces a detour at the start. | High | Reorder per C1; "Encerrar e registrar" already lands in the prefilled form — kept. |
| A2 | The session form asks **six decisions** (window, activity, participation, mood, challenge, reward) + notes on one dense screen. Reward and notes are secondary for most sessions. | High | Core = three chip rows. Reward + notes fold into a "Mais detalhes (opcional)" disclosure with safe defaults. Window/activity stay prefilled by the session flow. |
| A3 | "Adaptive State" panel exposes engine internals (cooldowns, gates) as a primary Progress section. | Medium | Renamed to plain language and folded into a `<details>` ("Como as sugestões se adaptam") — available, not competing. |
| A4 | Ending a session clears it before the log is saved; abandoning the form silently loses the captured duration. | Medium | A visible "sessão encerrada — falta salvar" notice on the form until saved. |

### Visual hierarchy, typography, spacing

| # | Finding | Severity | Decision |
|---|---|---|---|
| V1 | **Three different primary-button colors** (amber/blue/violet per window) — three competing primaries; color stops meaning "main action". | Medium | One primary (brand green) everywhere; window colors remain as card identity (tint + border + icon), not as action color. |
| V2 | At **320 px** the window title wraps badly against the "feita hoje" chip. | High | Header row wraps gracefully: chip drops below the title; title size steps down via type tokens. |
| V3 | Micro-labels at 10.5–11 px (eyebrows, week-strip letters) are below comfortable legibility. | Medium | Type scale tokens with an 11.5 px floor. |
| V4 | Streak counter ("X dias seguidos") is exactly the pressure metric the product says it avoids; "50% animada" reads as a grade. | High | Streak text removed (the week strip already shows rhythm; rest days keep their meaning). Percentages replaced by plain counts ("3 sessões animadas"). |
| V5 | Spacing/rounding are consistent but ad-hoc (no scale). | Low | Token scale for space/type/radius/focus; applied to touched components. |

### Forms & data entry

| # | Finding | Severity | Decision |
|---|---|---|---|
| F1 | "Dificuldade / Cognitive ease" is assessment language about the child. | High | Reframed as a question about the *activity*: "Como estava o desafio?" (muito fácil / na medida / muito difícil). Stored values unchanged — no schema migration needed. |
| F2 | Defaults are safe (partial/neutral/na medida/brincadeira) — good. | — | Kept. |
| F3 | A forgotten running session (hours) would record an absurd duration. | Medium | Duration clamped to a sane maximum on finish; pure helper + test. |

### Accessibility (WCAG 2.2 AA pass)

| # | Finding | Severity | Decision |
|---|---|---|---|
| X1 | No `<main>` landmark; bottom nav lacks `aria-current`; no skip link. | High | Semantic landmarks, `aria-current="page"`, skip-to-content link. |
| X2 | Banner zone updates are not announced. | Medium | `aria-live="polite"` on the banner zone (toast already `role="status"`). |
| X3 | Focus visibility, reduced motion, fieldset/legend semantics, labeled selects, text+color status (✓ chips, numbered cubes) | — | Already present at baseline; preserved and extended to new components. |
| X4 | Disclosure content (`<details>`) needs visible focus + large touch summary. | Medium | Styled summary ≥44 px with focus ring token. |

### Emotional design & content

Baseline already avoids red states, guilt copy and celebration spam; the
"opportunities, not obligations" framing and penalty-free rest day exist. Gaps:
streak text (V4), grading percentages (V4), "sessões fortes" (→ "boas
sessões"), English milestone labels (C2), no explicit "this is not a
diagnostic tool" statement in Progress (added).

### Performance, offline, reliability

| # | Finding | Severity | Decision |
|---|---|---|---|
| P1 | **Google Fonts is the only third-party request** — render-blocking on first load and, because the SW caches same-origin only, typography silently degrades offline. | High | Replace with a system-font stack (rounded display on platforms that have it). Zero external requests; fully offline; one less privacy caveat. |
| P2 | No offline/update signals: going offline is silent; an updated SW serves the new version only on next reload with no notice. | Medium | Online/offline toasts + "update ready" notice wired to the SW lifecycle. |
| P3 | DOM is small (~1 screen per tab), no framework, rendering is innerHTML-per-section — adequate at this scale. | — | Accepted; no framework. |

### Accepted for now (explicitly out of scope)

- **Activity catalog content is English** (24 names, scripts, materials) inside
  a PT interface. Full translation is a content project (~300 strings) —
  recommended as the next product improvement, not mixed into this redesign.
- History filtering/grouping beyond day groups — dataset is small; would be
  analytics theater.
- Session pause; multi-child profiles.

## 2. Design direction

**The product problem:** a tired parent with 4 free minutes must decide, start
and later record one small off-screen activity — without the app grading the
child or the parent. Everything that helps that decision gets promoted;
everything else steps back.

**Emotional tone:** calm kitchen-table companion. Paper, snap cubes, one green
action. No dashboards, no scores, no urgency.

**Home hierarchy (mobile-first):** 1) Today's plan — three optional windows,
one suggested activity each with objective/materials/duration/reason and a
single green *Iniciar*; 2) the penalty-free "not a good moment" escape;
3) a compact week rhythm + "explorando agora" — below the plan, framed as
reflection, not score.

**Primary workflow:** see → decide → start (timer) → play away from screen →
finish → three taps + optional note → done. Target: finishing a session ≤ 15 s.

**Progress without grading:** breadth of early-math experiences (correspondence,
quantities, comparison, patterns, shapes, stories) shown as cube cells per
milestone, PT labels, with an explicit "development varies; not a diagnostic
tool" line. The engine's internals live behind a disclosure in plain language.

**Design principles for implementation:**
1. One primary action per screen, always green, always ≥44 px.
2. Color = identity and status support, never the only signal, never alarm.
3. Progressive disclosure over density (details/summary, not more cards).
4. Copy speaks to the parent about *the moment*, never about the child's worth.
5. Tokens over one-off values for everything touched.
6. Zero external requests; offline is a feature, not a fallback.

**Token system (implemented in `styles.css`):** type scale `--fs-2xs…--fs-xl`
(11.5→21 px floor-limited), space scale `--sp-1…--sp-6` (4/8/12/16/20/28),
radius (10/14/20), focus ring (`--ring`), surfaces/borders/status colors from
the existing paper-and-cube palette. Breakpoints: base (≤400), phone (≤919),
desktop (≥920), wide (≥1200 content cap).
