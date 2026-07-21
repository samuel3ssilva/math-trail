// Portfolio documentation guards (v1.0.0): essential README links resolve,
// no stale/deprecated wording is presented as current, no personal data leaks
// into assets, and the build carries both languages.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = p => readFileSync(join(ROOT, p), 'utf8');

const README = read('README.md');
const README_PT = read('README.pt-BR.md');

test('the README links to the essentials, and each local target exists', () => {
  const required = [
    'https://samuel3ssilva.github.io/math-trail/?demo=1', // live synthetic demo
    'https://github.com/samuel3ssilva/math-trail/releases/latest', // latest release
    'docs/case-study.md',
    'docs/ai-assisted-engineering.md',
    'docs/model-card.md',
    'docs/architecture.md',
    'README.pt-BR.md'
  ];
  for (const link of required) assert.ok(README.includes(link), `README must link to ${link}`);
  for (const link of required){
    if (link.startsWith('http')) continue;
    assert.ok(existsSync(join(ROOT, link)), `README link target missing: ${link}`);
  }
});

test('every relative markdown link in both READMEs resolves to a real file', () => {
  for (const [name, md] of [['README.md', README], ['README.pt-BR.md', README_PT]]){
    const links = [...md.matchAll(/\]\((?!https?:|#|mailto:)([^)]+)\)/g)].map(m => m[1]);
    for (const raw of links){
      const path = raw.split('#')[0];
      if (!path) continue;
      assert.ok(existsSync(join(ROOT, path)), `${name}: broken link → ${path}`);
    }
  }
});

test('the READMEs present no deprecated wording as a current feature', () => {
  const banned = /cognitive ease|3-tap logging|path to 10|"?Adaptive State"? (panel|section|feature)|\b(18|72) tests\b/i;
  assert.doesNotMatch(README, banned, 'README.md carries stale wording');
  assert.doesNotMatch(README_PT, banned, 'README.pt-BR.md carries stale wording');
});

test('the current test count is stated, not an old one', () => {
  assert.match(README, /153 (automated )?tests/, 'README must state the current test count');
  assert.match(README_PT, /153 testes/, 'README.pt-BR must state the current test count');
});

test('shipped doc assets carry no personal-name echo', () => {
  const dir = join(ROOT, 'docs', 'assets');
  const banned = /\bIsa\b/; // full name is covered by the base privacy guard
  for (const f of readdirSync(dir)){
    if (!/\.(svg|md|txt|json)$/.test(f)) continue; // text assets only
    assert.doesNotMatch(readFileSync(join(dir, f), 'utf8'), banned, `docs/assets/${f}`);
  }
});

test('the build carries both languages (EN + PT catalog)', () => {
  const distJs = join(ROOT, 'dist', 'js', 'activities-pt.mjs');
  if (!existsSync(distJs)){ // dist is built by `npm test`; guard rather than skip
    assert.fail('dist/js/activities-pt.mjs missing — the PT catalog must ship');
  }
  const standalone = read('dist/standalone/index.html');
  assert.ok(standalone.includes('Dice Flash'), 'EN catalog must be in the bundle');
  assert.ok(standalone.includes('Flash de Dado'), 'PT catalog must be in the bundle');
});
