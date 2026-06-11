#!/usr/bin/env node
/**
 * Reads the Playwright JSON report and writes one Markdown file per failing
 * test into ./issues/. Does NOT fix anything — pure reporting.
 *
 * Run after the suite:  node gen-issues.mjs
 */
import { readFileSync, writeFileSync, rmSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const RESULTS = 'results/results.json';
const ISSUES_DIR = 'issues';

if (!existsSync(RESULTS)) {
  console.error(`No report at ${RESULTS}. Run "npx playwright test" first.`);
  process.exit(1);
}

const report = JSON.parse(readFileSync(RESULTS, 'utf8'));

// Reset the issues folder.
if (existsSync(ISSUES_DIR)) {
  for (const f of readdirSync(ISSUES_DIR)) rmSync(join(ISSUES_DIR, f), { force: true });
} else {
  mkdirSync(ISSUES_DIR, { recursive: true });
}

const failures = [];

function lastError(test) {
  const results = test.results || [];
  const r = results[results.length - 1] || {};
  const err = r.error || (r.errors && r.errors[0]) || {};
  return {
    message: (err.message || '').replace(/\[[0-9;]*m/g, '').trim(),
    retries: results.length - 1,
    duration: r.duration,
  };
}

function severityFor(title, message) {
  const t = `${title} ${message}`.toLowerCase();
  if (/uncaught|crash|server error|could not be found|redirect|http status/.test(t)) return 'High';
  if (/console\.error|broken|overflow|heading|content/.test(t)) return 'Medium';
  return 'Low';
}

function routeFrom(titlePath) {
  const m = titlePath.join(' ').match(/\[([^\]]+)\]/);
  if (m) return m[1];
  const m2 = titlePath.join(' ').match(/(\/[\w\-./]*)/);
  return m2 ? m2[1] : 'N/A';
}

function walk(suite, titlePath, file) {
  const f = suite.file || file;
  const here = suite.title ? [...titlePath, suite.title] : titlePath;
  for (const spec of suite.specs || []) {
    for (const test of spec.tests || []) {
      // 'unexpected' = failed even after retries. 'flaky' = transient.
      if (test.status === 'unexpected' || test.status === 'flaky') {
        const titleFull = [...here, spec.title];
        const { message, retries, duration } = lastError(test);
        failures.push({
          file: f,
          line: spec.line,
          project: test.projectName || 'unknown',
          flaky: test.status === 'flaky',
          title: spec.title,
          titlePath: titleFull,
          route: routeFrom(titleFull),
          message,
          retries,
          duration,
        });
      }
    }
  }
  for (const child of suite.suites || []) walk(child, here, f);
}

for (const s of report.suites || []) walk(s, [], s.file);

// Sort: real failures first, then flaky; group by route.
failures.sort((a, b) => Number(a.flaky) - Number(b.flaky) || a.route.localeCompare(b.route));

const pad = (n) => String(n).padStart(3, '0');
let idx = 0;
const rows = [];
for (const fl of failures) {
  idx += 1;
  const id = `ISSUE-${pad(idx)}`;
  const sev = fl.flaky ? 'Flaky' : severityFor(fl.title, fl.message);
  const slug = fl.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
  const fname = `${id}-${slug}.md`;

  const body = `# ${id}: ${fl.title}

| Field | Value |
|-------|-------|
| **Severity** | ${sev} |
| **Route / Page** | \`${fl.route}\` |
| **Test project** | ${fl.project} |
| **Check** | ${fl.title} |
| **Status** | ${fl.flaky ? 'Flaky (passed only on retry)' : 'Failed (failed on all attempts)'} |
| **Attempts** | ${fl.retries + 1} |
| **Spec** | \`${fl.file}:${fl.line}\` |

## Full test path
${fl.titlePath.map((t) => `- ${t}`).join('\n')}

## Failure details
\`\`\`
${fl.message || '(no error message captured)'}
\`\`\`

## How to reproduce
1. Open the deployed web app.
2. Navigate to \`${fl.route}\`${fl.project === 'user' ? ' while signed in' : ' as a guest (signed out)'}.
3. Observe the condition described by the check **"${fl.title}"**.

## Re-run just this check
\`\`\`bash
cd web-tests
npx playwright test --project=${fl.project} -g ${JSON.stringify(fl.title)}
\`\`\`

> Auto-generated from Playwright results. Reporting only — not fixed.
`;
  writeFileSync(join(ISSUES_DIR, fname), body, 'utf8');
  rows.push({ id, sev, route: fl.route, project: fl.project, title: fl.title, file: fname });
}

const stats = report.stats || {};
const summary = `# Test Issues Summary

- **Generated:** ${new Date().toISOString()}
- **Total tests:** ${stats.expected ?? '?'} passed, ${stats.unexpected ?? '?'} failed, ${stats.flaky ?? '?'} flaky, ${stats.skipped ?? '?'} skipped
- **Issues reported:** ${rows.length} (one file each in \`issues/\`)

| ID | Severity | Route | Project | Check |
|----|----------|-------|---------|-------|
${rows.map((r) => `| [${r.id}](${r.file}) | ${r.sev} | \`${r.route}\` | ${r.project} | ${r.title} |`).join('\n')}

${rows.length === 0 ? '\n✅ No failing tests — no issues to report.\n' : ''}`;

writeFileSync(join(ISSUES_DIR, 'SUMMARY.md'), summary, 'utf8');
console.log(`Wrote ${rows.length} issue file(s) to ${ISSUES_DIR}/ (+ SUMMARY.md).`);
