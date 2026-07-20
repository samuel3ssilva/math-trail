// Reward observation — deliberately humble statistics.
// The rule may only DESCRIBE the log, never conclude: it suppresses itself on
// small samples and always exposes group sizes for the UI to display.
import test from 'node:test';
import assert from 'node:assert/strict';
import { rewardObservation, REWARD_MIN_PER_GROUP, REWARD_MIN_DELTA } from '../js/engine.mjs';

const mk = (reward, engagement = 'neutral', completion = 'full') =>
  ({ reward, engagement, completion });

test('insufficient sample: fewer than the minimum in EITHER group suppresses the observation', () => {
  // 4 treat / 10 other — treat group below minimum
  const logs = [
    ...Array.from({ length: 4 }, () => mk('extrinsic', 'resisted')),
    ...Array.from({ length: 10 }, () => mk('intrinsic', 'excited'))
  ];
  const r = rewardObservation(logs);
  assert.equal(r.status, 'insufficient');
  assert.equal(r.treatCount, 4);
  assert.equal(r.otherCount, 10);
});

test('imbalanced groups: a big non-treat group cannot compensate a tiny treat group', () => {
  const logs = [
    ...Array.from({ length: REWARD_MIN_PER_GROUP - 1 }, () => mk('extrinsic', 'resisted')),
    ...Array.from({ length: 50 }, () => mk('connection', 'excited'))
  ];
  assert.equal(rewardObservation(logs).status, 'insufficient');
});

test('apparent difference with a low sample stays suppressed (no early conclusions)', () => {
  // 3 treat sessions, all resisted — dramatic-looking, but far too little data
  const logs = [
    ...Array.from({ length: 3 }, () => mk('extrinsic', 'resisted')),
    ...Array.from({ length: 3 }, () => mk('intrinsic', 'excited'))
  ];
  assert.equal(rewardObservation(logs).status, 'insufficient');
});

test('no relevant difference: enough data, similar rates → no_signal', () => {
  const logs = [
    ...Array.from({ length: 6 }, (_, i) => mk('extrinsic', i < 2 ? 'resisted' : 'excited')),
    ...Array.from({ length: 6 }, (_, i) => mk('intrinsic', i < 2 ? 'resisted' : 'excited'))
  ];
  const r = rewardObservation(logs);
  assert.equal(r.status, 'no_signal');
  assert.ok(Math.abs(r.treatResistRate - r.otherResistRate) < REWARD_MIN_DELTA);
});

test('observation: enough data in both groups AND a large difference', () => {
  const logs = [
    ...Array.from({ length: 6 }, (_, i) => mk('extrinsic', i < 4 ? 'resisted' : 'neutral')),
    ...Array.from({ length: 8 }, () => mk('intrinsic', 'excited'))
  ];
  const r = rewardObservation(logs);
  assert.equal(r.status, 'observation');
  assert.equal(r.treatCount, 6);
  assert.equal(r.otherCount, 8);
});

test('"connection" counts in the non-treat baseline', () => {
  const logs = [
    ...Array.from({ length: 5 }, () => mk('extrinsic', 'resisted')),
    ...Array.from({ length: 3 }, () => mk('intrinsic', 'excited')),
    ...Array.from({ length: 2 }, () => mk('connection', 'excited'))
  ];
  const r = rewardObservation(logs);
  assert.equal(r.otherCount, 5, 'intrinsic + connection together reach the minimum');
  assert.equal(r.status, 'observation');
});

test('missing/undefined reward fields are excluded rather than guessed', () => {
  const logs = [
    ...Array.from({ length: 5 }, () => mk('extrinsic', 'resisted')),
    ...Array.from({ length: 5 }, () => mk(undefined, 'excited'))
  ];
  const r = rewardObservation(logs);
  assert.equal(r.otherCount, 0, 'unknown rewards are not counted as a group');
  assert.equal(r.status, 'insufficient');
});

test('a refused session counts as resistance even with neutral mood', () => {
  const logs = [
    ...Array.from({ length: 5 }, () => mk('extrinsic', 'neutral', 'refused')),
    ...Array.from({ length: 5 }, () => mk('intrinsic', 'neutral', 'full'))
  ];
  assert.equal(rewardObservation(logs).status, 'observation');
});
