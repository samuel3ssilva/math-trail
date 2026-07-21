// Build artifact + PWA integrity. Inspects the real dist/ built by `npm test`.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = (...p) => join(ROOT, 'dist', ...p);

// dist/ is built ONCE by `npm test` before the runner starts. No test file may
// rebuild it: `node --test` runs files in parallel processes, so a rebuild here
// would delete dist/ underneath the privacy scan in tests/privacy.test.mjs.
assert.ok(existsSync(dist('index.html')),
  'dist/ must be built before the suite runs — use `npm test` (or `npm run build` first)');

test('dist contains the complete deployable site and nothing else', () => {
  for (const f of ['index.html', 'styles.css', 'manifest.webmanifest', 'sw.js',
                   'js/app.mjs', 'js/engine.mjs', 'js/activities.mjs', 'js/time.mjs',
                   'js/storage.mjs', 'js/demo.mjs', 'js/i18n.mjs', 'js/session.mjs', 'js/activities-pt.mjs',
                   'icons/icon-192.png', 'icons/icon-512.png', 'standalone/index.html']){
    assert.ok(existsSync(dist(f)), `missing from dist: ${f}`);
  }
  for (const forbidden of ['tests', 'docs', 'private-local-data', '.github',
                           'README.md', 'package.json', 'build.mjs']){
    assert.ok(!existsSync(dist(forbidden)), `must not ship: ${forbidden}`);
  }
});

test('the PWA manifest references icons that actually ship', () => {
  const manifest = JSON.parse(readFileSync(dist('manifest.webmanifest'), 'utf8'));
  assert.ok(manifest.name && manifest.start_url && manifest.display, 'core manifest fields');
  for (const icon of manifest.icons){
    assert.ok(existsSync(dist(icon.src)), `manifest icon missing: ${icon.src}`);
  }
});

test('every file in the service-worker shell list actually ships', () => {
  const sw = readFileSync(dist('sw.js'), 'utf8');
  const shell = [...sw.matchAll(/'(\.\/[^']*)'/g)].map(m => m[1].replace(/^\.\//, ''));
  assert.ok(shell.length >= 5, 'shell list found');
  for (const f of shell){
    if (f === '') continue; // './' root
    assert.ok(existsSync(dist(f)), `sw shell references a file that does not ship: ${f}`);
  }
});

test('the standalone bundle parses as a classic script and contains the app', () => {
  const html = readFileSync(dist('standalone', 'index.html'), 'utf8');
  const m = html.match(/<script>\n([\s\S]*)\n<\/script>/);
  assert.ok(m, 'inline script present');
  new Function(m[1]); // throws on syntax error
  assert.ok(m[1].includes('ACTIVITIES'), 'catalog bundled');
  assert.ok(!/type="module"/.test(html), 'no dangling module reference');
});

// Regression guard: a test file that rebuilds dist/ mid-run deletes the artifact
// underneath the parallel privacy scan — which then either crashes or, worse,
// silently skips and reports green. dist/ is built once, before the runner.
test('no test file rebuilds dist/ while the suite is running', () => {
  const testsDir = join(ROOT, 'tests');
  const offenders = readdirSync(testsDir)
    .filter(f => f.endsWith('.test.mjs'))
    // an actual child-process invocation of the build — not a mere mention
    .filter(f => /(execFileSync|execSync|spawnSync|spawn)\s*\([^;]{0,160}build\.mjs/
      .test(readFileSync(join(testsDir, f), 'utf8')));
  assert.deepEqual(offenders, [], 'dist/ must be built once by `npm test`, never by a test file');
});

test('index.html in dist references only files that ship', () => {
  const html = readFileSync(dist('index.html'), 'utf8');
  for (const ref of ['styles.css', 'manifest.webmanifest', 'js/app.mjs']){
    assert.ok(html.includes(ref), `index.html should reference ${ref}`);
    assert.ok(existsSync(dist(ref)), `${ref} must ship`);
  }
});
