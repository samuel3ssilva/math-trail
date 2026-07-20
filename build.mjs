// Build a single-file dist/index.html for one-file static hosts (e.g. tiiny.host).
// Inlines styles.css and the three JS modules, stripping import/export statements —
// the modules only import from each other, in a fixed order, so this stays safe.
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const html = await readFile('index.html', 'utf8');
const css = await readFile('styles.css', 'utf8');

const stripModule = (src) => src
  .replace(/^import\s[\s\S]*?from\s+'[^']+';\s*$/gm, '')
  .replace(/^export\s+(const|function|let)/gm, '$1');

const js = [
  await readFile('js/activities.mjs', 'utf8'),
  await readFile('js/engine.mjs', 'utf8'),
  await readFile('js/app.mjs', 'utf8')
].map(stripModule).join('\n\n');

let out = html
  .replace('<link rel="stylesheet" href="styles.css">', `<style>\n${css}</style>`)
  .replace('<script type="module" src="js/app.mjs"></script>', `<script>\n${js}\n</script>`);

await mkdir('dist', { recursive: true });
await writeFile('dist/index.html', out);

// Smoke check: the bundle must still parse as classic script.
new Function(js);
console.log(`dist/index.html written (${(out.length / 1024).toFixed(0)} KB), bundle parses OK`);
