// Persistent-XSS defenses (threat model T3).
// Two layers, both tested with real functions:
//   1. CONTRACT — malicious ids/activities/structures never enter the store;
//   2. RENDERING — user text can only ever become textContent, enforced by
//      source assertions on the render path (no DOM emulator dependency).
// Payloads below exist as TEST TEXT ONLY and are never executed.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { validateLog, normalizeLog, validateProfile, validateBackup, importBackup,
         makeRepo, KEYS, NOTES_MAX_LENGTH } from '../js/storage.mjs';
import { replayState } from '../js/engine.mjs';

const APP_SRC = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'js', 'app.mjs'), 'utf8');

const PAYLOAD_IMG = '<img src=x onerror=alert(1)>';
const PAYLOAD_SCRIPT = '</p><script>alert(1)</script>';

function memStore(init = {}){
  const m = new Map(Object.entries(init));
  return {
    getItem: k => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: k => m.delete(k),
    dump: () => Object.fromEntries(m)
  };
}
const base = (over = {}) => ({
  id: 1753050000000, timestamp: '2026-07-20T15:00:00.000Z', window: 'afternoon',
  activity: 'dice_flash', completion: 'full', engagement: 'excited',
  ease: 'just_right', reward: 'intrinsic', ...over
});

// ── contract layer ───────────────────────────────────────────────────

test('notes carrying HTML payloads are accepted as PLAIN STRINGS and normalized untouched', () => {
  for (const payload of [PAYLOAD_IMG, PAYLOAD_SCRIPT]){
    const l = base({ notes: payload });
    assert.deepEqual(validateLog(l), [], 'a note is opaque text — the contract does not care what it says');
    assert.equal(normalizeLog(l).notes, payload, 'kept verbatim as data, never as markup');
  }
});

test('ids crafted to escape attributes are rejected', () => {
  for (const bad of ['1);alert(1);(', '" onmouseover="alert(1)', {}, [], NaN, Infinity, '1 OR 1=1']){
    assert.ok(validateLog(base({ id: bad })).some(p => p.includes('id')), `id rejected: ${String(bad)}`);
  }
});

test('activities outside the known catalog are rejected (no silent migration)', () => {
  for (const bad of ['<script>', 'unknown_activity', '', 42, { name: 'x' }]){
    assert.ok(validateLog(base({ activity: bad })).some(p => p.includes('activity')), `activity rejected: ${String(bad)}`);
  }
});

test('oversized notes and non-string notes are rejected', () => {
  assert.ok(validateLog(base({ notes: 'a'.repeat(NOTES_MAX_LENGTH + 1) })).length > 0);
  assert.ok(validateLog(base({ notes: { html: PAYLOAD_IMG } })).length > 0);
});

test('imported profiles: objects/arrays in textual fields and implausible values are rejected', () => {
  assert.equal(validateProfile({ name: { toString: 'x' } }).ok, false);
  assert.equal(validateProfile({ name: ['a'] }).ok, false);
  assert.equal(validateProfile({ birth: '2024-13' }).ok, false);
  assert.equal(validateProfile({ birth: '1800-05' }).ok, false);
  assert.equal(validateProfile({ chapter: 99 }).ok, false);
  assert.equal(validateProfile({ name: PAYLOAD_IMG.slice(0, 30), birth: '2023-06', chapter: 4 }).ok, true,
    'a weird but string name is data; rendering makes it inert via textContent');
});

test('extra/unknown fields (including __proto__ tricks) never survive normalization', () => {
  const dirty = JSON.parse(`{"id":1,"timestamp":"2026-07-20T15:00:00.000Z","window":"morning",
    "activity":"dice_flash","completion":"full","engagement":"excited","ease":"just_right",
    "reward":"intrinsic","evil":"${'x'}","__proto__":{"polluted":true},"onclick":"alert(1)"}`);
  const clean = normalizeLog(dirty);
  assert.deepEqual(Object.keys(clean).sort(),
    ['activity','completion','ease','engagement','id','reward','timestamp','window'].sort());
  assert.equal({}.polluted, undefined, 'prototype not polluted');
});

test('a malicious backup rejects wholesale and existing data is untouched (rollback intact)', () => {
  const store = memStore({ [KEYS.logs]: JSON.stringify([base({ id: 7 })]) });
  const before = JSON.stringify(store.dump());
  const res = importBackup(store, {
    schemaVersion: 2,
    logs: [base({ id: '"><svg onload=alert(1)>' })],
    profile: { name: { $$evil: true } }
  }, { replay: replayState });
  assert.equal(res.ok, false);
  assert.equal(JSON.stringify(store.dump()), before, 'store byte-identical after rejected import');
});

// ── rendering layer (source assertions on the history renderer) ──────

function renderSection(){
  const a = APP_SRC.indexOf('function renderLogList()');
  const b = APP_SRC.indexOf('\nfunction ', a + 10);
  return APP_SRC.slice(a, b);
}

test('history renderer never interpolates log fields into markup or attributes', () => {
  const src = renderSection();
  // Log-field interpolation is only legal on lines that build TEXT
  // (textContent via the mk() helper or plain string variables) — never on a
  // line that touches innerHTML, and never as an inline handler attribute.
  for (const line of src.split('\n')){
    if (/innerHTML/.test(line)){
      assert.ok(!/\$\{l\./.test(line), `log field interpolated into innerHTML: ${line.trim()}`);
      assert.ok(!/\$\{name/.test(line), `derived name interpolated into innerHTML: ${line.trim()}`);
    }
  }
  assert.ok(!src.includes('onclick='), 'no inline handler attributes');
  assert.ok(src.includes('textContent'), 'user data flows through textContent');
  assert.ok(src.includes('addEventListener'), 'handlers are listeners, not attributes');
});

test('the only innerHTML in the history renderer is the code-controlled empty state', () => {
  const src = renderSection();
  const uses = [...src.matchAll(/innerHTML/g)];
  assert.equal(uses.length, 1, 'exactly one innerHTML (trusted empty-state template)');
  assert.ok(src.includes("t('empty_history')"), 'and it renders only i18n-controlled text');
});
