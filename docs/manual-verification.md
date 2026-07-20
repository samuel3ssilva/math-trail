# Manual verification record

Behaviour that the automated suite cannot reach is verified by hand and recorded
here, including what could **not** be verified. An unverified claim is worse than
an untested one, because it reads as evidence.

## 2026-07-20 — pending session, stored-content XSS, settings dialog

**Environment.** Chromium 148.0.7778.271 (Electron 42.5.1) on macOS 10.15.7
(MacIntel), viewport 441×714 (narrow, the shape a parent actually holds).
App served from the working tree over `http://localhost`, branch
`feat/ux-redesign`. Automation drove real input events (`isTrusted: true`).

### Pending session (P0-1 / P1-1) — verified

| Step | Result |
|---|---|
| Session seeded as ended 19 Jul 23:50 local, then a full page reload | Notice visible: "Sessão encerrada — salve abaixo para guardar o registro. (10 min) — descartar sem salvar" |
| Window and activity restored | `bedtime` / `dino_flash` |
| Tab selected on start-up | "Registrar" carries `aria-current` |
| Saved on 20 Jul via the real Save button | Stored `timestamp` = `2026-07-20T02:50:00.000Z`, identical to `endedAt` |
| Calendar day of the session vs. of the saving | `2026-07-19` vs. `2026-07-20` — different, as intended |
| History grouping | Heading reads **"Ontem"**. Before the fix this said "Hoje" |
| Pending key after a successful save | Removed; notice hidden |

### Stored-content XSS (P1-2) — verified in the rendered DOM

Payloads stored as plain strings in `notes` and in the profile name, then
rendered: `<img src=x onerror=alert(1)>` and `</p><script>alert(1)</script>`.
`window.alert` was replaced by a recorder, so a firing payload would have been
counted rather than blocking the run.

- both payloads appear **literally as text** (`.sessnote` textContent);
- `img` elements in the history list: **0**; in the whole document: **0**;
- `script` elements in the list: **0**;
- elements carrying `onerror` / `onclick` / `onmouseover` attributes: **0**;
- alerts fired: **0**;
- the profile-name payload renders as text in the header title;
- edit and delete still work (real listeners; editing pre-filled the payload
  into the form as an inert string);
- switching PT↔EN re-renders without turning any stored text into markup;
- rendering does not modify the stored logs.

### Settings dialog (P1-3) — partly verified, honestly

Verified with real, trusted key and mouse events:

- the gear button is reachable by keyboard (Tab / Shift+Tab) and exposes an
  accessible name;
- `showModal()` puts the dialog in the `:modal` state; initial focus lands on
  the first field (`#set-name`);
- **Tab containment**: 12 consecutive Tab presses cycled through the dialog and
  returned to the first field without ever leaving it; Shift+Tab likewise stayed
  inside. Background content is therefore not reachable while the modal is open;
- a click on the dialog content does **not** close it;
- a click on the backdrop closes it **and** focus returns to the gear button;
- accessible names follow the language: PT `Configurações` / `Navegação
  principal`, EN `Settings` / `Main navigation`, with `document.documentElement.lang`
  switching between `pt-BR` and `en`.

**Not verified — tooling limitation, not a finding about the app.** The
automation harness delivers trusted `keydown`/`keyup` but does not run
user-agent *default actions*. Measured directly: pressing Enter on the focused
gear button produced `keydown`+`keyup` with `isTrusted: true` and **no `click`
event**; pressing Escape inside the open dialog produced a trusted `keydown` and
**no `cancel` event**, and the dialog stayed open. Both behaviours are native
`<dialog>` semantics that a physical keyboard exercises.

Still outstanding, on real hardware:

1. Enter/Space on the gear button opens the dialog;
2. Escape closes it and returns focus to the gear button.

## 2026-07-20 — visual polish round (layout, rhythm, composition)

Same environment as above. Measured with `getBoundingClientRect()` at a 390 px
viewport, demo data, before = `5b742d9` and after = this round. The old files
were checked out into the working tree to measure, then restored.

| Measure (390 px) | Before | After |
|---|---|---|
| Plan tab height | 1531 px | **1285 px** (−16%) |
| Window heights (morning / afternoon / bedtime) | 370 / 321 / 307 | **224 / 348 / 224** |
| History tab height | 4950 px | 4634 px (−6%) |
| One session row | 179 px | 163 px (−9%) |
| History icon-button hit area | 38 px | **44 px** |

The window numbers are the point of the round. Before, the three proposals were
within 20% of each other in height with identical treatment — nothing told the
parent where to look. After, the window the clock is in is ~55% taller than the
other two and is the only one with a filled primary button, while the other two
keep every capability.

Honest note on history: the structural change (a session is a row on the day's
thread instead of a card inside a card, and the icon buttons are ink-light) is
larger than the 6% height gain suggests. Wrapping pills still drive most of the
remaining height, and compacting those was not attempted in this round.

Also checked: no horizontal scroll at 320 px (`scrollWidth === clientWidth ===
320`); the window title wraps at a word boundary; the state chip stays on the
header line; the settings dialog behaviour verified earlier is unchanged.
