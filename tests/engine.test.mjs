// Math Trail — adaptive engine tests.
// The engine is pure (no DOM, no storage, no wall clock), so every rule is
// tested with plain data and explicit, injected time.
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  defaultState, getLevel, applyLog, replayState, evaluateTemporalRules,
  rewardObservation, milestoneProgress, currentFocus, weightedPick,
  hashStr, mulberry32, scoreActivities, COOLDOWN_HOURS
} from '../js/engine.mjs';
import { ACTIVITIES, MILESTONES, WINDOWS, COMPOSITION_IDS } from '../js/activities.mjs';

const T0 = '2026-03-10T15:00:00.000Z';

const log = (over = {}) => ({
  id: 1, timestamp: T0, window: 'afternoon',
  activity: 'one_more_tower', completion: 'full', engagement: 'neutral',
  ease: 'just_right', reward: 'intrinsic', notes: '', ...over
});

// ── level auto-adjustment ─────────────────────────────────────────────

test('level goes up after two consecutive "too easy" sessions', () => {
  let s = defaultState();
  s = applyLog(s, log({ ease: 'too_easy' }), []);
  assert.equal(getLevel(s, 'one_more_tower'), 1, 'one easy session is not enough');
  s = applyLog(s, log({ ease: 'too_easy' }), [log({ ease: 'too_easy' })]);
  assert.equal(getLevel(s, 'one_more_tower'), 2);
});

test('a "just right" session resets the easy streak', () => {
  let s = defaultState();
  s = applyLog(s, log({ ease: 'too_easy' }), []);
  s = applyLog(s, log({ ease: 'just_right' }), []);
  s = applyLog(s, log({ ease: 'too_easy' }), []);
  assert.equal(getLevel(s, 'one_more_tower'), 1);
});

test('level steps down on "too hard"', () => {
  let s = defaultState();
  s.levels = { one_more_tower: 3 };
  s = applyLog(s, log({ ease: 'too_hard' }), []);
  assert.equal(getLevel(s, 'one_more_tower'), 2);
});

test('activity is mastered at level 3 + two more "too easy"', () => {
  let s = defaultState();
  s.levels = { one_more_tower: 3 };
  s = applyLog(s, log({ ease: 'too_easy' }), []);
  s = applyLog(s, log({ ease: 'too_easy' }), []);
  assert.equal(s.masteredActs.one_more_tower, true);
});

test('"too easy" on a refused session does not count toward the streak', () => {
  let s = defaultState();
  s = applyLog(s, log({ ease: 'too_easy', completion: 'refused' }), []);
  s = applyLog(s, log({ ease: 'too_easy', completion: 'refused' }), []);
  assert.equal(getLevel(s, 'one_more_tower'), 1);
});

// ── story (camouflage) mode ───────────────────────────────────────────

test('story mode activates after 2 resisted sessions within the last 3', () => {
  const resisted = log({ engagement: 'resisted' });
  let s = defaultState();
  s = applyLog(s, resisted, [log(), resisted]);
  assert.equal(s.camouflageActive, true);
  assert.equal(s.camouflageLeft, 3);
});

test('story mode burns down on non-resisted sessions and then deactivates', () => {
  let s = defaultState();
  s.camouflageActive = true; s.camouflageLeft = 1;
  s = applyLog(s, log({ engagement: 'excited' }), []);
  assert.equal(s.camouflageActive, false);
});

// ── part-part-whole cooldown (clock-free apply + temporal evaluation) ─

test('"too hard" at level 1 on a composition activity records a 48h cooldown anchored to the LOG time', () => {
  let s = defaultState();
  s = applyLog(s, log({ activity: 'hidden_dinos', ease: 'too_hard' }), []);
  assert.equal(s.cooldownActive, true);
  const hours = (new Date(s.cooldownUntil) - new Date(T0)) / 3600000;
  assert.equal(Math.round(hours), COOLDOWN_HOURS);
});

test('a log without a timestamp cannot start a cooldown (documented limitation)', () => {
  let s = defaultState();
  s = applyLog(s, log({ activity: 'hidden_dinos', ease: 'too_hard', timestamp: undefined }), []);
  assert.equal(s.cooldownActive, false);
});

test('evaluateTemporalRules keeps the cooldown BEFORE expiry and lifts it AFTER', () => {
  const s = applyLog(defaultState(), log({ activity: 'hidden_dinos', ease: 'too_hard' }), []);
  const before = evaluateTemporalRules(s, new Date('2026-03-12T14:59:00.000Z')); // 47h59m later
  assert.equal(before.cooldownActive, true);
  const after = evaluateTemporalRules(s, new Date('2026-03-12T15:01:00.000Z')); // 48h01m later
  assert.equal(after.cooldownActive, false);
  assert.equal(after.cooldownUntil, null);
  assert.equal(s.cooldownActive, true, 'input state is never mutated');
});

test('replay is clock-free: an old cooldown survives replay and only expires at evaluation time', () => {
  // The cooldown below expired years before "today" — replay must still record it,
  // because expiry is a temporal rule, not part of history.
  const logs = [log({ activity: 'hidden_dinos', ease: 'too_hard', timestamp: '2020-01-01T10:00:00.000Z' })];
  const hist = replayState(logs);
  assert.equal(hist.cooldownActive, true, 'historical state keeps the cooldown');
  const now = evaluateTemporalRules(hist, new Date('2026-07-20T10:00:00.000Z'));
  assert.equal(now.cooldownActive, false, 'effective state expires it');
});

test('same logs replayed "on different days" produce identical historical state', () => {
  const logs = [
    log({ ease: 'too_easy' }),
    log({ ease: 'too_easy', timestamp: '2026-03-11T09:00:00.000Z' }),
    log({ activity: 'hidden_dinos', ease: 'too_hard', timestamp: '2026-03-12T20:00:00.000Z' }),
    log({ engagement: 'resisted', timestamp: '2026-03-13T20:00:00.000Z' }),
    log({ engagement: 'resisted', timestamp: '2026-03-14T20:00:00.000Z' })
  ];
  // replayState takes no clock — these calls simulate runs on different days,
  // and the results must be byte-identical (the real guarantee, not two calls
  // in the same instant).
  const runMonday = replayState(structuredClone(logs));
  const runFridayNight = replayState(structuredClone(logs));
  assert.deepEqual(runMonday, runFridayNight);
  // and consistent with the incremental fold:
  let inc = defaultState();
  logs.forEach((l, i) => { inc = applyLog(inc, l, logs.slice(0, i)); });
  assert.deepEqual(runMonday, inc);
});

// ── Two-Dice Count-On unlock rule (docs/adr/0001) ─────────────────────

test('Given level 3 not mastered, When ONE session is "too easy", Then Two-Dice stays locked', () => {
  let s = defaultState();
  s.levels = { dice_flash: 3 };
  s = applyLog(s, log({ activity: 'dice_flash', ease: 'too_easy' }), []);
  assert.equal(s.diceMastered, false);
  const scored = scoreActivities({
    pool: [...WINDOWS.afternoon.pool], state: s, logs: [],
    profile: { chapter: 0 }, doneToday: new Set()
  });
  assert.ok(scored.every(x => x.id !== 'two_dice_counton'));
});

test('When a SECOND consecutive valid "too easy" lands, Then Two-Dice unlocks', () => {
  let s = defaultState();
  s.levels = { dice_flash: 3 };
  s = applyLog(s, log({ activity: 'dice_flash', ease: 'too_easy' }), []);
  s = applyLog(s, log({ activity: 'dice_flash', ease: 'too_easy' }), []);
  assert.equal(s.masteredActs.dice_flash, true);
  assert.equal(s.diceMastered, true);
});

test('non-consecutive "too easy" ratings do NOT unlock (streak resets in between)', () => {
  let s = defaultState();
  s.levels = { dice_flash: 3 };
  s = applyLog(s, log({ activity: 'dice_flash', ease: 'too_easy' }), []);
  s = applyLog(s, log({ activity: 'dice_flash', ease: 'just_right' }), []);
  s = applyLog(s, log({ activity: 'dice_flash', ease: 'too_easy' }), []);
  assert.equal(s.diceMastered, false);
});

test('a refused "too easy" session does not count toward the unlock', () => {
  let s = defaultState();
  s.levels = { dice_flash: 3 };
  s = applyLog(s, log({ activity: 'dice_flash', ease: 'too_easy', completion: 'refused' }), []);
  s = applyLog(s, log({ activity: 'dice_flash', ease: 'too_easy' }), []);
  assert.equal(s.diceMastered, false, 'only one VALID too-easy so far');
});

// ── cooldown & pool interaction ───────────────────────────────────────

test('cooldown removes composition activities from the suggestion pool', () => {
  const state = { ...defaultState(), cooldownActive: true, cooldownUntil: '2099-01-01' };
  const scored = scoreActivities({
    pool: [...WINDOWS.afternoon.pool], state, logs: [],
    profile: { chapter: 0 }, doneToday: new Set()
  });
  assert.ok(scored.length > 0);
  assert.ok(scored.every(x => !COMPOSITION_IDS.includes(x.id)));
});

// ── milestones ────────────────────────────────────────────────────────

test('milestone counts only full sessions that were not too hard', () => {
  const m = MILESTONES.find(x => x.id === 'oml');
  const logs = [
    log({ completion: 'full', ease: 'just_right' }),
    log({ completion: 'partial' }),
    log({ completion: 'full', ease: 'too_hard' })
  ];
  const p = milestoneProgress(m, logs);
  assert.equal(p.good, 1);
  assert.equal(p.sessions, 3);
});

test('currentFocus returns the first unfinished milestone', () => {
  const focus = currentFocus([]);
  assert.equal(focus.id, 'count10', 'pre-completed starting points are skipped');
});

// ── seeded randomness ─────────────────────────────────────────────────

test('weightedPick is deterministic under a seeded RNG', () => {
  const scored = [{ id: 'a', score: 1 }, { id: 'b', score: 5 }, { id: 'c', score: 2 }];
  const pick1 = weightedPick(scored, mulberry32(hashStr('2026-07-19|morning')));
  const pick2 = weightedPick(scored, mulberry32(hashStr('2026-07-19|morning')));
  assert.equal(pick1.id, pick2.id);
});
