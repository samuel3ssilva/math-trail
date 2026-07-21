# Math Trail user guide

A complete, friendly guide to using Math Trail — written for anyone, with no technical terms.

> Leia em português: [user-guide.pt-BR.md](user-guide.pt-BR.md) · App: <https://samuel3ssilva.github.io/math-trail/>

---

## 1. What Math Trail is

Math Trail is a tool **for the parent** (the adult) to plan, run and record short math moments with a young child.

- **The child doesn't operate the app.** You use it; the child plays with real objects.
- Activities happen **mostly off-screen** — with cubes, dinosaurs, dice, paper and pen.
- **Morning, Afternoon and Bedtime** are **optional opportunities**, not obligations. Do one, several or none.
- It is **not** a diagnostic or school-assessment tool. There are no grades and no "right" or "wrong".

## 2. Quick start

```
Open the Plan
 → choose or accept an activity
 → check the materials
 → start the session
 → run the activity off-screen
 → end it
 → log it
 → check the history
```

In 2–5 minutes you'll run your first activity.

## 3. Header

At the top of the screen:

- **Title** — shows **"Math Trail"** when no child name is set, or **"[name]'s Math Trail"** once you set a name in Settings.
- **Subtitle** — the child's age (e.g. "Age 3y 1m"), from the birth month. With no name and no valid birth, a short product line shows instead.
- **PT / EN** — switches the language (changes **everything**, including the activities).
- **Current mode** — a small badge showing how suggestions are right now: **Normal**, **Story** (scripts become an adventure for a few sessions) or **Cool-Down** (a skill is resting). It's an **indicator**, not a button.
- **⚙ Settings** — opens settings and backup.

## 4. Summary cards

Below the header are four cards. They are **informational only** — not a grade, diagnosis or comparison of the child:

| Card | What it shows | Where it comes from |
|---|---|---|
| **Sessions · 7d** | how many sessions in the last 7 days | a count of your sessions |
| **Explored** | how many different activities you've tried | your history |
| **Suggested** | the window suggested now (Morning/Afternoon/Bedtime) | the device clock |
| **Building now** | the experience currently in focus | the suggestion engine |

## 5. Navigation (the four tabs)

| Tab | What it's for | When to use it | Available actions |
|---|---|---|---|
| **Plan** | see what to do now | at the start of a moment | choose/suggest an activity, start, mark a rest day |
| **Log** | record how a session went | right after the activity | fill in and save the record |
| **History** | review sessions by day | whenever you want to follow along | edit or delete a session |
| **Stats** | see the trail and rhythm | now and then | read-only (nothing to fill in) |

## 6. The daily plan

The Plan has three windows — **Morning · ~8–11 AM**, **Afternoon · ~12–5 PM** and **Bedtime · ~8 PM**. **None is mandatory.**

- **Coloured dot** — identifies each window (amber/indigo/dark).
- **"now" tag** — appears on the window for the current time (a hint, not a demand).
- **"done today" tag** — that window already had a session today. During an active session it reads **"in progress"**.
- **Activity select** — "— choose activity —": pick one from the list.
- **✦ button** — asks for a **smart suggestion** for that window.

Choosing or suggesting opens the **activity detail** with:

- the **materials** and rough **duration**;
- a **setup diagram** (how to arrange the objects);
- a **parent script**, step by step;
- **why** the activity was suggested;
- **▶ Start** (begins a timed session), **Log this session** (jumps to the form) and **↻** (another suggestion).

Below the windows, **"Not a good moment today"** marks a rest day — **no penalty**.

## 7. What each button does

| Control | Where it appears | What it's for | What happens next | Changes/saves data? |
|---|---|---|---|---|
| **PT / EN** | Header | switch language | interface and catalog change language | Yes (the language preference only) |
| **⚙ Settings** | Header | open settings/backup | opens the Settings dialog | No (just opens) |
| **Activity select** | Plan (each window) | pick an activity | shows the activity detail | No |
| **✦** | Plan (each window) | smart suggestion | shows the detail of a suggested activity | No |
| **▶ Start** | Activity detail | begin a timed session | the timer bar appears | Yes (marks an active session) |
| **Log this session** | Activity detail | go to the form | opens the Log tab, pre-filled | No |
| **↻** | Activity detail | another suggestion | swaps the shown activity | No |
| **Finish & log** | Session bar | end the active session | becomes a **pending session** and opens the form | Yes (keeps the pending capture) |
| **discard** | Session bar | cancel the active session | asks to confirm, then discards | Yes (after confirming) |
| **Not a good moment today** | Plan | mark a rest day | records a rest day, no penalty | Yes |
| **More details (optional)** | Log | reveal optional fields | expands reward and notes | No |
| **Save session** | Log | save the record | stores the session and clears the pending one | Yes |
| **discard without saving** | Pending notice | drop the finished session | asks to confirm, then removes the pending capture | Yes (after confirming) |
| **cancel** | Log (while editing) | leave editing | returns to the normal form | No |
| **✏️ Edit session** | History | edit a saved session | opens that session in the form | No (until you save) |
| **🗑️ Delete session** | History | remove a session | asks to confirm, then deletes | Yes (after confirming) |
| **Save** | Settings | save settings | stores name/birth/chapter | Yes |
| **Close** | Settings | close the dialog | back to the app | No |
| **Export JSON** | Settings | download a backup | creates a file with your data | No (read-only) |
| **Import JSON** | Settings | restore from a file | opens the file picker | Yes (after confirming) |
| **Delete all sessions** | Settings | erase everything on this device | asks to confirm (destructive) | Yes (after confirming) |

> **Normal / Story / Cool-Down** in the header are **status indicators**, not buttons — they change on their own as the engine adapts.

## 8. A session in progress

Tapping **▶ Start** shows the **session bar** at the top, with:

- the **current activity** and a running **timer**;
- **Finish & log** (ends it and opens the form) and **discard**.

You **don't need to keep the screen open** during play — the activity is off-screen. The session **survives** if you close or reload the app, and stays valid even if the app **updates** to a new version in the meantime. When you're done, come back and tap **Finish & log**.

## 9. A finished session waiting to be logged (pending)

When you end a session, it becomes a **pending session**: finished, but **not yet saved**.

- A **notice** stays visible: *"Session finished — save it below to keep the record."*, with the duration and a **discard without saving** option.
- The pending session **survives a reload** and app restart — it isn't lost.
- While one is pending, **starting a new session is blocked** (the app says: *"A finished session is waiting — save or discard it before starting another."*).
- To **save**: fill in the form and tap **Save session**.
- To **discard**: use **discard without saving** and confirm (the captured duration will be lost).
- The **real end time is preserved** — a session finished at 11:50 PM and saved at 12:10 AM stays recorded on the day it happened.

## 10. The log form

On the **Log** tab (or right after ending a session), you record it in simple steps:

- **Session window** and **Activity** — already filled when you come from an activity.
- **How did it go?** — Full · Partial · Refused.
- **Child's mood** — Excited · Neutral · Resisted. It's an **observation**, not a grade.
- **How was the challenge?** — Too easy · Just right · Too hard. This helps the app tune the **level** next time.
- **More details (optional)** — *What sustained the activity?* (Play itself · Connection · Treat) and a short **note**.
- The **duration** is captured automatically when you use the timer.
- **Save session** stores it all.

Records exist to **adapt the suggestions** to what works for you — **never to grade the child**.

## 11. History

The **History** tab shows your sessions **grouped by day** ("Today", "Yesterday", dates). Each session shows:

- the **window**, the **time** and the **duration**;
- small tags (mood, how it went, challenge, what sustained it) and, if any, your **note**;
- **✏️ Edit session** and **🗑️ Delete session**.

Editing or deleting **recomputes everything automatically** — future suggestions use the history, so changes here can change what the app recommends.

> ⚠️ **Before deleting**, remember it removes that session. To keep everything first, run an **Export JSON** in Settings. Deleting a session asks for confirmation.

## 12. Stats and experiences

The **Stats** tab is read-only and shows **rhythm**, never a grade:

- **Experience trail** — the on-ramps to math, in a gentle order. "**Explored**" means the child has had consistent contact with that experience (not that they "learned" or "passed").
- **Goal Progress** — what's in focus now, shown as **plain counts**.
- **Mood over time** — a summary of the observed mood.
- **How suggestions adapt** — a collapsible peek at how the app adjusts. Nothing here is a diagnosis.

Development is **not** shown as a competition, ranking or grade — only as presence and rhythm.

## 13. Settings

Tap **⚙**. The available options are:

- **Child's name** — optional. With a name, the title personalizes; without one, it shows "Math Trail".
- **Birth month** — used only to display the age.
- **Current Kate Snow chapter** — if you follow the book *Preschool Math at Home*, the app boosts matching activities. Or leave it on "No chapter focus".
- **Language** — lives in the **header** (PT / EN).
- **Data backup** — **Export JSON** and **Import JSON**.
- **Delete all sessions** — a **destructive action**: erases the app's data on that device. It asks for confirmation and suggests exporting a backup first.

Tap **Save** to keep changes and **Close** to exit. The dialog also closes with **Esc** or a click outside it.

## 14. Export and import

- **Export JSON** creates a file with **your data** (profile, sessions, state) — and **includes the pending session**, if any, so nothing is lost.
- Data lives **locally**, on the device; the backup is how you carry it to another device.
- On **Import**, the app **validates the file** first. Before writing, it takes a **snapshot** and, if anything fails, **restores everything** (rollback) — *"Import failed — your previous data was restored automatically."*
- An **invalid backup** is refused with no change: *"This file is not a valid backup… Nothing was changed."*
- **Pending session in a backup:** if your device has **no** pending session, the backup's one is restored and appears on the Log tab. If your device **already** has a pending session, **yours is kept** and the app reports the conflict — save or discard yours first. If the backup's pending session is unreadable, it is skipped and everything else is imported.

> There is no cloud sync — backups are **manual** and stay with you.

## 15. Demo mode

- Open **<https://samuel3ssilva.github.io/math-trail/?demo=1>** to load example data.
- **All data is synthetic** — the profile is fictional and **does not represent a real child**.
- The demo is for **exploring**. For personal use, open the app **without** `?demo=1`: it starts empty, with your own data.
- A notice confirms: *"Demo mode — synthetic sample data loaded. Clear it in Settings."* The demo can be safely regenerated and updates itself across versions without touching real data.

## 16. Privacy

- Your data stays **on the device** (in the browser). There is **no** account, server, analytics, tracker or ad.
- **No child data is sent** to external services — the deployed app makes no third-party requests.
- **Clearing your browser data** (or using "Delete all sessions") **erases the local history**. That's why **backups are your responsibility** — export from time to time.

## 17. Offline use and installing

- **Install:** from the browser menu, choose **"Add to Home Screen"** / **"Install"**. Math Trail becomes an app on your home screen.
- **Offline:** once opened once, it works **without internet** — the data is already on the device. With no connection you'll see: *"No internet — everything keeps working on this device."*
- **First visit:** the app stores a copy of its files so it can run offline next time.
- **Updates:** when a new version is ready you'll see *"A new version is ready — reload to use it."* You may need to **reload once** to see the new version. No technical step is required.

## 18. Accessibility and keyboard

- **Tab** and **Shift+Tab** move through the controls; the **focus** stays visible.
- **Enter** activates the focused control.
- In Settings, **Esc** closes it and focus returns to the button that opened it.
- **Switching language** also updates the accessible names (for screen readers).
- Information **doesn't rely on colour alone** — text and icons accompany the colours.

## 19. Troubleshooting

Always start with the **safe** actions. **Never** delete all data before exporting a backup.

- **"The old activity is still showing."** — Tap **↻** or pick another from the select; close and reopen the detail.
- **"I finished, but I still need to save."** — That's the **pending session**. Fill it in and tap **Save session**, or use **discard without saving**.
- **"I can't start a new session."** — A **pending** one is open. Save or discard it first.
- **"My history disappeared."** — Check you're on the same device/browser. If you cleared browser data, restore from a **backup** (Import JSON). Don't delete anything before trying.
- **"The backup was refused."** — The file isn't valid; **nothing was changed**. Use a file exported by the app itself.
- **"I'm offline."** — Everything keeps working; your data is on the device.
- **"The demo shows different data."** — The demo uses **synthetic** example data, separate from your personal use.
- **"I switched language and some content didn't change."** — Reopen the activity or the tab; the new language applies to what renders next.
- **"The app updated and the screen looks old."** — **Reload once**. If the new-version notice appears, reloading applies the update.

## 20. Glossary

- **Plan** — the screen with the three daily windows and the suggestions.
- **Window** — a period of the day (Morning, Afternoon or Bedtime), always optional.
- **Session** — a moment of activity with the child.
- **Pending session** — a finished session that hasn't been **saved** yet; kept until you save or discard it.
- **Experience** — a math skill/on-ramp (e.g. counting, subitizing).
- **Familiar (well-explored) activity** — one the child has seen a lot; the app lowers its weight in suggestions.
- **Demo mode** — the app with synthetic sample data (`?demo=1`).
- **Backup** — the JSON file you export/import to carry your data.
- **PWA** — an "installable app" that works offline from the browser.
- **Explainable adaptive engine** — the **rules** that choose and adjust suggestions; every suggestion traces back to a rule (it is not AI that "learns").

---

Enjoy the trail. 🦕
