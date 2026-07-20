// Static document — Portuguese-first, coherent before applyLang() runs.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { I18N } from '../js/i18n.mjs';

const HTML = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'index.html'), 'utf8');
const unesc = s => s.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>');

test('the document declares pt-BR and a Portuguese title/description', () => {
  assert.ok(HTML.includes('<html lang="pt-BR">'));
  assert.match(HTML, /<title>[^<]*matemática[^<]*<\/title>/i);
  assert.match(HTML, /meta name="description" content="[^"]*matemática[^"]*"/i);
});

test('no stale or English fallback strings survive in the static HTML', () => {
  for (const stale of ['Where she is on the path', 'path to 10', 'Cognitive ease',
                       "Today's sessions", 'Skill Trail', 'Adaptive State',
                       'Session window', 'Save session', 'Not a good moment today']){
    assert.ok(!HTML.includes(stale), `stale fallback found: ${stale}`);
  }
});

test('every data-i18n fallback matches the PT dictionary exactly (no drift without JS)', () => {
  const rx = /data-i18n="([\w-]+)"[^>]*>([^<]*)</g;
  let m, checked = 0;
  while ((m = rx.exec(HTML)) !== null){
    const [, key, text] = m;
    const v = I18N.pt[key];
    assert.ok(v !== undefined, `unknown i18n key in HTML: ${key}`);
    if (/</.test(v)) continue; // keys with markup are render-only
    assert.equal(unesc(text), v, `fallback for ${key} diverges from I18N.pt`);
    checked++;
  }
  assert.ok(checked >= 60, `expected a substantial static surface, checked ${checked}`);
});

test('initial accessible names are Portuguese and wired for language switching', () => {
  assert.ok(HTML.includes('data-i18n-aria="al_settings"'));
  assert.ok(/aria-label="Configura/.test(HTML));
  assert.ok(HTML.includes('data-i18n-aria="al_nav"'));
});
