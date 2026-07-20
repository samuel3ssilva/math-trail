// Demo mode — exclusively synthetic, fully reproducible.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { generateDemoData, DEMO_PROFILE } from '../js/demo.mjs';
import { buildDemoArtifact } from '../scripts/generate-demo.mjs';
import { mulberry32 } from '../js/engine.mjs';
import { validateLog } from '../js/storage.mjs';

const dir = dirname(fileURLToPath(import.meta.url));

test('the committed demo artifact matches a fresh generation exactly (fixed seed)', () => {
  const committed = JSON.parse(readFileSync(join(dir, '..', 'demo', 'generated', 'demo-data.json'), 'utf8'));
  const fresh = buildDemoArtifact();
  assert.deepEqual(fresh, committed, 'regeneration is byte-stable; rerun scripts/generate-demo.mjs if intentional');
});

test('generation is deterministic: same seed + same base date → identical output', () => {
  const a = generateDemoData({ baseDate: new Date('2026-07-01T12:00:00.000Z'), rng: mulberry32(42) });
  const b = generateDemoData({ baseDate: new Date('2026-07-01T12:00:00.000Z'), rng: mulberry32(42) });
  assert.deepEqual(a, b);
});

test('every generated session is schema-valid', () => {
  const { logs } = generateDemoData({ baseDate: new Date('2026-07-01T12:00:00.000Z'), rng: mulberry32(42) });
  assert.ok(logs.length > 0);
  for (const l of logs) assert.deepEqual(validateLog(l), [], JSON.stringify(l));
});

test('demo data is synthetic by construction: placeholder profile, empty notes, marker set', () => {
  const data = generateDemoData({ baseDate: new Date('2026-07-01T12:00:00.000Z'), rng: mulberry32(42) });
  assert.equal(data.synthetic, true);
  assert.deepEqual(data.profile, { ...DEMO_PROFILE });
  assert.ok(data.logs.every(l => l.notes === ''), 'no free-text that could carry real observations');
});
