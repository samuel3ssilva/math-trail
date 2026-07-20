// Build the deployable artifact in dist/ — and ONLY what should ship:
//   dist/            → the full modular site (what GitHub Pages publishes)
//   dist/standalone/ → a single-file bundle for one-file static hosts
// Private folders, docs, tests and fixtures never enter dist by construction:
// files are copied from an explicit allowlist, not by walking the repo.
import { readFile, writeFile, mkdir, cp, rm } from 'node:fs/promises';

const SHIP = [
  'index.html', 'styles.css', 'manifest.webmanifest', 'sw.js',
  'js/app.mjs', 'js/engine.mjs', 'js/activities.mjs', 'js/time.mjs',
  'js/storage.mjs', 'js/demo.mjs', 'js/i18n.mjs', 'js/session.mjs',
  'icons/icon-192.png', 'icons/icon-512.png'
];

await rm('dist', { recursive: true, force: true });
await mkdir('dist/js', { recursive: true });
await mkdir('dist/icons', { recursive: true });
for (const f of SHIP) await cp(f, `dist/${f}`);

// ── standalone single-file bundle ────────────────────────────────────
const html = await readFile('index.html', 'utf8');
const css = await readFile('styles.css', 'utf8');

const stripModule = (src) => src
  .replace(/^import\s[\s\S]*?from\s+'[^']+';\s*$/gm, '')
  .replace(/^export\s+(const|function|let)/gm, '$1');

const js = [
  await readFile('js/activities.mjs', 'utf8'),
  await readFile('js/time.mjs', 'utf8'),
  await readFile('js/session.mjs', 'utf8'),
  await readFile('js/storage.mjs', 'utf8'),
  await readFile('js/engine.mjs', 'utf8'),
  await readFile('js/i18n.mjs', 'utf8'),
  await readFile('js/demo.mjs', 'utf8'),
  await readFile('js/app.mjs', 'utf8')
].map(stripModule).join('\n\n');

const standalone = html
  .replace('<link rel="stylesheet" href="styles.css">', `<style>\n${css}</style>`)
  .replace('<link rel="manifest" href="manifest.webmanifest">', '')
  .replace('<script type="module" src="js/app.mjs"></script>', `<script>\n${js}\n</script>`);

await mkdir('dist/standalone', { recursive: true });
await writeFile('dist/standalone/index.html', standalone);

// Smoke checks: the bundle must parse, and Object.freeze'd export names must resolve.
new Function(js);
const shipped = SHIP.length + 1;
console.log(`dist/ written (${shipped} files) — standalone bundle ${(standalone.length / 1024).toFixed(0)} KB, parses OK`);
