# Demo script & visual assets

The canonical, always-current visual is the **[live synthetic demo](https://samuel3ssilva.github.io/math-trail/?demo=1)** — it runs on real code with 100% synthetic data (fictional profile, no personal data). This file is the storyboard for a short screen recording and a precise record of which assets ship where.

## 60–90s demo storyboard (synthetic data only)

Record against `…/?demo=1`. No personal data, no child audio, no copyrighted music, no unnecessary narration, plain cursor, no aggressive zoom.

1. **Open the synthetic demo** — header reads "Math Trail", four calm summary cards, segmented tabs. (~5s)
2. **Today's plan** — three equal windows (morning / afternoon / bedtime), each a small colour dot + a full-width activity select + a compact ✦ suggestion button. (~8s)
3. **Swap an activity** — pick a different activity from a window's select. (~5s)
4. **Open the details** — the blueprint appears: setup diagram, parent script, "why this pick". (~10s)
5. **Start a session** — tap Start; the timer bar appears. (~6s)
6. **End it** — tap End; a "still to save" notice appears (the pending session). (~6s)
7. **Log it** — three quick choices (how it went / mood / how the challenge felt) + optional note; Save. (~10s)
8. **Open History** — the saved session appears in the day thread. (~6s)
9. **Switch PT ⇄ EN** — the interface *and* the activity catalog change language. (~8s)
10. **Installable / offline** — show the PWA install affordance / that it works with the network off. (~6s)

## Where the assets live

| Asset | Status | Location |
|---|---|---|
| Architecture diagram | ✅ shipped | [`docs/assets/math-trail-architecture.svg`](assets/math-trail-architecture.svg) (SVG, used as the README hero) |
| Interactive screens | ✅ always current | the live synthetic demo link above |
| Raster screenshots (`.webp`) & screen recording | ⏳ pending — see note | to be attached to the [GitHub Release](https://github.com/samuel3ssilva/math-trail/releases/latest) |

## Honest note on the pending raster assets

Committed `.webp` screenshots and a recorded video were **not produced as repository files in this build environment**. The browser tooling available here renders a screenshot to the operator for verification but does not persist raster image files to disk, and generating them would require a headless-browser dependency — which conflicts with the project's zero-dependency decision ([ADR-0003](adr/0003-no-tooling-deps.md)) and is not worth taking on for screenshots.

Per the release plan, this does **not** block v1.0.0: the architecture diagram ships in-repo, the live synthetic demo is the always-accurate interactive screenshot, and this storyboard documents the recording. The raster screenshots and the video can be captured from the live demo and attached to the GitHub Release (assets attached to a Release do not inflate the repository).
