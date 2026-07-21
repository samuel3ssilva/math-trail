# Data inventory

Complete inventory of every datum the system touches. There is no data that is
not listed here.

## On-device (localStorage, never transmitted)

| Key | Type | Contents | Sensitivity |
|---|---|---|---|
| `mathtrail_logs` | JSON array | session logs: `{id, timestamp, window, activity, completion, engagement, ease, reward, mins?, notes?}` | **High** — behavioral observations of a child, incl. free text |
| `mathtrail_state` | JSON object | derived adaptive state (levels, mastery, mode flags) | Medium — derivable from logs |
| `mathtrail_profile` | JSON object | `{name, birth (YYYY-MM), chapter}` | **High** — identifies the child if filled |
| `mathtrail_plan` | JSON object | today's suggested activity per window | Low |
| `mathtrail_active` | JSON object | in-progress session `{window, activity, startedAt}` | Low |
| `mathtrail_restdays` | JSON array | local date keys marked "not a good moment" | Medium |
| `mathtrail_lang` | string | `pt` / `en` | Low |
| `mathtrail_schema` | string | schema version marker | None |
| `mathtrail_snapshot_pre_import` | JSON object | automatic snapshot taken before an import | High (copy of the above) |

## Files the user creates

| Artifact | Created by | Contents |
|---|---|---|
| `math-trail-backup-YYYY-MM-DD.json` | Settings → Export | full copy of profile + state + logs. **Private.** Gitignored by pattern. |

## In the public repository (synthetic only)

| Path | Contents | Guarantee |
|---|---|---|
| `tests/fixtures/synthetic/*.json` | hand-written v1-format backup | `_synthetic: true`, validated by the privacy guard |
| `demo/generated/demo-data.json` | seeded generator output | `_synthetic: true`, byte-reproducible (`npm run demo`), tested |

## Never existing anywhere

Real names, real birth dates, real session logs, real notes, photos, audio,
location, device identifiers, analytics events, server logs.
