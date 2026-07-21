// Header title/subtitle rules. js/app.mjs touches the DOM at module scope
// (document.getElementById at import time), so it is not importable in node —
// like the other UI guards in this repo (see xss.test.mjs), this asserts the
// decoupled logic at the source. The rendered result is confirmed in a browser.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const app = readFileSync(join(ROOT, 'js/app.mjs'), 'utf8');

// Isolate the renderHeader body so assertions can't match unrelated code.
const start = app.indexOf('function renderHeader');
assert.ok(start !== -1, 'renderHeader must exist');
const body = app.slice(start, app.indexOf('\n}', start) + 2);

test('a profile with no name shows the product name as the title', () => {
  // title = p.name ? (personalized) : 'Math Trail'  → empty name hits the fallback
  assert.match(body, /const title\s*=\s*p\.name\s*\?[\s\S]*:\s*'Math Trail'/,
    "title must fall back to 'Math Trail' when the profile has no name");
});

test('the subtitle is decoupled from the name — a nameless profile with a valid birth still shows the age', () => {
  const subtitleLine = body.split('\n').find(l => l.includes('headerSub'));
  assert.ok(subtitleLine, 'the subtitle assignment must exist');
  // The regression this guards: the subtitle used to read `p.name ? ageString() : tagline`,
  // so removing the demo name also dropped the age. It must key off the birth now.
  assert.doesNotMatch(subtitleLine, /p\.name\s*\?/,
    'the subtitle must not branch on the name');
  assert.match(body, /hasBirth\s*\?\s*ageString\(\)\s*:\s*t\('app_tagline'\)/,
    'a valid birth shows the age; otherwise the tagline');
  assert.match(body, /hasBirth\s*=\s*\/\^\\d\{4\}/,
    'the subtitle decision validates the birth month');
});
