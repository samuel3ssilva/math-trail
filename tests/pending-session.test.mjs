// Pending session — a finished-but-unsaved capture must survive anything
// except an explicit save or an explicit, confirmed discard (PR review P0).
// All tests run the real storage functions against an in-memory store.
import test from 'node:test';
import assert from 'node:assert/strict';

import { makeRepo, appendLog, importBackup, migrateStore, buildExport, KEYS } from '../js/storage.mjs';
import { finishSession } from '../js/time.mjs';
import { replayState } from '../js/engine.mjs';

function memStore(init = {}){
  const m = new Map(Object.entries(init));
  return {
    getItem: k => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: k => m.delete(k),
    dump: () => Object.fromEntries(m)
  };
}

const ACTIVE = { window: 'bedtime', activity: 'dino_flash', startedAt: '2026-07-20T22:30:00.000Z' };
const validEntry = (over = {}) => ({
  id: 1753050000000, timestamp: '2026-07-20T22:40:00.000Z', window: 'bedtime',
  activity: 'dino_flash', completion: 'full', engagement: 'excited',
  ease: 'just_right', reward: 'intrinsic', notes: '', ...over
});

// ── finishing ─────────────────────────────────────────────────────────

test('finishSession captures window, activity, both instants and clamped minutes', () => {
  const p = finishSession(ACTIVE, Date.parse('2026-07-20T22:39:30.000Z'));
  assert.deepEqual(p, {
    window: 'bedtime', activity: 'dino_flash',
    startedAt: '2026-07-20T22:30:00.000Z', endedAt: '2026-07-20T22:39:30.000Z',
    mins: 10
  });
});

test('a session crossing local midnight still records its true duration', () => {
  // 23:55 → 00:10 local (UTC−3 ⇒ 02:55Z → 03:10Z)
  const p = finishSession(
    { ...ACTIVE, startedAt: '2026-07-21T02:55:00.000Z' },
    Date.parse('2026-07-21T03:10:00.000Z')
  );
  assert.equal(p.mins, 15);
  assert.equal(p.endedAt, '2026-07-21T03:10:00.000Z');
});

// ── persistence across reload / app update ────────────────────────────

test('finish → reload: the pending session (and its duration) is restored', () => {
  const store = memStore();
  makeRepo(store).setPending(finishSession(ACTIVE, Date.parse('2026-07-20T22:37:00.000Z')));
  // "reload": a brand-new repo over the same underlying store
  const restored = makeRepo(store).getPending();
  assert.equal(restored.mins, 7);
  assert.equal(restored.window, 'bedtime');
  assert.equal(restored.activity, 'dino_flash');
});

test('an app update (schema migration pass) leaves the pending session intact', () => {
  const store = memStore();
  makeRepo(store).setPending(finishSession(ACTIVE, Date.parse('2026-07-20T22:37:00.000Z')));
  migrateStore(store); // what a new version runs at startup
  assert.ok(makeRepo(store).getPending(), 'pending survives the update path');
});

// ── consumption rules ─────────────────────────────────────────────────

test('finish → save: appendLog stores the log and only then clears the pending session', () => {
  const store = memStore();
  const repo = makeRepo(store);
  repo.setPending(finishSession(ACTIVE, Date.parse('2026-07-20T22:37:00.000Z')));
  const entry = validEntry({ mins: 7 });
  const res = appendLog(store, entry, { nextState: replayState([entry]) });
  assert.equal(res.ok, true);
  assert.equal(repo.getLogs().length, 1);
  assert.equal(repo.getLogs()[0].mins, 7);
  assert.equal(repo.getPending(), null, 'consumed only after a successful save');
});

test('finish → write failure: previous logs restored AND pending preserved', () => {
  const store = memStore({ [KEYS.logs]: JSON.stringify([validEntry({ id: 1 })]) });
  const repo = makeRepo(store);
  repo.setPending(finishSession(ACTIVE, Date.parse('2026-07-20T22:37:00.000Z')));
  // store that explodes when logs grow past the quota
  let calls = 0;
  const failing = {
    getItem: k => store.getItem(k),
    removeItem: k => store.removeItem(k),
    setItem: (k, v) => { if (k === KEYS.state) throw new Error('QuotaExceeded'); store.setItem(k, v); }
  };
  const res = appendLog(failing, validEntry({ id: 2 }), { nextState: {} });
  assert.equal(res.ok, false);
  assert.equal(res.reason, 'write_failed');
  assert.equal(repo.getLogs().length, 1, 'previous logs restored');
  assert.ok(repo.getPending(), 'pending session preserved after the failure');
});

// ── rollback of a failed save (PR review P0-3) ────────────────────────
// localStorage offers no transaction. appendLog snapshots the three values it
// touches and puts them back one by one; these tests pin that behaviour and
// nothing stronger.

/**
 * A store whose FIRST write to a given key fails — the realistic shape of a
 * quota error, which rejects the grown value but still accepts the original
 * one being put back. (A store that rejects every write to that key would make
 * the rollback impossible by construction; that case is its own test below.)
 */
function failingOn(store, { throwOnSet, throwOnRemove } = {}){
  let setFailed = false, removeFailed = false;
  return {
    getItem: k => store.getItem(k),
    setItem: (k, v) => {
      if (k === throwOnSet && !setFailed){ setFailed = true; throw new Error('QuotaExceeded'); }
      store.setItem(k, v);
    },
    removeItem: k => {
      if (k === throwOnRemove && !removeFailed){ removeFailed = true; throw new Error('RemoveFailed'); }
      store.removeItem(k);
    }
  };
}

function seeded(){
  const store = memStore({ [KEYS.logs]: JSON.stringify([validEntry({ id: 1 })]) });
  const repo = makeRepo(store);
  repo.saveState({ marker: 'before' });
  repo.setPending(finishSession(ACTIVE, Date.parse('2026-07-20T22:37:00.000Z')));
  return { store, repo };
}

test('a failure writing the logs leaves logs, state and pending exactly as they were', () => {
  const { store, repo } = seeded();
  const res = appendLog(failingOn(store, { throwOnSet: KEYS.logs }), validEntry({ id: 2 }), { nextState: { marker: 'after' } });
  assert.equal(res.ok, false);
  assert.equal(res.restored, true);
  assert.equal(repo.getLogs().length, 1);
  assert.deepEqual(repo.getStateRaw(), { marker: 'before' }, 'state untouched');
  assert.ok(repo.getPending(), 'pending preserved');
});

test('a failure writing the state rolls the logs back too', () => {
  const { store, repo } = seeded();
  const res = appendLog(failingOn(store, { throwOnSet: KEYS.state }), validEntry({ id: 2 }), { nextState: { marker: 'after' } });
  assert.equal(res.ok, false);
  assert.equal(repo.getLogs().length, 1, 'the log that was already written is rolled back');
  assert.deepEqual(repo.getStateRaw(), { marker: 'before' });
  assert.ok(repo.getPending());
});

test('a failure REMOVING the pending session rolls the state back — no drift', () => {
  // The regression this gate exists for: logs and state were already written,
  // then the pending removal failed. Restoring only the logs left a state that
  // referenced a log no longer present.
  const { store, repo } = seeded();
  const res = appendLog(failingOn(store, { throwOnRemove: KEYS.pending }), validEntry({ id: 2 }), { nextState: { marker: 'after' } });
  assert.equal(res.ok, false);
  assert.equal(repo.getLogs().length, 1, 'logs restored');
  assert.deepEqual(repo.getStateRaw(), { marker: 'before' }, 'state restored — this is what used to drift');
  assert.ok(repo.getPending(), 'the capture is still there to be saved again');
});

test('a failure DURING the rollback is reported honestly, not swallowed', () => {
  const { store } = seeded();
  // state write fails, and putting the logs back fails as well
  const doublyBroken = {
    getItem: k => store.getItem(k),
    setItem: (k) => { throw new Error(`cannot write ${k}`); },
    removeItem: k => store.removeItem(k)
  };
  const res = appendLog(doublyBroken, validEntry({ id: 2 }), { nextState: { marker: 'after' } });
  assert.equal(res.ok, false);
  assert.equal(res.restored, false, 'must not claim a rollback that did not happen');
  assert.ok(Array.isArray(res.rollbackFailed) && res.rollbackFailed.length, 'the failed keys are reported');
});

test('a successful save clears the pending session only at the very end', () => {
  const { store, repo } = seeded();
  const res = appendLog(store, validEntry({ id: 2 }), { nextState: { marker: 'after' } });
  assert.equal(res.ok, true);
  assert.equal(repo.getLogs().length, 2);
  assert.deepEqual(repo.getStateRaw(), { marker: 'after' });
  assert.equal(repo.getPending(), null, 'consumed only after both writes succeeded');
});

test('explicit discard removes the pending session', () => {
  const store = memStore();
  const repo = makeRepo(store);
  repo.setPending(finishSession(ACTIVE, Date.now ? finishSessionSafeEnd() : 0));
  repo.setPending(null);
  assert.equal(repo.getPending(), null);
});
function finishSessionSafeEnd(){ return Date.parse('2026-07-20T22:37:00.000Z'); }

test('starting a new session is the app-side guard: pending is visible to check first', () => {
  const store = memStore();
  const repo = makeRepo(store);
  repo.setPending(finishSession(ACTIVE, Date.parse('2026-07-20T22:37:00.000Z')));
  // the app's startSession() checks exactly this before creating a new active session
  assert.ok(repo.getPending(), 'guard condition observable from storage');
  assert.equal(repo.getActive(), null);
});

// ── export / import policy (documented) ───────────────────────────────

test('exports include the pending session; imports never touch it', () => {
  const store = memStore();
  const repo = makeRepo(store);
  const pending = finishSession(ACTIVE, Date.parse('2026-07-20T22:37:00.000Z'));
  repo.setPending(pending);

  const out = buildExport(repo, { now: new Date('2026-07-20T23:00:00.000Z') });
  assert.deepEqual(out.pendingSession, pending, 'nothing captured is ever left out of a backup');

  const res = importBackup(store, { schemaVersion: 2, logs: [validEntry()] }, { replay: replayState });
  assert.equal(res.ok, true);
  assert.deepEqual(repo.getPending(), pending, 'import replaced logs but preserved the device pending session');
});
