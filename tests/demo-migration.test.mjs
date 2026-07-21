// Demo-state migration + service-worker cache versioning (v1.0.0 blocker:
// returning visitors must see "Math Trail", not the old "Matemática da Alex",
// without any manual cache/localStorage clearing and without touching real data).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { migrateDemoProfile, DEMO_DATA_VERSION, generateDemoData } from '../js/demo.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// ── returning demo visitor with the old "Alex" profile ────────────────
test('the v1 demo profile ("Alex") is normalized so the title becomes the product name', () => {
  const old = { name: 'Alex', birth: '2023-06', chapter: 4 };
  const res = migrateDemoProfile(old, null);
  assert.equal(res.changed, true);
  assert.equal(res.profile.name, '', 'name cleared → renderHeader shows "Math Trail"');
  assert.equal(res.profile.birth, '2023-06', 'birth kept → the age subtitle still shows');
  assert.equal(res.profile.chapter, 4, 'chapter untouched');
  assert.equal(res.version, DEMO_DATA_VERSION);
});

test('migration is idempotent: once at the current version, nothing changes', () => {
  const migrated = { name: '', birth: '2023-06', chapter: 4 };
  const res = migrateDemoProfile(migrated, DEMO_DATA_VERSION);
  assert.equal(res.changed, false);
  assert.deepEqual(res.profile, migrated);
});

// ── real data must never be altered ───────────────────────────────────
test('a real profile is left byte-for-byte intact (name differs from the demo fingerprint)', () => {
  const real = { name: 'Sam', birth: '2022-01', chapter: 7 };
  const res = migrateDemoProfile(real, null);
  assert.equal(res.changed, false);
  assert.deepEqual(res.profile, real, 'real profile unchanged');
});

test('a profile that only partially matches the demo fingerprint is NOT touched', () => {
  // Same name but a different birth/chapter → not the demo, leave it alone.
  for (const p of [
    { name: 'Alex', birth: '2020-03', chapter: 4 },
    { name: 'Alex', birth: '2023-06', chapter: 1 },
    { name: 'Alexandra', birth: '2023-06', chapter: 4 }
  ]){
    assert.equal(migrateDemoProfile(p, null).changed, false, JSON.stringify(p));
  }
});

test('null/undefined profiles do not throw and report no change', () => {
  assert.equal(migrateDemoProfile(null, null).changed, false);
  assert.equal(migrateDemoProfile(undefined, null).changed, false);
});

// ── new visitor: a fresh demo already carries the product name ─────────
test('a freshly generated demo has an empty (product-name) profile', () => {
  const seed = () => 0.5;
  const { profile } = generateDemoData({ baseDate: new Date('2026-07-01T12:00:00.000Z'), rng: seed });
  assert.equal(profile.name, '', 'fresh demo → "Math Trail" title');
  assert.equal(profile.birth, '2023-06');
});

// ── service worker: cache is versioned and old caches are cleaned up ───
const sw = readFileSync(join(ROOT, 'sw.js'), 'utf8');

test('the service-worker cache version was bumped past v4 so returning users refetch the shell', () => {
  const m = sw.match(/const CACHE = 'math-trail-v(\d+)'/);
  assert.ok(m, 'CACHE must be a versioned name');
  assert.ok(Number(m[1]) >= 5, `cache must be > v4, found v${m[1]}`);
});

test('activate deletes every cache that is not the current one', () => {
  assert.match(sw, /caches\.keys\(\)[\s\S]*filter\(\(k\)\s*=>\s*k\s*!==\s*CACHE\)[\s\S]*caches\.delete/,
    'old caches must be removed on activate');
});

test('the new cache still precaches the full app shell', () => {
  const shell = [...sw.matchAll(/'(\.\/[^']*)'/g)].map(m => m[1]);
  for (const f of ['./index.html', './styles.css', './js/app.mjs', './js/demo.mjs', './manifest.webmanifest']){
    assert.ok(shell.includes(f), `shell must include ${f}`);
  }
});
