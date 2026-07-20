// Zero-dependency lint + format gate (see docs/adr/0003-no-tooling-deps.md).
// Checks are deliberately few and high-signal:
//   syntax  — every module parses (node --check equivalent via dynamic import syntax check)
//   format  — no tabs, no trailing whitespace, newline at EOF
//   layering— UI cannot be imported by domain modules; engine stays dependency-light
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const files = execFileSync('git', ['ls-files'], { encoding: 'utf8' })
  .split('\n').filter(Boolean);

const errors = [];

for (const f of files.filter(f => /\.(mjs|js)$/.test(f))){
  try { execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' }); }
  catch (e) { errors.push(`${f}: syntax error\n${e.stderr}`); }
}

for (const f of files.filter(f => /\.(mjs|js|css|html|json|md|yml)$/.test(f))){
  const src = readFileSync(f, 'utf8');
  if (/\t/.test(src) && !f.endsWith('.md')) errors.push(`${f}: tab character (spaces only)`);
  const trailing = src.split('\n').findIndex(l => / $/.test(l));
  if (trailing !== -1 && !f.endsWith('.md')) errors.push(`${f}: trailing whitespace on line ${trailing + 1}`);
  if (src.length && !src.endsWith('\n')) errors.push(`${f}: missing newline at EOF`);
}

// layering: domain modules must not import the UI layer
for (const f of ['js/engine.mjs', 'js/storage.mjs', 'js/time.mjs', 'js/demo.mjs']){
  const src = readFileSync(f, 'utf8');
  if (/from '\.\/app\.mjs'/.test(src)) errors.push(`${f}: domain module imports the UI layer`);
}

if (errors.length){
  console.error(`lint: ${errors.length} problem(s)\n` + errors.map(e => `  ✗ ${e}`).join('\n'));
  process.exit(1);
}
console.log(`lint: OK (${files.length} tracked files checked)`);
