// Privacy guard — fails the build if personal identifiers or private files
// ever reach the public repository or the deployable artifact.
// Banned patterns are base64-encoded so this file never matches itself.
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const decode = b64 => Buffer.from(b64, 'base64').toString('utf8');

// Personal identifiers that must never appear in public files:
// child's name, a previous pet-name key prefix, and the real birth month.
const BANNED = [
  { name: 'child-name', pattern: new RegExp(decode('aXNhZG9yYQ=='), 'i') },
  { name: 'legacy-pet-name-keys', pattern: new RegExp(decode('bHVuYV8='), 'i') },
  { name: 'real-birth-month', pattern: new RegExp(decode('MjAyNC0wMg==')) }
];

// Private directories/globs that must never be tracked or shipped.
const PRIVATE_PATH_PATTERNS = [
  /^private-local-data\//, /^backups\//, /^migration-input\//, /^exports\//,
  /math-trail-backup-.*\.json$/, /\.real\.json$/, /\.private\.json$/
];

const TEXT_EXT = /\.(mjs|js|html|css|json|md|yml|yaml|webmanifest|txt|svg)$/;

function gitTrackedFiles(){
  return execFileSync('git', ['ls-files'], { cwd: ROOT, encoding: 'utf8' })
    .split('\n').filter(Boolean);
}

function walk(dir, base = dir){
  const out = [];
  for (const name of readdirSync(dir)){
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p, base));
    else out.push(relative(base, p));
  }
  return out;
}

test('no personal identifiers in any git-tracked file', () => {
  const offenders = [];
  for (const file of gitTrackedFiles()){
    if (!TEXT_EXT.test(file)) continue;
    const content = readFileSync(join(ROOT, file), 'utf8');
    for (const { name, pattern } of BANNED){
      if (pattern.test(content)) offenders.push(`${file}: ${name}`);
    }
  }
  assert.deepEqual(offenders, [], `personal data found in tracked files`);
});

test('no private directories or real-backup files are git-tracked', () => {
  const offenders = gitTrackedFiles().filter(f => PRIVATE_PATH_PATTERNS.some(p => p.test(f)));
  assert.deepEqual(offenders, [], 'private paths must stay out of Git');
});

test('every committed fixture and demo artifact declares itself synthetic', () => {
  const dataFiles = gitTrackedFiles().filter(f =>
    (f.startsWith('tests/fixtures/') || f.startsWith('demo/')) && f.endsWith('.json'));
  assert.ok(dataFiles.length > 0, 'expected committed synthetic data files');
  for (const f of dataFiles){
    const d = JSON.parse(readFileSync(join(ROOT, f), 'utf8'));
    assert.equal(d._synthetic, true, `${f} must carry the _synthetic marker`);
  }
});

test('engine module stays pure: no wall clock, no storage, no DOM', () => {
  const src = readFileSync(join(ROOT, 'js', 'engine.mjs'), 'utf8');
  assert.ok(!/new Date\(\)/.test(src), 'no zero-arg new Date() in the engine');
  assert.ok(!/Date\.now\(\)/.test(src), 'no Date.now() in the engine');
  assert.ok(!/localStorage/.test(src), 'no storage access in the engine');
  assert.ok(!/document\.|window\./.test(src), 'no DOM access in the engine');
  assert.ok(!/Math\.random/.test(src), 'randomness must be injected');
});

test('UTC date keys are banned outside the time module', () => {
  const offenders = [];
  for (const file of gitTrackedFiles().filter(f => f.startsWith('js/') && f !== 'js/time.mjs')){
    const content = readFileSync(join(ROOT, file), 'utf8');
    if (/toISOString\(\)\.slice\(0,\s*10\)/.test(content)) offenders.push(file);
  }
  assert.deepEqual(offenders, [], '"today" must come from time.mjs localDateKey');
});

test('the deployable artifact (dist/) is free of personal data and private files', () => {
  const distDir = join(ROOT, 'dist');
  // Never skip: this is a security control. `npm test` builds dist/ first, so a
  // missing artifact means the guard would not have run — that must fail loudly.
  assert.ok(existsSync(distDir),
    'dist/ must exist so this scan actually runs — use `npm test` (or `npm run build` first)');
  const offenders = [];
  for (const file of walk(distDir)){
    if (PRIVATE_PATH_PATTERNS.some(p => p.test(file))) offenders.push(`${file}: private path`);
    if (!TEXT_EXT.test(file)) continue;
    const content = readFileSync(join(distDir, file), 'utf8');
    for (const { name, pattern } of BANNED){
      if (pattern.test(content)) offenders.push(`dist/${file}: ${name}`);
    }
  }
  assert.deepEqual(offenders, [], 'deployable artifact must be clean');
});
