// Math Trail — persistence layer with explicit data contracts.
// All functions take an injected `store` (localStorage-compatible: getItem/
// setItem/removeItem) so every path is testable with a plain in-memory map.
// Domain code (engine.mjs) never touches this module.

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
  preImportSnapshot: 'mathtrail_snapshot_pre_import'
};

const WINDOWS_SET = new Set(['morning', 'afternoon', 'bedtime']);
const COMPLETIONS = new Set(['full', 'partial', 'refused']);
const ENGAGEMENTS = new Set(['excited', 'neutral', 'resisted']);
const EASES = new Set(['too_easy', 'just_right', 'too_hard']);
const REWARDS = new Set(['intrinsic', 'connection', 'extrinsic']);

/**
 * Validate one session log against the v1/v2 contract.
 * Returns a list of problems (empty = valid). Never mutates the input.
 */
export function validateLog(l){
  const problems = [];
  if (!l || typeof l !== 'object') return ['not an object'];
  if (l.id === undefined || l.id === null) problems.push('missing id');
  if (typeof l.timestamp !== 'string' || Number.isNaN(Date.parse(l.timestamp))) problems.push('invalid timestamp');
  if (!WINDOWS_SET.has(l.window)) problems.push(`invalid window: ${l.window}`);
  if (typeof l.activity !== 'string' || !l.activity) problems.push('missing activity');
  if (!COMPLETIONS.has(l.completion)) problems.push(`invalid completion: ${l.completion}`);
  if (!ENGAGEMENTS.has(l.engagement)) problems.push(`invalid engagement: ${l.engagement}`);
  if (!EASES.has(l.ease)) problems.push(`invalid ease: ${l.ease}`);
  if (!REWARDS.has(l.reward)) problems.push(`invalid reward: ${l.reward}`);
  if (l.mins !== undefined && (typeof l.mins !== 'number' || l.mins < 0)) problems.push('invalid mins');
  return problems;
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
  return { ok:true, version, logs:data.logs, profile:data.profile };
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
    getRestDays(){ const v = readJSON(store, KEYS.rest, []); return Array.isArray(v) ? v : []; },
    saveRestDays(days){ store.setItem(KEYS.rest, JSON.stringify(days)); },
    getLang(){ return store.getItem(KEYS.lang) || null; },
    saveLang(l){ store.setItem(KEYS.lang, l); }
  };
}

/**
 * Build an export payload (always current schema version).
 */
export function buildExport(repo, { now, appId = 'math-trail' }){
  return {
    app: appId,
    schemaVersion: SCHEMA_VERSION,
    exportedAt: now.toISOString(),
    profile: repo.getProfile({}),
    state: repo.getStateRaw(),
    logs: repo.getLogs()
  };
}

/**
 * Import a backup with full safety rails:
 *   1. validate before touching anything;
 *   2. snapshot current data to KEYS.preImportSnapshot;
 *   3. write new data; on ANY failure, restore the snapshot.
 * `replay` is injected (engine.replayState) to keep this module engine-free.
 *
 * @returns {{ok:true, imported:number}
 *          |{ok:false, reason:string, restored?:boolean}}
 */
export function importBackup(store, data, { replay }){
  const check = validateBackup(data);
  if (!check.ok) return check;

  const repo = makeRepo(store);
  const snapshot = {
    logs: store.getItem(KEYS.logs), state: store.getItem(KEYS.state),
    profile: store.getItem(KEYS.profile), schema: store.getItem(KEYS.schema)
  };
  store.setItem(KEYS.preImportSnapshot, JSON.stringify(snapshot));

  try {
    repo.saveLogs(check.logs);
    if (check.profile) repo.saveProfile(check.profile);
    repo.saveState(replay(check.logs));
    store.setItem(KEYS.schema, String(SCHEMA_VERSION));
    return { ok:true, imported: check.logs.length };
  } catch (err) {
    for (const [k, key] of [['logs',KEYS.logs],['state',KEYS.state],['profile',KEYS.profile],['schema',KEYS.schema]]){
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
