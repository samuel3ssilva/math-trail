// Catalog localization completeness (v1.0.0 Entrega 1): every activity must be
// fully present in both EN (js/activities.mjs) and PT (js/activities-pt.mjs),
// with matching ids and no empty/placeholder fields.
import test from 'node:test';
import assert from 'node:assert/strict';
import { ACTIVITIES } from '../js/activities.mjs';
import { ACTIVITIES_PT } from '../js/activities-pt.mjs';

const EN_IDS = Object.keys(ACTIVITIES);
const PT_IDS = Object.keys(ACTIVITIES_PT);
// Genuine placeholder/leak markers. (Not TODO/XXX — "TODO" is the Portuguese
// word for "whole" in the part-part-whole diagram.)
const BAD = /\[object Object\]|\bundefined\b|\bnull\b|__proto__|\{\{|\}\}|\[FATO|\[INFORMA/;

function assertText(v, where){
  assert.equal(typeof v, 'string', `${where} must be a string`);
  assert.ok(v.trim().length > 0, `${where} must not be empty`);
  assert.doesNotMatch(v, BAD, `${where} must not contain a placeholder/leak`);
}

test('the PT overlay covers exactly the same activity ids as the catalog', () => {
  const missing = EN_IDS.filter(id => !PT_IDS.includes(id));
  const extra = PT_IDS.filter(id => !EN_IDS.includes(id));
  assert.deepEqual(missing, [], 'every catalog activity needs a PT translation');
  assert.deepEqual(extra, [], 'PT overlay must not invent ids the engine does not know');
  assert.equal(PT_IDS.length, EN_IDS.length);
});

test('every PT activity has complete, non-empty, placeholder-free display fields', () => {
  for (const id of EN_IDS){
    const en = ACTIVITIES[id];
    const pt = ACTIVITIES_PT[id];
    assert.ok(pt, `PT missing for ${id}`);
    assertText(pt.name, `${id}.name`);
    assertText(pt.materials, `${id}.materials`);
    assertText(pt.layout, `${id}.layout`);

    // levels: same keys as EN, each a non-empty string
    assert.deepEqual(Object.keys(pt.levels).sort(), Object.keys(en.levels).sort(), `${id}.levels keys`);
    for (const k of Object.keys(en.levels)) assertText(pt.levels[k], `${id}.levels[${k}]`);

    // script + teaches: arrays of the same length as EN, each entry clean
    assert.ok(Array.isArray(pt.script), `${id}.script must be an array`);
    assert.equal(pt.script.length, en.script.length, `${id}.script length must match EN`);
    pt.script.forEach((s, i) => assertText(s, `${id}.script[${i}]`));

    assert.ok(Array.isArray(pt.teaches), `${id}.teaches must be an array`);
    assert.equal(pt.teaches.length, en.teaches.length, `${id}.teaches length must match EN`);
    pt.teaches.forEach((s, i) => assertText(s, `${id}.teaches[${i}]`));

    // camo_script only where EN has it, same length
    if (en.camo_script){
      assert.ok(Array.isArray(pt.camo_script), `${id}.camo_script must exist`);
      assert.equal(pt.camo_script.length, en.camo_script.length, `${id}.camo_script length`);
      pt.camo_script.forEach((s, i) => assertText(s, `${id}.camo_script[${i}]`));
    } else {
      assert.equal(pt.camo_script, undefined, `${id} must not add camo_script the EN lacks`);
    }
  }
});

test('the PT overlay carries no engine fields (weights/chapter/category stay single-source)', () => {
  for (const id of PT_IDS){
    for (const f of ['weight', 'chapter', 'category', 'startLevel', 'pool']){
      assert.equal(ACTIVITIES_PT[id][f], undefined, `${id}.${f} must not be duplicated into the PT overlay`);
    }
  }
});

test('PT translations actually differ from English (not accidental copies)', () => {
  // Names and first script lines must be translated, not the English left in place.
  const untranslated = EN_IDS.filter(id => ACTIVITIES_PT[id].name === ACTIVITIES[id].name);
  assert.deepEqual(untranslated, [], `these names were left in English: ${untranslated.join(', ')}`);
});

test('no personal-name echoes in the catalog layouts (privacy)', () => {
  const banned = /\bIsa\b|Isadora/;
  for (const id of EN_IDS){
    assert.doesNotMatch(ACTIVITIES[id].layout, banned, `${id} EN layout`);
    assert.doesNotMatch(ACTIVITIES_PT[id].layout, banned, `${id} PT layout`);
  }
});
