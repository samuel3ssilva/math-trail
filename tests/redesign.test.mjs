// Redesigned user journeys — behavior the UX pass changed or introduced.
import test from 'node:test';
import assert from 'node:assert/strict';

import { I18N } from '../js/i18n.mjs';
import { MILESTONES } from '../js/activities.mjs';
import { clampSessionMinutes } from '../js/time.mjs';
import { scoreActivities, defaultState, weightedPick, mulberry32 } from '../js/engine.mjs';
import { WINDOWS } from '../js/activities.mjs';

// ── i18n completeness: the interface may never fall back to raw keys ──

test('every milestone has a localized label and detail in BOTH languages', () => {
  for (const m of MILESTONES){
    for (const lang of ['pt', 'en']){
      assert.ok(I18N[lang]['ms_' + m.id], `${lang} missing ms_${m.id}`);
      assert.ok(I18N[lang]['msd_' + m.id], `${lang} missing msd_${m.id}`);
    }
  }
});

test('PT and EN dictionaries cover exactly the same keys (no silent drift)', () => {
  const pt = Object.keys(I18N.pt).sort();
  const en = Object.keys(I18N.en).sort();
  assert.deepEqual(pt.filter(k => !en.includes(k)), [], 'keys only in PT');
  assert.deepEqual(en.filter(k => !pt.includes(k)), [], 'keys only in EN');
});

test('no grading language: percent signs and streak wording stay out of stat strings', () => {
  for (const lang of ['pt', 'en']){
    for (const key of ['stat_excited', 'stat_full', 'hs_exc_n']){
      assert.ok(!/%/.test(I18N[lang][key]), `${lang}.${key} must not be a percentage label`);
    }
  }
});

test('evaluative language is banned from EVERY visible interface string', () => {
  // Engine internals may stay technical; the parent-facing dictionary may not.
  const banned = [
    /dominad/i, /mastered/i,
    /sessões fortes/i, /strong session/i,
    /subiu de nível/i, /level up/i,
    /voltou para o nível/i, /stepped down/i,
    /caminho até o 10/i, /path to 10/i,
    /\bfracasso\b/i, /\bfailure\b/i
  ];
  for (const lang of ['pt', 'en']){
    for (const [key, value] of Object.entries(I18N[lang])){
      for (const rx of banned){
        assert.ok(!rx.test(String(value)), `${lang}.${key} contains banned wording (${rx}): "${value}"`);
      }
    }
  }
});

test('optional-opportunity framing is explicit in the plan copy', () => {
  assert.match(I18N.pt.plan_sub, /nenhuma/i, 'PT copy must say choosing none is fine');
  assert.match(I18N.en.plan_sub, /none/i, 'EN copy must say choosing none is fine');
});

test('the ease question asks about the challenge, not the child', () => {
  assert.equal(I18N.pt.lbl_ease.includes('desafio'), true);
  assert.ok(!/cognitive/i.test(I18N.en.lbl_ease));
});

// ── session duration clamp (audit F3) ────────────────────────────────

test('clampSessionMinutes: normal, minimum and forgotten-timer cases', () => {
  const start = '2026-07-20T12:00:00.000Z';
  const at = mins => new Date('2026-07-20T12:00:00.000Z').getTime() + mins * 60000;
  assert.equal(clampSessionMinutes(start, at(7)), 7, 'normal session');
  assert.equal(clampSessionMinutes(start, at(0.2)), 1, 'sub-minute rounds up to the 1-minute floor');
  assert.equal(clampSessionMinutes(start, at(9 * 60)), 120, 'forgotten timer clamps to the cap');
  assert.equal(clampSessionMinutes(start, at(50), 30), 30, 'cap is configurable');
});

// ── localized suggestion reasons (audit C3) ──────────────────────────

test('scoreActivities uses the localized milestone name in its reason', () => {
  const tr = k => (k === 'ms_count10' ? 'Contagem 6–10, um a um' : k === 'r_gap' ? 'Preenche a lacuna atual:' : k);
  const scored = scoreActivities({
    pool: [...WINDOWS.afternoon.pool], state: defaultState(), logs: [],
    profile: { chapter: 0 }, doneToday: new Set(), tr
  });
  const withGap = scored.find(x => x.reasons.some(r => r.includes('Preenche a lacuna')));
  assert.ok(withGap, 'some activity carries the current-gap reason');
  assert.ok(withGap.reasons.some(r => r.includes('Contagem 6–10, um a um')),
    'reason uses the localized milestone name, not the raw English label');
});

// ── regression: every scored pick path injects an RNG ────────────────

test('weightedPick with a seeded RNG never returns undefined on a scored pool', () => {
  const scored = scoreActivities({
    pool: [...WINDOWS.morning.pool], state: defaultState(), logs: [],
    profile: { chapter: 0 }, doneToday: new Set()
  });
  for (let i = 0; i < 20; i++){
    const pick = weightedPick(scored, mulberry32(i));
    assert.ok(pick && pick.id, `pick ${i} valid`);
  }
});
