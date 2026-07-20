// Local calendar time — the app's "today" must follow the device's LOCAL
// timezone, never UTC. America/Sao_Paulo (UTC-3) is the reference case:
// with the old UTC keys, the date flipped at 21:00 local time.
//
// Timezone-sensitive assertions run in child processes with an explicit TZ,
// because Node caches the process timezone.
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { localDateKey, sessionDayKey, addDays, isSameLocalDay, fmtElapsed } from '../js/time.mjs';

function runWithTZ(tz, expr){
  return execFileSync(process.execPath, [
    '--input-type=module', '-e',
    `import { localDateKey, sessionDayKey, addDays } from '${new URL('../js/time.mjs', import.meta.url).href}';
     console.log(${expr});`
  ], { env: { ...process.env, TZ: tz }, encoding: 'utf8' }).trim();
}

// ── America/Sao_Paulo boundary times (UTC-3, no DST since 2019) ──────

test('São Paulo 20:59 local (23:59Z) is still the SAME local day', () => {
  const out = runWithTZ('America/Sao_Paulo', `localDateKey(new Date('2026-07-19T23:59:00.000Z'))`);
  assert.equal(out, '2026-07-19');
});

test('São Paulo 21:00 local (00:00Z next day in UTC) is STILL the same local day — the exact old bug', () => {
  const out = runWithTZ('America/Sao_Paulo', `localDateKey(new Date('2026-07-20T00:00:00.000Z'))`);
  assert.equal(out, '2026-07-19', 'UTC has flipped to the 20th; local calendar has not');
});

test('São Paulo 23:59 local is the same day; 00:00 local flips it', () => {
  assert.equal(
    runWithTZ('America/Sao_Paulo', `localDateKey(new Date('2026-07-20T02:59:00.000Z'))`),
    '2026-07-19');
  assert.equal(
    runWithTZ('America/Sao_Paulo', `localDateKey(new Date('2026-07-20T03:00:00.000Z'))`),
    '2026-07-20');
});

test('a session logged at 23:50 local belongs to that local day even though UTC says next day', () => {
  const out = runWithTZ('America/Sao_Paulo',
    `sessionDayKey({ timestamp: '2026-07-20T02:50:00.000Z' })`); // 23:50 on the 19th local
  assert.equal(out, '2026-07-19');
});

test('daily-plan key stays stable until local midnight (same key at 08:00 and 23:59 local)', () => {
  const morning = runWithTZ('America/Sao_Paulo', `localDateKey(new Date('2026-07-19T11:00:00.000Z'))`);
  const lateNight = runWithTZ('America/Sao_Paulo', `localDateKey(new Date('2026-07-20T02:59:00.000Z'))`);
  assert.equal(morning, lateNight);
});

test('a timer session that crosses local midnight is grouped by its LOG timestamp day', () => {
  // Started 23:55, saved 00:10 — the log's own timestamp decides the day.
  const savedAt = runWithTZ('America/Sao_Paulo',
    `sessionDayKey({ timestamp: '2026-07-20T03:10:00.000Z' })`); // 00:10 local on the 20th
  assert.equal(savedAt, '2026-07-20');
});

// ── timezone-independent helpers (run in the suite's own TZ) ─────────

test('addDays crosses month boundaries on the local calendar', () => {
  const d = new Date(2026, 6, 31, 15, 0, 0); // July 31 local
  assert.equal(localDateKey(addDays(d, 1)), '2026-08-01');
  assert.equal(localDateKey(addDays(d, -31)), '2026-06-30');
});

test('isSameLocalDay and sessionDayKey agree', () => {
  const a = new Date(2026, 6, 19, 0, 5);
  const b = new Date(2026, 6, 19, 23, 55);
  assert.equal(isSameLocalDay(a, b), true);
  assert.equal(sessionDayKey({ timestamp: a.toISOString() }), localDateKey(b));
});

test('sessionDayKey tolerates missing timestamps', () => {
  assert.equal(sessionDayKey({}), 'unknown');
  assert.equal(sessionDayKey(null), 'unknown');
});

test('fmtElapsed formats with an injected clock', () => {
  const start = '2026-07-19T12:00:00.000Z';
  assert.equal(fmtElapsed(start, new Date('2026-07-19T12:03:07.000Z')), '03:07');
  assert.equal(fmtElapsed(start, new Date('2026-07-19T11:59:00.000Z')), '00:00', 'never negative');
});
