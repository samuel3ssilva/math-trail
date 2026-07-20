// Math Trail — persistence layer with explicit data contracts.
// All functions take an injected `store` (localStorage-compatible: getItem/
// setItem/removeItem) so every path is testable with a plain in-memory map.
// Domain code (engine.mjs) never touches this module.
//
// Import policy (documented, tested): payloads are validated FIRST and then
// NORMALIZED to an allowlist of fields — unknown/extra properties never reach
// the store. Values that fail the contract reject the whole import.

import { ACTIVITIES } from './activities.mjs';
import { reconcilePendingSession } from './session.mjs';

export const SCHEMA_VERSION = 2;

export const KEYS = {
  logs: 'mathtrail_logs',
  state: 'mathtrail_state',
  profile: 'mathtrail_profile',
  plan: 'mathtrail_plan',
  active: 'mathtrail_active',
  lang: 'mathtrail_lang',
  rest: 'mathtrail_restdays',
  schema: 'mathtrail_schema',
  preImportSnapshot: 'mathtrail_snapshot_pre_import',
  // A finished-but-unsaved session. Only removed after the log is stored
  // successfully or the parent explicitly discards it (PR review P0).
  pending: 'mathtrail_pending_session'
};

const WINDOWS_SET = new Set(['morning', 'afternoon', 'bedtime']);
const COMPLETIONS = new Set(['full', 'partial', 'refused']);
const ENGAGEMENTS = new Set(['excited', 'neutral', 'resisted']);
const EASES = new Set(['too_easy', 'just_right', 'too_hard']);
const REWARDS = new Set(['intrinsic', 'connection', 'extrinsic']);
const CHAPTERS = new Set([0, 1, 4, 5, 6, 7]);

export const NOTES_MAX_LENGTH = 500;
export const NAME_MAX_LENGTH = 60;
export const MINS_MAX = 1440; // storage accepts up to a day; the UI clamps far lower

/** Safe id: the number the app generates, or a short [A-Za-z0-9_-] string. */
function isSafeId(id){
  if (typeof id === 'number') return Number.isFinite(id);
  if (typeof id === 'string') return /^[A-Za-z0-9_-]{1,64}$/.test(id);
  return false;
}

/**
 * Validate one session log against the v1/v2 contract.
 * Returns a list of problems (empty = valid). Never mutates the input.
 */
export function validateLog(l){
  const problems = [];
  if (!l || typeof l !== 'object' || Array.isArray(l)) return ['not an object'];
  if (!isSafeId(l.id)) problems.push('invalid id');
  if (typeof l.timestamp !== 'string' || !Number.isFinite(Date.parse(l.timestamp))) problems.push('invalid timestamp');
  if (!WINDOWS_SET.has(l.window)) problems.push(`invalid window: ${l.window}`);
  if (typeof l.activity !== 'string' || !(l.activity in ACTIVITIES)) problems.push('unknown activity');
  if (!COMPLETIONS.has(l.completion)) problems.push(`invalid completion: ${l.completion}`);
  if (!ENGAGEMENTS.has(l.engagement)) problems.push(`invalid engagement: ${l.engagement}`);
  if (!EASES.has(l.ease)) problems.push(`invalid ease: ${l.ease}`);
  if (!REWARDS.has(l.reward)) problems.push(`invalid reward: ${l.reward}`);
  if (l.mins !== undefined && (typeof l.mins !== 'number' || !Number.isFinite(l.mins) || l.mins < 0 || l.mins > MINS_MAX)) problems.push('invalid mins');
  if (l.notes !== undefined && (typeof l.notes !== 'string' || l.notes.length > NOTES_MAX_LENGTH)) problems.push('invalid notes');
  return problems;
}

/** Allowlist normalization: only contract fields survive an import. */
export function normalizeLog(l){
  const out = {
    id: l.id, timestamp: l.timestamp, window: l.window, activity: l.activity,
    completion: l.completion, engagement: l.engagement, ease: l.ease, reward: l.reward
  };
  if (typeof l.mins === 'number') out.mins = l.mins;
  if (typeof l.notes === 'string' && l.notes) out.notes = l.notes;
  return out;
}

/**
 * Validate + normalize an imported profile. Textual fields must be plain
 * strings within limits; anything else rejects. Extra fields are dropped.
 * @returns {{ok:true, profile:object}|{ok:false, reason:string}}
 */
export function validateProfile(p){
  if (p === undefined || p === null) return { ok:true, profile:undefined };
  if (typeof p !== 'object' || Array.isArray(p)) return { ok:false, reason:'profile_not_object' };
  const out = {};
  if (p.name !== undefined){
    if (typeof p.name !== 'string' || p.name.length > NAME_MAX_LENGTH) return { ok:false, reason:'invalid_profile_name' };
    out.name = p.name;
  }
  if (p.birth !== undefined){
    if (typeof p.birth !== 'string' || !/^\d{4}-(0[1-9]|1[0-2])$/.test(p.birth)) return { ok:false, reason:'invalid_profile_birth' };
    const year = Number(p.birth.slice(0, 4));
    if (year < 1990 || year > 2100) return { ok:false, reason:'implausible_profile_birth' };
    out.birth = p.birth;
  }
  if (p.chapter !== undefined){
    if (!CHAPTERS.has(Number(p.chapter))) return { ok:false, reason:'invalid_profile_chapter' };
    out.chapter = Number(p.chapter);
  }
  return { ok:true, profile: out };
}

/**
 * Validate a backup payload (v1 export or v2 export).
 * @returns {{ok:true, version:number, logs:object[], profile?:object}
 *          |{ok:false, reason:string}}
 */
export function validateBackup(data){
  if (!data || typeof data !== 'object') return { ok:false, reason:'not_an_object' };
  const version = typeof data.schemaVersion === 'number' ? data.schemaVersion
                : typeof data.version === 'number' ? data.version : null;
  if (version === null) return { ok:false, reason:'missing_version' };
  if (version > SCHEMA_VERSION) return { ok:false, reason:'future_version' };
  if (!Array.isArray(data.logs)) return { ok:false, reason:'missing_logs' };
  const bad = data.logs.map((l,i)=>({ i, problems: validateLog(l) })).filter(x=>x.problems.length);
  if (bad.length) return { ok:false, reason:'invalid_logs', details: bad.slice(0,5) };
  const prof = validateProfile(data.profile);
  if (!prof.ok) return prof;
  return { ok:true, version, logs: data.logs.map(normalizeLog), profile: prof.profile };
}

function readJSON(store, key, fallback){
  try {
    const raw = store.getItem(key);
    return raw === null || raw === undefined ? fallback : JSON.parse(raw);
  } catch { return fallback; }
}

/**
 * Create a repository bound to a store. All reads are defensive;
 * all writes are plain JSON under the KEYS above.
 */
export function makeRepo(store){
  return {
    getLogs(){ const v = readJSON(store, KEYS.logs, []); return Array.isArray(v) ? v : []; },
    saveLogs(logs){ store.setItem(KEYS.logs, JSON.stringify(logs)); },
    getStateRaw(){ return readJSON(store, KEYS.state, null); },
    saveState(s){ store.setItem(KEYS.state, JSON.stringify(s)); },
    getProfile(defaults){ return Object.assign({}, defaults, readJSON(store, KEYS.profile, {}) || {}); },
    saveProfile(p){ store.setItem(KEYS.profile, JSON.stringify(p)); },
    getPlan(){ return readJSON(store, KEYS.plan, {}) || {}; },
    savePlan(p){ store.setItem(KEYS.plan, JSON.stringify(p)); },
    getActive(){ return readJSON(store, KEYS.active, null); },
    setActive(a){ a ? store.setItem(KEYS.active, JSON.stringify(a)) : store.removeItem(KEYS.active); },
    getPending(){ return readJSON(store, KEYS.pending, null); },
    setPending(p){ p ? store.setItem(KEYS.pending, JSON.stringify(p)) : store.removeItem(KEYS.pending); },
    getRestDays(){ const v = readJSON(store, KEYS.rest, []); return Array.isArray(v) ? v : []; },
    saveRestDays(days){ store.setItem(KEYS.rest, JSON.stringify(days)); },
    getLang(){ return store.getItem(KEYS.lang) || null; },
    saveLang(l){ store.setItem(KEYS.lang, l); }
  };
}

/**
 * Build an export payload (always current schema version).
 * Pending-session policy (documented): a finished-but-unsaved session IS
 * included in the export (`pendingSession`) so no capture is ever lost;
 * imports never touch the device's own pending session (see importBackup).
 */
export function buildExport(repo, { now, appId = 'math-trail' }){
  return {
    app: appId,
    schemaVersion: SCHEMA_VERSION,
    exportedAt: now.toISOString(),
    profile: repo.getProfile({}),
    state: repo.getStateRaw(),
    logs: repo.getLogs(),
    pendingSession: repo.getPending() || undefined
  };
}

/**
 * Append one freshly saved session log — the ONLY path that may consume the
 * pending session, and only after the write succeeds. On failure the previous
 * logs value and the pending session are both preserved.
 *
 * @param {Storage} store
 * @param {object} entry the validated log entry to append
 * @param {{nextState:object}} opts precomputed adaptive state after this log
 * @returns {{ok:true}|{ok:false, reason:'write_failed'}}
 */
export function appendLog(store, entry, { nextState }){
  const repo = makeRepo(store);
  // Snapshot all THREE values this function touches. Restoring only the logs
  // left a failure between the state write and the pending removal with a
  // state that referenced a log no longer present — silent drift.
  const before = {
    [KEYS.logs]: store.getItem(KEYS.logs),
    [KEYS.state]: store.getItem(KEYS.state),
    [KEYS.pending]: store.getItem(KEYS.pending)
  };
  const logs = repo.getLogs();
  logs.push(entry);
  try {
    repo.saveLogs(logs);
    repo.saveState(nextState);
    store.removeItem(KEYS.pending); // consumed only after a successful save
    return { ok:true };
  } catch (err) {
    // Best-effort restore: localStorage gives us no transaction, so we put the
    // three values back one by one and report honestly if any put-back fails.
    const failed = [];
    for (const [key, value] of Object.entries(before)){
      try { value === null ? store.removeItem(key) : store.setItem(key, value); }
      catch { failed.push(key); }
    }
    return failed.length
      ? { ok:false, reason:'write_failed', restored:false, rollbackFailed: failed }
      : { ok:false, reason:'write_failed', restored:true };
  }
}

/**
 * Import a backup with full safety rails:
 *   1. validate before touching anything;
 *   2. snapshot current data to KEYS.preImportSnapshot;
 *   3. write new data; on ANY failure, restore the snapshot.
 * `replay` is injected (engine.replayState) to keep this module engine-free.
 *
 * Pending-session policy (PR review P0-2). Exports carry `pendingSession`, so
 * imports must say what happens to it — silently dropping it loses a capture:
 *   - backup has none                     → nothing changes;
 *   - backup has one, device has none     → it is restored;
 *   - backup has one, device has one too  → the DEVICE's copy is kept and the
 *     import reports the conflict, because the unsaved capture in front of the
 *     parent is not automatically less current than the one in the file;
 *   - backup's copy is malformed          → reported, never written.
 * The outcome is always returned in `pending` so the caller can tell the
 * parent what happened.
 *
 * @returns {{ok:true, imported:number, pending:{action:string, reason?:string}}
 *          |{ok:false, reason:string, restored?:boolean}}
 */
export function importBackup(store, data, { replay }){
  const check = validateBackup(data);
  if (!check.ok) return check;

  const repo = makeRepo(store);
  const reconciled = reconcilePendingSession(data.pendingSession, repo.getPending());

  const snapshot = {
    logs: store.getItem(KEYS.logs), state: store.getItem(KEYS.state),
    profile: store.getItem(KEYS.profile), schema: store.getItem(KEYS.schema),
    pending: store.getItem(KEYS.pending)
  };
  store.setItem(KEYS.preImportSnapshot, JSON.stringify(snapshot));

  try {
    repo.saveLogs(check.logs);
    if (check.profile) repo.saveProfile(check.profile);
    repo.saveState(replay(check.logs));
    store.setItem(KEYS.schema, String(SCHEMA_VERSION));
    // Only the 'restore' branch writes a pending session; a conflict keeps the
    // device's copy untouched and is reported back to the caller.
    if (reconciled.action === 'restore') repo.setPending(reconciled.pending);
    return { ok:true, imported: check.logs.length,
             pending: { action: reconciled.action, reason: reconciled.reason } };
  } catch (err) {
    for (const [k, key] of [['logs',KEYS.logs],['state',KEYS.state],['profile',KEYS.profile],
                            ['schema',KEYS.schema],['pending',KEYS.pending]]){
      snapshot[k] === null || snapshot[k] === undefined ? store.removeItem(key) : store.setItem(key, snapshot[k]);
    }
    return { ok:false, reason:'write_failed', restored:true };
  }
}

/**
 * In-place schema migration for data already in the store.
 * v1 stored a bare logs array and no schema marker; v2 adds the marker.
 * Values are copied VERBATIM — no field mapping on the way in
 * (see docs/decisions.md §5 and docs/case-study.md for why).
 *
 * @returns {{from:number, to:number, migrated:boolean}}
 */
export function migrateStore(store){
  const current = Number(store.getItem(KEYS.schema)) || null;
  if (current === SCHEMA_VERSION) return { from: current, to: SCHEMA_VERSION, migrated:false };
  // v1 → v2: same keys, same shapes; just stamp the schema marker.
  store.setItem(KEYS.schema, String(SCHEMA_VERSION));
  return { from: current || 1, to: SCHEMA_VERSION, migrated:true };
}
