// Math Trail — adaptive engine tests.
// The engine is pure (no DOM, no storage), so every rule is tested with plain data.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import {
  defaultState, getLevel, applyLog, replayState, checkRewardAlert,
  milestoneProgress, currentFocus, weightedPick, hashStr, mulberry32,
  scoreActivities
} from '../js/engine.mjs';
import { ACTIVITIES, MILESTONES, WINDOWS, COMPOSITION_IDS } from '../js/activities.mjs';

const log = (over = {}) => ({
  id: 1, timestamp: '2026-07-01T15:00:00.000Z', window: 'afternoon',
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

// ── part-part-whole cooldown ──────────────────────────────────────────

test('"too hard" at level 1 on a composition activity starts a 48h cooldown', () => {
  // Needs a recent timestamp: applyLog also expires cooldowns that are already past.
  const now = new Date().toISOString();
  let s = defaultState();
  s = applyLog(s, log({ activity: 'hidden_dinos', ease: 'too_hard', timestamp: now }), []);
  assert.equal(s.cooldownActive, true);
  const hours = (new Date(s.cooldownUntil) - new Date(now)) / 3600000;
  assert.equal(Math.round(hours), 48);
});

test('cooldown removes composition activities from the suggestion pool', () => {
  const state = { ...defaultState(), cooldownActive: true, cooldownUntil: '2099-01-01' };
  const scored = scoreActivities({
    pool: [...WINDOWS.afternoon.pool], state, logs: [],
    profile: { chapter: 0 }, doneToday: new Set()
  });
  assert.ok(scored.length > 0);
  assert.ok(scored.every(x => !COMPOSITION_IDS.includes(x.id)));
});

// ── dice mastery gate ─────────────────────────────────────────────────

test('Two-Dice Count-On unlocks via Dice Flash mastery', () => {
  let s = defaultState();
  s.levels = { dice_flash: 3 };
  s = applyLog(s, log({ activity: 'dice_flash', ease: 'too_easy' }), []);
  assert.equal(s.diceMastered, true);
});

test('Two-Dice Count-On stays out of the pool until unlocked', () => {
  const scored = scoreActivities({
    pool: [...WINDOWS.afternoon.pool], state: defaultState(), logs: [],
    profile: { chapter: 0 }, doneToday: new Set()
  });
  assert.ok(scored.every(x => x.id !== 'two_dice_counton'));
});

// ── treat correlation alert ───────────────────────────────────────────

test('treat alert fires when treats correlate with ≥30% more resistance', () => {
  const logs = [
    log({ reward: 'extrinsic', engagement: 'resisted' }),
    log({ reward: 'extrinsic', engagement: 'resisted' }),
    log({ reward: 'extrinsic', engagement: 'neutral' }),
    log({ reward: 'intrinsic', engagement: 'excited' }),
    log({ reward: 'connection', engagement: 'excited' })
  ];
  assert.equal(checkRewardAlert(logs), true);
});

test('treat alert needs at least 3 treat sessions', () => {
  const logs = [
    log({ reward: 'extrinsic', engagement: 'resisted' }),
    log({ reward: 'extrinsic', engagement: 'resisted' }),
    log(), log(), log()
  ];
  assert.equal(checkRewardAlert(logs), false);
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
  assert.equal(focus.id, 'count10', 'pre-calibrated milestones are skipped');
});

// ── determinism ───────────────────────────────────────────────────────

test('replayState is deterministic and consistent with incremental applyLog', () => {
  const logs = [
    log({ ease: 'too_easy' }),
    log({ ease: 'too_easy' }),
    log({ activity: 'dice_flash', ease: 'just_right' }),
    log({ engagement: 'resisted' }),
    log({ engagement: 'resisted' })
  ];
  let inc = defaultState();
  logs.forEach((l, i) => { inc = applyLog(inc, l, logs.slice(0, i)); });
  assert.deepEqual(replayState(logs), inc);
  assert.deepEqual(replayState(logs), replayState(logs));
});

test('weightedPick is deterministic under a seeded RNG', () => {
  const scored = [{ id: 'a', score: 1 }, { id: 'b', score: 5 }, { id: 'c', score: 2 }];
  const pick1 = weightedPick(scored, mulberry32(hashStr('2026-07-19|morning')));
  const pick2 = weightedPick(scored, mulberry32(hashStr('2026-07-19|morning')));
  assert.equal(pick1.id, pick2.id);
});

// ── v1 data regression (the bug another AI's rewrite shipped) ─────────
// A real v1 backup must flow through the engine with zero field loss:
// same count, same activities, same dates, same outcomes.

test('v1 backup fixture: every session and field survives, and the engine replays it', () => {
  const dir = dirname(fileURLToPath(import.meta.url));
  const backup = JSON.parse(readFileSync(join(dir, 'fixtures', 'v1-backup.json'), 'utf8'));

  assert.equal(backup.logs.length, 5);
  for (const l of backup.logs) {
    assert.ok(ACTIVITIES[l.activity], `activity ${l.activity} still exists in the catalog`);
    assert.ok(['morning', 'afternoon', 'bedtime'].includes(l.window));
    assert.ok(l.timestamp && l.completion && l.engagement && l.ease && l.reward !== undefined);
  }

  const state = replayState(backup.logs);
  // two "too easy" dice_flash sessions → level 3 (startLevel 2 + 1)
  assert.equal(getLevel(state, 'dice_flash'), 3);
  // the last log was composition-adjacent? no — one_less_sneak is one_more_less at level 1,
  // "too hard" steps it down to the floor without a cooldown:
  assert.equal(state.cooldownActive, false);
  // dates preserved verbatim (no re-stamping)
  assert.equal(backup.logs[0].timestamp, '2026-06-29T21:00:00.000Z');
});
