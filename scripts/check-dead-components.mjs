#!/usr/bin/env node
/**
 * Dead / duplicate component guard.
 *
 * Background: a teammate once edited `underconstarctionsbanner.tsx`, a dead
 * duplicate of the real `UnderConstructionBanner.tsx` that was never imported,
 * so their change had no effect on the site. This guard fails CI when a
 * component file under web/src/components is never referenced anywhere in the
 * source tree — catching orphan/duplicate files before they cause confusion.
 *
 * Usage: node scripts/check-dead-components.mjs [appDir=web]
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, basename, extname, sep } from 'node:path';

const appDir = process.argv[2] || 'web';
const srcRoot = join(appDir, 'src');
const componentsRoot = join(srcRoot, 'components');

function walk(dir) {
  const out = [];
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const e of entries) {
    const p = join(dir, e);
    const s = statSync(p);
    if (s.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

const isSource = (f) => /\.(tsx|ts|jsx|js)$/.test(f);

// All source files (the haystack we search for references).
const allSources = walk(srcRoot).filter(isSource);

// Candidate component files (the needles that must be referenced).
const components = walk(componentsRoot)
  .filter((f) => /\.(tsx|jsx)$/.test(f))
  // index files are entry points; skip them.
  .filter((f) => basename(f).replace(/\.(tsx|jsx)$/, '') !== 'index');

// Pre-read every source file's text once.
const texts = new Map(allSources.map((f) => [f, readFileSync(f, 'utf8')]));

const dead = [];
for (const comp of components) {
  const name = basename(comp, extname(comp)); // e.g. UnderConstructionBanner
  let referenced = false;
  for (const [file, text] of texts) {
    if (file === comp) continue; // a file referencing itself doesn't count
    // Match the component name as a whole word OR in an import path.
    const re = new RegExp(`\\b${name}\\b`);
    if (re.test(text)) {
      referenced = true;
      break;
    }
  }
  if (!referenced) dead.push(relative('.', comp).split(sep).join('/'));
}

if (dead.length) {
  console.error('\n✖ Dead/duplicate component files (never referenced in src):\n');
  for (const d of dead) console.error(`   - ${d}`);
  console.error(
    '\nThese files are not imported anywhere. Editing them has no effect on the\n' +
      'site. Delete them, or import them where intended. (This guard exists to\n' +
      'prevent wrong-file edits like the duplicate banner incident.)\n'
  );
  process.exit(1);
}

console.log(`✓ No dead components: all ${components.length} component files under ${componentsRoot} are referenced.`);
