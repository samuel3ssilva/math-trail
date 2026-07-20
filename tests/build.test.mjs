// Build artifact + PWA integrity. Runs the REAL build, then inspects dist/.
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = (...p) => join(ROOT, 'dist', ...p);

// Build once for this file's assertions.
execFileSync(process.execPath, ['build.mjs'], { cwd: ROOT, stdio: 'pipe' });

test('dist contains the complete deployable site and nothing else', () => {
  for (const f of ['index.html', 'styles.css', 'manifest.webmanifest', 'sw.js',
                   'js/app.mjs', 'js/engine.mjs', 'js/activities.mjs', 'js/time.mjs',
                   'js/storage.mjs', 'js/demo.mjs', 'js/i18n.mjs',
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

test('index.html in dist references only files that ship', () => {
  const html = readFileSync(dist('index.html'), 'utf8');
  for (const ref of ['styles.css', 'manifest.webmanifest', 'js/app.mjs']){
    assert.ok(html.includes(ref), `index.html should reference ${ref}`);
    assert.ok(existsSync(dist(ref)), `${ref} must ship`);
  }
});
