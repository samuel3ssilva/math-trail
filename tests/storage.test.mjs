// Storage layer — data contracts, REAL migration/import functions, rollback.
// Every test runs the actual production functions against an in-memory store;
// nothing is loaded "directly into the engine" bypassing validation.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { validateLog, validateBackup, importBackup, migrateStore, makeRepo,
         buildExport, normalizeLog, SCHEMA_VERSION, KEYS } from '../js/storage.mjs';
import { replayState, getLevel } from '../js/engine.mjs';

const dir = dirname(fileURLToPath(import.meta.url));
const FIXTURE = JSON.parse(readFileSync(join(dir, 'fixtures', 'synthetic', 'v1-backup.synthetic.json'), 'utf8'));

/** Minimal localStorage-compatible in-memory store. */
function memStore(init = {}){
  const m = new Map(Object.entries(init));
  return {
    getItem: k => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: k => m.delete(k),
    get size(){ return m.size; },
    dump: () => Object.fromEntries(m)
  };
}

// ── contracts ─────────────────────────────────────────────────────────

test('fixture is explicitly synthetic and valid under the backup contract', () => {
  assert.equal(FIXTURE._synthetic, true, 'synthetic marker required on committed fixtures');
  const check = validateBackup(FIXTURE);
  assert.equal(check.ok, true);
  assert.equal(check.version, 1);
});

test('validateLog reports every broken field', () => {
  const problems = validateLog({ id: 1, timestamp: 'not-a-date', window: 'noon',
    activity: '', completion: 'meh', engagement: 'excited', ease: 'just_right', reward: 'intrinsic' });
  assert.ok(problems.some(p => p.includes('timestamp')));
  assert.ok(problems.some(p => p.includes('window')));
  assert.ok(problems.some(p => p.includes('activity')));
  assert.ok(problems.some(p => p.includes('completion')));
});

test('backups from an unknown FUTURE schema version are rejected, not guessed at', () => {
  const res = validateBackup({ schemaVersion: SCHEMA_VERSION + 1, logs: [] });
  assert.deepEqual(res, { ok: false, reason: 'future_version' });
});

test('backups without a version or without logs are rejected', () => {
  assert.equal(validateBackup({ logs: [] }).reason, 'missing_version');
  assert.equal(validateBackup({ version: 1 }).reason, 'missing_logs');
  assert.equal(validateBackup('garbage').reason, 'not_an_object');
});

// ── real import: success path ─────────────────────────────────────────

test('importing the synthetic v1 backup: zero loss, zero duplication, all fields preserved', () => {
  const store = memStore();
  const res = importBackup(store, FIXTURE, { replay: replayState });
  assert.equal(res.ok, true);
  assert.equal(res.imported, 5);

  const repo = makeRepo(store);
  const logs = repo.getLogs();
  assert.equal(logs.length, 5, 'no loss, no duplication');
  // Contract fields preserved exactly; unknown/extra fields dropped by the
  // documented allowlist normalization (empty notes carry no data).
  assert.deepEqual(logs, FIXTURE.logs.map(normalizeLog));
  assert.equal(logs[0].timestamp, FIXTURE.logs[0].timestamp, 'dates are never re-stamped');
  assert.ok(logs.every((l, i) => l.window === FIXTURE.logs[i].window), 'windows preserved');
  assert.ok(logs.every((l, i) => l.ease === FIXTURE.logs[i].ease), 'ratings preserved');
  const withNotes = FIXTURE.logs.filter(l => l.notes);
  assert.ok(withNotes.length > 0, 'fixture exercises notes');
  for (const src of withNotes){
    assert.ok(logs.some(l => l.notes === src.notes), 'non-empty notes preserved verbatim');
  }

  // the engine replays the imported history correctly
  const state = repo.getStateRaw();
  assert.equal(getLevel(state, 'dice_flash'), 3, 'two too-easy dice sessions → level 3');
  assert.equal(store.getItem(KEYS.schema), String(SCHEMA_VERSION));
});

test('import snapshots the previous data before writing', () => {
  const store = memStore({ [KEYS.logs]: JSON.stringify([{ old: true }]) });
  importBackup(store, FIXTURE, { replay: replayState });
  const snap = JSON.parse(store.getItem(KEYS.preImportSnapshot));
  assert.equal(snap.logs, JSON.stringify([{ old: true }]), 'pre-import data is recoverable');
});

// ── real import: failure paths ────────────────────────────────────────

test('invalid backup leaves the store completely untouched', () => {
  const store = memStore({ [KEYS.logs]: JSON.stringify([{ mine: 1 }]) });
  const before = JSON.stringify(store.dump());
  const res = importBackup(store, { version: 1, logs: [{ broken: true }] }, { replay: replayState });
  assert.equal(res.ok, false);
  assert.equal(res.reason, 'invalid_logs');
  assert.equal(JSON.stringify(store.dump()), before, 'nothing changed');
});

test('a mid-write failure rolls the store back to the pre-import state', () => {
  const original = JSON.stringify([{ id: 9, timestamp: '2026-01-01T10:00:00.000Z', window: 'morning',
    activity: 'dice_flash', completion: 'full', engagement: 'excited', ease: 'just_right', reward: 'intrinsic' }]);
  const store = memStore({ [KEYS.logs]: original, [KEYS.profile]: '{"name":""}' });
  const explodingReplay = () => { throw new Error('boom'); };
  const res = importBackup(store, FIXTURE, { replay: explodingReplay });
  assert.equal(res.ok, false);
  assert.equal(res.reason, 'write_failed');
  assert.equal(res.restored, true);
  assert.equal(store.getItem(KEYS.logs), original, 'previous sessions recovered after partial failure');
});

// ── in-place store migration ──────────────────────────────────────────

test('migrateStore stamps the schema version without touching values (verbatim-or-nothing)', () => {
  const rawLogs = JSON.stringify(FIXTURE.logs);
  const store = memStore({ [KEYS.logs]: rawLogs });
  const res = migrateStore(store);
  assert.deepEqual(res, { from: 1, to: SCHEMA_VERSION, migrated: true });
  assert.equal(store.getItem(KEYS.logs), rawLogs, 'byte-identical after migration');
  assert.deepEqual(migrateStore(store), { from: SCHEMA_VERSION, to: SCHEMA_VERSION, migrated: false }, 'idempotent');
});

// ── export ────────────────────────────────────────────────────────────

test('exports always carry the current schema version and an injected clock', () => {
  const store = memStore();
  importBackup(store, FIXTURE, { replay: replayState });
  const out = buildExport(makeRepo(store), { now: new Date('2026-07-20T12:00:00.000Z') });
  assert.equal(out.schemaVersion, SCHEMA_VERSION);
  assert.equal(out.exportedAt, '2026-07-20T12:00:00.000Z');
  assert.equal(out.logs.length, 5);
  // round-trip: an export is always importable
  const store2 = memStore();
  assert.equal(importBackup(store2, out, { replay: replayState }).ok, true);
});

// ── repo defensive reads ──────────────────────────────────────────────

test('repo tolerates corrupted JSON in the store without throwing', () => {
  const store = memStore({ [KEYS.logs]: '{not json', [KEYS.profile]: 'pt', [KEYS.plan]: '42' });
  const repo = makeRepo(store);
  assert.deepEqual(repo.getLogs(), []);
  assert.deepEqual(repo.getProfile({ name: '' }), { name: '' });
});
