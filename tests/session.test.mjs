// Pending-session controller — the decisions the UI delegates to pure code.
// These are the SAME functions js/app.mjs calls (saveLog, startSession,
// restorePendingIntoForm, discardPendingSession), so passing here says
// something about the app, not about a parallel implementation.
//
// Honest scope: this is a controller test, NOT a browser reload test. It proves
// the decision layer; the DOM wiring around it is verified in a real browser
// and recorded in the PR.
import test from 'node:test';
import assert from 'node:assert/strict';
import { logTimestampFor, pendingRestore, canStartSession, discardPending,
         validatePendingSession, reconcilePendingSession, promotedWindow } from '../js/session.mjs';
import { windowForHour } from '../js/time.mjs';
import { localDateKey } from '../js/time.mjs';

const pending = (over = {}) => Object.assign({
  window: 'bedtime', activity: 'dino_flash',
  startedAt: '2026-03-10T23:40:00.000Z', endedAt: '2026-03-10T23:50:00.000Z', mins: 10
}, over);

// ── P0-1: the log carries the instant the session ENDED ───────────────

test('a pending session saved immediately keeps its own end instant', () => {
  const p = pending();
  const saved = logTimestampFor(p, new Date('2026-03-10T23:50:04.000Z'));
  assert.equal(saved, p.endedAt);
});

test('a pending session saved hours later still keeps its end instant', () => {
  const p = pending();
  const saved = logTimestampFor(p, new Date('2026-03-11T09:15:00.000Z'));
  assert.equal(saved, p.endedAt, 'the save time must not leak into the log');
});

test('a session ended before midnight and saved after it stays on the day it happened', () => {
  // 20:50 in Sao Paulo (UTC-3) on the 10th, saved 00:10 on the 11th.
  const p = pending({ startedAt: '2026-03-10T23:40:00.000Z', endedAt: '2026-03-10T23:50:00.000Z' });
  const stamp = logTimestampFor(p, new Date('2026-03-11T03:10:00.000Z'));
  const dayOfSession = localDateKey(new Date(stamp));
  const dayOfSaving = localDateKey(new Date('2026-03-11T03:10:00.000Z'));
  assert.equal(dayOfSession, '2026-03-10', 'history must group it under the day it happened');
  assert.notEqual(dayOfSession, dayOfSaving, 'saving crossed midnight — the days must differ');
});

test('a manual entry with no pending session uses the injected clock, never a real one', () => {
  const stamp = logTimestampFor(null, new Date('2026-05-02T14:00:00.000Z'));
  assert.equal(stamp, '2026-05-02T14:00:00.000Z');
});

test('a pending session with an unusable endedAt falls back to the injected clock', () => {
  for (const bad of [undefined, null, 'not-a-date', 42, {}]){
    const stamp = logTimestampFor(pending({ endedAt: bad }), new Date('2026-05-02T14:00:00.000Z'));
    assert.equal(stamp, '2026-05-02T14:00:00.000Z', `endedAt=${JSON.stringify(bad)}`);
  }
});

// ── P1-1: the decisions the screen makes ──────────────────────────────

test('start-up with a pending session selects the log tab and restores window, activity and duration', () => {
  const r = pendingRestore(pending());
  assert.equal(r.tab, 'log');
  assert.equal(r.window, 'bedtime');
  assert.equal(r.activity, 'dino_flash');
  assert.equal(r.mins, 10);
  assert.equal(r.notice, true, 'the "still to save" notice must stay visible');
});

test('start-up with no pending session restores nothing', () => {
  assert.equal(pendingRestore(null), null);
  assert.equal(pendingRestore(undefined), null);
});

test('a pending session without minutes still restores, just without a duration', () => {
  const r = pendingRestore(pending({ mins: undefined }));
  assert.equal(r.mins, undefined);
  assert.equal(r.notice, true);
});

test('a new session is blocked while a capture is waiting to be saved', () => {
  const blocked = canStartSession(pending());
  assert.equal(blocked.ok, false);
  assert.equal(blocked.reason, 'pending_unsaved');
  assert.equal(canStartSession(null).ok, true);
});

test('discarding requires an explicit confirmation', () => {
  assert.deepEqual(discardPending(false), { ok:false, reason:'not_confirmed', clear:false });
  assert.deepEqual(discardPending(true), { ok:true, clear:true });
});

// ── P0-2: validation of a pending session arriving in a backup ─────────

test('a well-formed pending session validates and normalizes to the allowlist', () => {
  const r = validatePendingSession(pending());
  assert.equal(r.ok, true);
  assert.deepEqual(Object.keys(r.pending).sort(),
    ['activity','endedAt','mins','startedAt','window']);
});

test('unknown activities and windows are rejected', () => {
  assert.equal(validatePendingSession(pending({ activity: 'not_a_real_activity' })).reason, 'pending_unknown_activity');
  assert.equal(validatePendingSession(pending({ window: 'midnight' })).reason, 'pending_invalid_window');
});

test('invalid timestamps are rejected, including an end before the start', () => {
  assert.equal(validatePendingSession(pending({ startedAt: 'nope' })).reason, 'pending_invalid_startedAt');
  assert.equal(validatePendingSession(pending({ endedAt: 'nope' })).reason, 'pending_invalid_endedAt');
  assert.equal(validatePendingSession(pending({ endedAt: '2026-03-10T23:00:00.000Z' })).reason, 'pending_ends_before_start');
});

test('non-finite, negative and oversized minutes are rejected', () => {
  for (const bad of [NaN, Infinity, -1, 1441, '10', null]){
    assert.equal(validatePendingSession(pending({ mins: bad })).ok, false, `mins=${String(bad)}`);
  }
});

test('non-objects and arrays are rejected', () => {
  for (const bad of [null, undefined, 'x', 7, []]){
    assert.equal(validatePendingSession(bad).ok, false, String(bad));
  }
});

test('extra fields and __proto__ tricks never survive normalization', () => {
  const hostile = JSON.parse(`{
    "window":"bedtime","activity":"dino_flash",
    "startedAt":"2026-03-10T23:40:00.000Z","endedAt":"2026-03-10T23:50:00.000Z","mins":10,
    "evil":"<img src=x onerror=alert(1)>","__proto__":{"polluted":true}
  }`);
  const r = validatePendingSession(hostile);
  assert.equal(r.ok, true);
  assert.equal(r.pending.evil, undefined, 'extra field must be dropped');
  assert.equal({}.polluted, undefined, 'Object.prototype must be untouched');
  assert.equal(Object.getPrototypeOf(r.pending), Object.prototype);
});

// ── P0-2: reconciling backup vs device ────────────────────────────────

test('a backup with no pending session changes nothing', () => {
  assert.deepEqual(reconcilePendingSession(undefined, null), { action:'none' });
  assert.deepEqual(reconcilePendingSession(undefined, pending()), { action:'none' });
});

test('a valid backup pending session is restored when the device has none', () => {
  const r = reconcilePendingSession(pending(), null);
  assert.equal(r.action, 'restore');
  assert.equal(r.pending.activity, 'dino_flash');
});

test('the device keeps its own pending session and the conflict is reported, never silent', () => {
  const local = pending({ activity: 'five_frame' });
  const r = reconcilePendingSession(pending(), local);
  assert.equal(r.action, 'conflict');
  assert.equal(r.reason, 'local_pending_kept');
  assert.ok(r.pending, 'the backup copy is surfaced so the parent can decide');
});

test('an invalid pending session in a backup is reported, not silently dropped', () => {
  const r = reconcilePendingSession(pending({ activity: 'ghost' }), null);
  assert.equal(r.action, 'reject');
  assert.equal(r.reason, 'pending_unknown_activity');
});

// ── which window the plan gives visual weight to (visual-polish round) ──
// Emphasis only: every window keeps its suggestion and its actions.

test('the clock maps to the window a parent would be living in', () => {
  assert.equal(windowForHour(7), 'morning');
  assert.equal(windowForHour(11), 'morning');
  assert.equal(windowForHour(12), 'afternoon');
  assert.equal(windowForHour(17), 'afternoon');
  assert.equal(windowForHour(20), 'bedtime');
  assert.equal(windowForHour(2), 'bedtime', 'the small hours still belong to bedtime');
});

test('the promoted window is the one the clock is in', () => {
  assert.equal(promotedWindow(9, []), 'morning');
  assert.equal(promotedWindow(14, []), 'afternoon');
  assert.equal(promotedWindow(21, []), 'bedtime');
});

test('a window already done today hands the emphasis to the next one still open', () => {
  assert.equal(promotedWindow(9, ['morning']), 'afternoon');
  assert.equal(promotedWindow(9, ['morning', 'afternoon']), 'bedtime');
  assert.equal(promotedWindow(14, ['afternoon']), 'bedtime');
});

test('the search wraps around rather than falling off the end of the day', () => {
  assert.equal(promotedWindow(21, ['bedtime']), 'morning');
});

test('with every window done the clock keeps the emphasis — nothing is hidden', () => {
  assert.equal(promotedWindow(14, ['morning', 'afternoon', 'bedtime']), 'afternoon');
});
